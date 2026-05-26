# Changelog

## 0.1.0 TypeScript rewrite

- Added TypeScript toolchain with `typescript`, `tsconfig.json`, `npm run check`, and `npm run build`.
- Moved editable source to `src/index.ts` while preserving SillyTavern runtime entry at root `index.js`.
- Added ambient declarations for SillyTavern context, Connection Manager service, translate extension import, and toastr.
- Kept existing extension behavior: settings injection, textarea binding, inline ghost completion, translation preview, Connection Manager profile selection, ST translation API support, LLM translation support.
- Added docs folder with architecture and problem notes.
