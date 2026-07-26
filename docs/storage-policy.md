# Browser Storage Policy

Text2File stores only one recoverable draft in the browser.

## Stored Data

- Document title.
- Plain text content.
- Page and style settings.
- Last saved timestamp.
- Storage schema version.

## Not Stored

- Generated PDF, DOCX, or HTML files.
- Export previews.
- Full edit history.
- Analytics events containing document text.
- AI prompts or responses by default.

## Limits

- Hard limit: 1 MiB serialized draft.
- Warning threshold: 80 percent of the hard limit.
- Saving replaces the previous draft record.
- Users can clear the local draft from the app.

## Recovery Behavior

The app autosaves after short idle periods and on page hide. A sudden device power loss can still lose the last few seconds of typing.
