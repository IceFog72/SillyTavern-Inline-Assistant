# Problems Found During Rewrite

## Code/design issues

- `src/index.ts` is smaller, but still owns most runtime orchestration. Next split targets: ST API, textarea controller, ghost overlay, completion, and translation modules.
- TypeScript strictness is reduced in `tsconfig.json` because SillyTavern runtime APIs lack local type packages and current code stores extension settings as open records. Add stronger domain types next.
- Dynamic imports point at SillyTavern absolute browser paths. TypeScript can check shape through ambient declarations, but runtime compatibility depends on current SillyTavern internals.
- Completion request payload hardcodes provider-specific custom body fragments for thinking suppression. Some providers may ignore or reject them.
- `temperature` setting is collected but not passed through `sendRequest()` payload.
- `fakeCompletion()` remains unused legacy prototype code.
- `fakeTranslation()` is used as error fallback, which can hide real translation failures from users unless debug console is checked.
- Ghost overlay may drift from textarea text wrapping on custom fonts, zoom, mobile layout, or browser differences.
- Chat history role mapping appears suspicious: SillyTavern `is_user` messages are mapped to `assistant`, and non-user messages are mapped to `user`. Confirm intended prompt format.
- `scheduleWork()` can schedule work even when only one of completion or translation debounce settings should apply. Split debounce state per feature if behavior feels noisy.
- MutationObserver watches entire `document.body`, which is robust but broad. Narrow to send-form container if SillyTavern exposes stable parent node.

## Operational issues

- No automated browser/ST integration tests exist.
- Build output (`index.js`) must be regenerated after source edits with `npm run build`.
