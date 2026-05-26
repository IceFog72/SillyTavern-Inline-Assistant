# Changelog

## Unreleased

- Replaced single Mode select with independent Inline completion and Translation preview toggles.
- Migrates legacy `mode` setting into `inlineEnabled` and `translationEnabled`.
- Global Enabled switch now hides extension runtime buttons through feature gating.
- Changed Swap text action into language-only swap beside target language selector.
- Inline completion now defaults off and shows token-use caution recommending local/cheap LLM profiles.
- LLM translation profile and prompt settings now show only when LLM translation engine is selected.

## 0.1.0 TypeScript rewrite

- Added TypeScript toolchain with `typescript`, `tsconfig.json`, `npm run check`, and `npm run build`.
- Moved editable source to `src/index.ts` while preserving SillyTavern runtime entry at root `index.js`.
- Added ambient declarations for SillyTavern context, Connection Manager service, translate extension import, and toastr.
- Kept existing extension behavior: settings injection, textarea binding, inline ghost completion, translation preview, Connection Manager profile selection, ST translation API support, LLM translation support.
- Added docs folder with architecture and problem notes.
