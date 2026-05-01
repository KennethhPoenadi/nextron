# Security Scans

This repository runs automated SAST, SCA, and SonarQube Cloud checks from GitHub Actions.

## Required GitHub Settings

Configure these repository secrets and variables before expecting every scan to run:

- Secret `SONAR_TOKEN`: SonarQube Cloud token.
- Variable `SONAR_PROJECT_KEY`: SonarQube Cloud project key.
- Variable `SONAR_ORGANIZATION`: SonarQube Cloud organization key.

## Workflow Coverage

- CodeQL scans JavaScript and TypeScript with security-extended and security-quality queries.
- Semgrep runs a full SAST scan and uploads SARIF results to GitHub Code Scanning.
- Trivy scans the filesystem for dependency vulnerabilities, secrets, and misconfigurations.
- OSV Scanner recursively checks dependency manifests and lockfiles across the repository.
- pnpm audit checks production dependencies from the root lockfile.
- Dependency Review blocks vulnerable dependency changes in pull requests.
- SonarQube Cloud builds the project, scans source quality/security, and waits for the quality gate.
