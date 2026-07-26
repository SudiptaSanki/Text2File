# Contributing

Thanks for helping build Text2File.

## Development Flow

1. Open an issue for larger changes before building.
2. Keep pull requests focused.
3. Run `npm run typecheck` and `npm run build` before requesting review.
4. Do not add document upload, analytics, or AI calls without a matching privacy and security discussion.

## Dependency Rules

- Prefer small, maintained libraries with clear licenses.
- Avoid runtime CDN scripts in the app.
- Keep lockfiles committed.
- Do not introduce libraries that collect user document text.

## AI Rules

AI features must be optional. API keys must live in a backend runtime such as Cloudflare Worker secrets, not in frontend code or build-time bundles.
