# Problems Found During Rewrite

## Code/design issues

- `src/index.ts` is smaller, but still owns most runtime orchestration. Next split targets: ST API, textarea controller, ghost overlay, completion, and translation modules.
- TypeScript strictness is reduced in `tsconfig.json` because SillyTavern runtime APIs lack local type packages and current code stores extension settings as open records. Add stronger domain types next.
- Dynamic imports point at SillyTavern absolute browser paths. TypeScript can check shape through ambient declarations, but runtime compatibility depends on current SillyTavern internals.
- Completion request payload hardcodes provider-specific custom body fragments for thinking suppression. Some providers may ignore or reject them.
- Ghost overlay may still drift on unusual browser/font combinations, but now mirrors border, padding, scroll, width, and typography more closely.
- Chat history role mapping is intentionally inverted: autocomplete predicts the user's draft as if it were the next chat input.
- `scheduleWork()` can schedule work even when only one of completion or translation debounce settings should apply. Split debounce state per feature if behavior feels noisy.
- MutationObserver watches entire `document.body`, which is robust but broad. Narrow to send-form container if SillyTavern exposes stable parent node.

## Operational issues

- No automated browser/ST integration tests exist.
- Build output (`index.js`) must be regenerated after source edits with `npm run build`.
