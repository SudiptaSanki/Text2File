# Security Policy

## Supported Versions

The active `main` branch is the supported development version until the first stable release.

## Reporting a Vulnerability

Please do not open a public issue for vulnerabilities involving document privacy, secret exposure, cross-site scripting, dependency compromise, or abuse of future AI endpoints.

For now, use a private GitHub security advisory after the repository is published.

## Security Principles

- User documents stay in the browser by default.
- Only the last draft session is saved locally.
- No frontend API keys.
- No runtime CDN scripts.
- All imported document content must be treated as untrusted.
- Optional AI features must require explicit user action and must route through a protected backend.
