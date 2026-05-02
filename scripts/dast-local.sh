#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${DAST_APP_DIR:-examples/basic-lang-javascript}"
APP_PORT="${DAST_APP_PORT:-3000}"
APP_PATH="${DAST_APP_PATH:-/home/}"
HOST_TARGET="http://127.0.0.1:${APP_PORT}${APP_PATH}"
DOCKER_TARGET="http://host.docker.internal:${APP_PORT}${APP_PATH}"
TARGET="${1:-${DAST_TARGET_URL:-${DOCKER_TARGET}}}"
REPORT_DIR="${DAST_REPORT_DIR:-reports/zap}"
ZAP_MAX_MINS="${ZAP_MAX_MINS:-10}"
ZAP_SCAN_TYPE="${ZAP_SCAN_TYPE:-baseline}"
ZAP_SPIDER_MINS="${ZAP_SPIDER_MINS:-1}"
ZAP_FAIL_ON_ALERTS="${ZAP_FAIL_ON_ALERTS:-false}"
START_APP="${DAST_START_APP:-auto}"
APP_PID=""
ZAP_SCRIPT=""
REPORT_PREFIX=""
ZAP_SCRIPT_ARGS=()

cleanup() {
  if [ -n "${APP_PID}" ] && kill -0 "${APP_PID}" 2>/dev/null; then
    kill "${APP_PID}" 2>/dev/null || true
    wait "${APP_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

wait_for_url() {
  local url="$1"
  local retries="${2:-60}"

  for _ in $(seq 1 "${retries}"); do
    if curl --silent --fail --output /dev/null "${url}"; then
      return 0
    fi
    sleep 1
  done

  return 1
}

start_local_app() {
  local app_abs_dir="${ROOT_DIR}/${APP_DIR}"
  local next_bin="${app_abs_dir}/node_modules/.bin/next"

  if [ ! -x "${next_bin}" ]; then
    echo "Next.js binary not found at ${next_bin}."
    echo "Install the example app dependencies first, for example: (cd ${APP_DIR} && npm install)"
    exit 1
  fi

  echo "Starting local DAST target from ${APP_DIR} on port ${APP_PORT}..."
  (
    cd "${app_abs_dir}"
    "${next_bin}" dev -p "${APP_PORT}" renderer
  ) &
  APP_PID="$!"

  if ! wait_for_url "${HOST_TARGET}" 90; then
    echo "Timed out waiting for ${HOST_TARGET}."
    exit 1
  fi
}

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to run OWASP ZAP locally."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker, then re-run this command."
  exit 1
fi

if [[ "${TARGET}" == http://host.docker.internal:* || "${TARGET}" == https://host.docker.internal:* ]]; then
  if wait_for_url "${HOST_TARGET}" 3; then
    echo "Using existing local target ${HOST_TARGET}."
  elif [ "${START_APP}" = "auto" ] || [ "${START_APP}" = "true" ]; then
    start_local_app
  else
    echo "Target ${HOST_TARGET} is not reachable."
    echo "Start the app first or set DAST_START_APP=auto."
    exit 1
  fi
fi

mkdir -p "${ROOT_DIR}/${REPORT_DIR}"

case "${ZAP_SCAN_TYPE}" in
  baseline)
    ZAP_SCRIPT="zap-baseline.py"
    REPORT_PREFIX="zap-baseline-scan"
    ZAP_SCRIPT_ARGS=(-m "${ZAP_SPIDER_MINS}" -T "${ZAP_MAX_MINS}")
    ;;
  full)
    ZAP_SCRIPT="zap-full-scan.py"
    REPORT_PREFIX="zap-full-scan"
    ZAP_SCRIPT_ARGS=(-T "${ZAP_MAX_MINS}")
    ;;
  *)
    echo "Unsupported ZAP_SCAN_TYPE=${ZAP_SCAN_TYPE}. Use 'baseline' or 'full'."
    exit 1
    ;;
esac

DOCKER_ARGS=(
  run
  --rm
  -v "${ROOT_DIR}/${REPORT_DIR}:/zap/wrk:rw"
)

if [ "$(uname -s)" = "Linux" ]; then
  DOCKER_ARGS+=(--add-host=host.docker.internal:host-gateway)
fi

echo "Running OWASP ZAP ${ZAP_SCAN_TYPE} scan against ${TARGET}..."

ZAP_EXIT=0
docker "${DOCKER_ARGS[@]}" \
  ghcr.io/zaproxy/zaproxy:stable \
  "${ZAP_SCRIPT}" \
  -t "${TARGET}" \
  -r "${REPORT_PREFIX}.html" \
  -J "${REPORT_PREFIX}.json" \
  -w "${REPORT_PREFIX}.md" \
  -a \
  "${ZAP_SCRIPT_ARGS[@]}" || ZAP_EXIT=$?

echo "ZAP reports written to ${REPORT_DIR}/."

if [ "${ZAP_EXIT}" -eq 0 ]; then
  exit 0
fi

if [ "${ZAP_EXIT}" -eq 1 ] || [ "${ZAP_EXIT}" -eq 2 ]; then
  echo "ZAP completed with alerts. Review the reports above."
  if [ "${ZAP_FAIL_ON_ALERTS}" = "true" ]; then
    exit "${ZAP_EXIT}"
  fi
  exit 0
fi

exit "${ZAP_EXIT}"
