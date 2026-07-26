# Text2File

Text2File is an open-source document maker for turning pasted or written text into printable and downloadable files.

The first production direction is:

- GitHub for source, issues, pull requests, and CI.
- Cloudflare Workers Static Assets for production hosting.
- Browser-side last-session recovery only, with strict size limits.
- No document database by default.
- Optional AI assistance later through a Cloudflare Worker, never through exposed frontend API keys.

## Current Status

This repository now contains the initial production backbone:

- `apps/web` - React + Vite web app.
- `packages` - future shared packages for document schema, exports, templates, and language data.
- `docs` - architecture, storage, security, and format decisions.
- `.github` - CI, Dependabot, issue templates, and PR template.

The old prototype file is intentionally kept at the repository root as `document_converter_print_station.tsx` for reference while the new structure is built.

## Local Development

```bash
npm install
npm run dev
```

Other useful commands:

```bash
npm run typecheck
npm run build
npm run lint
```

## Product Scope

The app starts simple:

- Paste or write text.
- Choose page, font, color, and spacing settings.
- Preview the printable document.
- Export text, Markdown, HTML, and Word-compatible document files.
- Print or save as PDF through the browser print dialog.
- Restore only the last unsaved browser session.

Advanced editing, real DOCX generation, vector PDF generation, offline writing tools, and optional AI assistance are planned in stages.

## License

MIT
