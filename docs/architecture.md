# Architecture

## Purpose

SillyTavern Inline Assistant extends SillyTavern's send box with two helpers:

- Inline completion: asks a selected Connection Manager profile for a short continuation and renders it as ghost text over `#send_textarea`.
- Translation preview: shows translated draft text above the send form and can copy, replace, or swap draft text.

## SillyTavern integration points

- `manifest.json` registers `index.js` and `style.css` as a third-party extension.
- `SillyTavern.getContext()` provides extension settings, chat history, user/character names, and `saveSettingsDebounced()`.
- Settings UI is fetched from `/scripts/extensions/third-party/SillyTavern-Inline-Assistant/settings.html` and appended to `#rm_extensions_block #extensions_settings` or `#extensions_settings`.
- Runtime binds to `#send_textarea`, then watches `document.body` with `MutationObserver` because SillyTavern can recreate send-form DOM.
- Translation can call SillyTavern translate extension via dynamic import: `/scripts/extensions/translate/index.js`.
- Completion and LLM translation use Connection Manager via dynamic import: `/scripts/extensions/shared.js` and `ConnectionManagerRequestService.sendRequest()`.

## Runtime flow

1. `init()` normalizes settings, injects settings UI, binds textarea, starts DOM observer, saves defaults.
2. `bindTextarea()` wraps `#send_textarea`, installs input/keydown/scroll listeners, creates preview and ghost nodes.
3. `scheduleWork()` debounces work based on settings and trigger type.
4. `runWork()` starts completion and/or translation with a request id.
5. Late async responses are ignored if their request id no longer matches current request.
6. `renderRuntime()` syncs preview visibility, source/target selectors, autocomplete button, and ghost overlay.

## Source layout

```text
src/index.ts          runtime orchestrator
src/constants.ts      ids, defaults, fallback language data
src/languages.ts      language select helpers and label normalization
src/settings-store.ts SillyTavern context/settings facade
index.js              bundled SillyTavern-loaded JavaScript artifact
settings.html         injected extension settings panel
style.css             runtime/settings styles
docs/architecture.md  system notes
docs/changelog.md     rewrite log
docs/problems.md      known code/design issues found during rewrite
```

## Build model

SillyTavern still loads root `index.js`. TypeScript source lives under `src/`; `npm run build` bundles modules with esbuild into root `index.js`.
