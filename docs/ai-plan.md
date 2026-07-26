# AI Plan

AI is optional and deferred until the core editor and export path are stable.

## Safe Architecture

- Browser sends selected text only after explicit user action.
- Requests go to a Cloudflare Worker endpoint.
- The Worker reads provider keys from runtime secrets.
- The Worker validates request shape and size.
- The Worker rate limits and may require Turnstile for abuse protection.
- The Worker must not log document text.

## Local Writing Tools First

Before provider AI, the project can add local dictionaries, spelling lists, readability checks, and style rules through `packages/language-data`.

These are data files and rules, not model training.
