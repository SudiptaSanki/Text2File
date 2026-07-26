# Threat Model

## Protected Assets

- User document text.
- Browser-local draft.
- Future AI API secrets.
- Generated downloadable files.

## Main Risks

- Cross-site scripting through pasted or imported content.
- Accidentally exposing AI provider keys in frontend bundles.
- Excessive browser memory use from large drafts or generated previews.
- Supply-chain compromise through dependencies.
- Logging private document text on future backend endpoints.

## First Controls

- Plain text document model for the initial editor.
- Escaped HTML exports.
- No runtime CDN scripts.
- Strict local draft size cap.
- GitHub CI build checks.
- Dependabot.
- Production dependency audit.
- Cloudflare Worker secrets for future AI keys.

## Deferred Controls

These are useful later but not needed until the product has accounts, document syncing, or backend state:

- Passkeys.
- JWT or session cookies.
- Database row-level security.
- ABAC permissions.
- mTLS between backend services.
- eBPF runtime monitoring.
- WebRTC controls.
