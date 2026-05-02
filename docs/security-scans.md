# Security Scans

This repository runs automated SAST, SCA, SonarQube Cloud, and DAST checks from GitHub Actions.

## Required GitHub Settings

Configure these repository secrets and variables before expecting every scan to run:

- Secret `SONAR_TOKEN`: SonarQube Cloud token.
- Variable `SONAR_PROJECT_KEY`: SonarQube Cloud project key.
- Variable `SONAR_ORGANIZATION`: SonarQube Cloud organization key.
- Secret `DAST_TARGET_URL`: Authorized staging/test URL for OWASP ZAP full scan.

## Workflow Coverage

- CodeQL scans JavaScript and TypeScript with security-extended and security-quality queries.
- Semgrep runs a full SAST scan and uploads SARIF results to GitHub Code Scanning.
- Trivy scans the filesystem for dependency vulnerabilities, secrets, and misconfigurations.
- OSV Scanner recursively checks dependency manifests and lockfiles across the repository.
- pnpm audit checks production dependencies from the root lockfile.
- Dependency Review blocks vulnerable dependency changes in pull requests.
- SonarQube Cloud builds the project, scans source quality/security, and waits for the quality gate.
- OWASP ZAP full scan runs only on manual dispatch or schedule, and only when an authorized target URL is provided.

## DAST Safety

OWASP ZAP full scan is active DAST. It can submit forms and send attack-like requests. Use `DAST_TARGET_URL` only for an app/environment you are allowed to test.

## Local DAST

Run the default local DAST target and scan it with:

```sh
pnpm security:dast
```

The script scans `http://host.docker.internal:3000/home/` by default. If that local target is not already running, it starts the `examples/basic-lang-javascript` renderer on port 3000 before launching OWASP ZAP. Local scans use ZAP baseline mode by default because it is stable for the Next.js dev server; use `ZAP_SCAN_TYPE=full` when you need an active full scan.

You can scan a different authorized target with:

```sh
pnpm security:dast https://staging.example.com/
```

Reports are written to `reports/zap/`.

Local scans exit successfully when ZAP completes with findings so the report is easy to open and review. Use `ZAP_FAIL_ON_ALERTS=true` when you want the local command to fail on ZAP alerts.

Useful overrides:

```sh
DAST_APP_DIR=examples/with-tailwindcss pnpm security:dast
DAST_APP_PORT=3001 pnpm security:dast
DAST_START_APP=false pnpm security:dast http://host.docker.internal:3000/home/
ZAP_SCAN_TYPE=full pnpm security:dast
ZAP_SPIDER_MINS=2 pnpm security:dast
ZAP_MAX_MINS=5 pnpm security:dast
ZAP_FAIL_ON_ALERTS=true pnpm security:dast
```
