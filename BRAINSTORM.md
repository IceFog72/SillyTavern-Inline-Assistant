# SillyTavern Inline Assistant — Brainstorm

## Goal

Create a SillyTavern extension that augments `#send_textarea` with two writing helpers:

1. **Inline LLM completion**: ghost text appears inside or beside the input, accepted with `Tab`.
2. **Translate mode**: translated preview appears above the input and updates as the user finishes words or sentences.

## Main UX

### Inline completion mode

- User types in `#send_textarea`.
- Extension asks an LLM to continue the text.
- Suggested continuation appears as half-transparent ghost text.
- Pressing `Tab` inserts the suggestion into the textarea.
- Pressing any normal character keeps typing and may dismiss or refresh the suggestion.
- Pressing `Escape` dismisses suggestion.

### Translate mode

- Extension adds a translated preview box above `#send_textarea`.
- Translation panel includes input/output language selectors.
- User types normally in the main input.
- Translation updates according to settings:
  - end of word
  - `.`, `!`, `?`, `;`, `:`, `,`
  - newline
  - debounce after pause
  - user can enable/disable triggers
- Translation can use either:
  - SillyTavern translation API
  - selected LLM Connection Profile with editable translation prompt
- Preview has translator-style action buttons:
  - swap input and translated text
  - copy translated text
  - replace input with translated text
- Swap button exchanges `#send_textarea` value and translated preview value, like common translator apps.

## Settings

Settings UI should live in SillyTavern's normal extension settings area:

- Inject settings block into `#extensions_settings` inside `#rm_extensions_block`.
- Use same collapsible drawer/style patterns as other extensions.
- Persist values through `extension_settings` under this extension key.
- Call ST save settings helper after changes.

### Shared

- Enable extension
- Mode:
  - Inline completion
  - Translate preview
  - Both
- Debounce delay
- Minimum characters before action
- Debug logging
- Settings switches shown in ST extension settings panel, not floating UI

### Inline completion settings

- Connection Profile for autocomplete
  - Prefer selecting an existing SillyTavern Connection Profile instead of hardcoding provider/model settings.
  - Allows autocomplete to use a small/fast/cheap model while main chat uses a different model.
  - Allows separate API/provider tuning without disturbing active chat connection.
  - Fallback option: use current active connection.
- Prompt template
- Continue until:
  - first sentence end
  - first punctuation mark
  - max token limit
- Max completion length
- Temperature
- Stop sequences
- Accept key, default `Tab`
- Dismiss key, default `Escape`
- Whether completion includes current chat context or only current textarea text

Example prompt:

```text
Continue the user's draft naturally. Return only the continuation text, no quotes, no explanation.

Current draft:
{{input}}
```

### Translate settings

- Input/source language selector
  - `Auto detect`
  - common saved languages
  - full provider-supported language list if available
- Output/target language selector
  - common saved languages
  - full provider-supported language list if available
- Default source language
- Default target language
- Translation engine switch in settings:
  - ST translation API (default)
  - LLM Connection Profile
- Connection Profile for LLM translation
  - Can reuse autocomplete profile or choose separate profile.
  - Lets user pick translation-specialized model.
- Editable LLM translation prompt template
- Swap languages when swapping text
- Update trigger:
  - word boundary
  - sentence boundary
  - debounce
- Preserve formatting/newlines
- Show preview above input

Example LLM translation prompt:

```text
Translate the text from {{sourceLanguage}} to {{targetLanguage}}.
Preserve meaning, tone, punctuation, and line breaks.
Return only translated text. No notes, no quotes.

Text:
{{input}}
```

- Button to swap original input and translated text
- Button to replace original input with translated text
- Button to copy translated text

## Technical questions

### Textarea rendering problem

Decision: use ghost overlay/mirror for MVP, not popover.

Native `<textarea>` cannot display partial transparent inline ghost text inside same text flow. Options:

1. **Overlay mirror**
   - Keep real textarea.
   - Add positioned overlay behind/above it.
   - Mirror typed text plus ghost continuation.
   - Hard part: exact wrapping, scroll sync, font metrics.

2. **Completion suffix element**
   - Show ghost text after textarea or in floating popover.
   - Easier.
   - Less editor-like.

3. **Replace input with richer editor**
   - Maybe use Prism-style mirrored editor.
   - Risky because ST expects `#send_textarea` events, value, focus, selection.
   - Need compatibility with mobile, macros, slash commands, ST send flow.

Decision: start with overlay mirror, keep real `#send_textarea` as source of truth.

### LLM integration

Best direction: use a selectable SillyTavern Connection Profile for autocomplete.

Reasons:

- Autocomplete can use a different model than main chat.
- User can pick cheap/fast model for frequent short continuations.
- Main chat connection remains unchanged.
- Provider/model/API-key details stay inside ST profile system.

Need inspect ST APIs for:

- Listing available Connection Profiles.
- Reading selected autocomplete profile from extension settings.
- Temporarily generating with that profile without permanently changing active chat profile.
- Fallback to current active connection if profile API is unavailable.

Possible routes:

- Use ST internal profile/generation helpers if exposed.
- Use generation endpoint with profile identifier if supported.
- Temporarily switch profile, generate, then restore original profile only if safe.
- Avoid duplicating provider-specific settings unless ST profile API cannot be reused.

### Translation integration

Support two translation engines:

1. **ST translation API**
   - Import translation helper from ST scripts if exposed.
   - Or call internal endpoint used by existing translate UI.
   - Must respect current ST translation provider/settings.

2. **LLM translation**
   - Use selected Connection Profile.
   - Fill editable prompt with `{{input}}`, `{{sourceLanguage}}`, `{{targetLanguage}}`.
   - Return only translated text.
   - Useful when normal translation provider is unavailable or model gives better style control.

Need inspect ST APIs for both profile-based generation and translation endpoints.

## Exemplar extensions

Use local exemplars for implementation style:

- `SillyTavern-CustomParameters`
  - Uses `SillyTavern.getContext()` for `saveSettingsDebounced`, `eventSource`, `event_types`, `Popup`.
  - Imports settings HTML and CSS through bundled `src/index.ts`.
  - Injects settings into `#extensions_settings` fallback area.
  - Uses `loading_order: 99` in manifest.
- `SillyTavern-EveryTextLineEditor`
  - Uses `extension_settings` import for extension storage and disabled-extension check.
  - Has separate `SettingsPanel` class and modular source files.
  - Manifest includes `js`, `css`, version, homepage, auto-update, optional lifecycle hooks.

## Proposed architecture

```text
SillyTavern-Inline-Assistant/
  manifest.json
  index.js
  style.css
  settings.html              # injected into #rm_extensions_block #extensions_settings
  BRAINSTORM.md
```

### Runtime modules later

```text
src/
  textarea-controller.js      # watches #send_textarea, selection, keys
  inline-completion.js        # request lifecycle, ghost suggestion state
  ghost-overlay.js            # visual rendering, scroll sync
  translate-preview.js        # preview box + translation lifecycle
  settings.js                 # inject #extensions_settings UI, load/save extension_settings
  st-api.js                   # ST generation + translation wrappers
```

## State model

```text
inputText: string
cursorStart: number
cursorEnd: number
completion: string | null
completionRequestId: number
completionStatus: idle | pending | ready | error
translationText: string | null
translationStatus: idle | pending | ready | error
translationEngine: st-api | llm // default st-api
translationProfileId: string | current | autocomplete-profile
translationPrompt: string
sourceLanguage: string | auto
targetLanguage: string
lastTriggerOffset: number
lastSourceText: string | null
isSwapped: boolean
```

## Event model

- `input`: update text, clear stale completion, maybe schedule completion/translation.
- `keydown Tab`: if completion exists, prevent default and insert completion.
- `keydown Escape`: dismiss completion.
- `change source language`: update source language and retranslate current text.
- `change target language`: update target language and retranslate current text.
- `click swap`: exchange textarea value with translated preview, swap source/target languages if source is not `auto`, dispatch input event.
- `click replace`: set textarea value to translated preview, dispatch input event.
- `click copy`: copy translated preview to clipboard.
- `scroll`: sync ghost overlay.
- ST chat change / textarea recreated: rebind observer.

## First prototype scope

1. Create extension shell.
2. Bind to `#send_textarea`.
3. Add preview box above textarea with input/output language selectors and swap/replace/copy buttons.
4. Add fake inline completion from local heuristic for UI testing.
5. Add `Tab` accept behavior.
6. Add settings panel in `#rm_extensions_block #extensions_settings`.
7. Add Connection Profile picker for autocomplete.
8. Replace fake completion with real ST LLM call using selected profile.
9. Add translation engine switch: ST translation API vs LLM Connection Profile.
10. Replace fake translation with selected translation engine call.

## Risks

- `Tab` may conflict with browser focus navigation or ST shortcuts.
- Textarea overlay may drift with fonts, mobile layout, resize, zoom.
- LLM calls on every pause can be expensive or slow; Connection Profile should encourage small/fast model.
- Connection Profile generation may not expose safe per-request profile override.
- Translation API may not expose clean extension hook.
- LLM translation can hallucinate explanations unless prompt/output cleanup is strict.
- Settings injection must match ST extension settings lifecycle and avoid duplicate panels on reload.
- Replacing `#send_textarea` with Prism/editor may break ST input pipeline.

## Decisions so far

1. Extension name: `SillyTavern-Inline-Assistant`.
2. Autocomplete trigger is configurable in settings.
3. Translation triggers are configurable in settings.
4. Default translation engine is ST translation API.
5. Translation preview appears above `#send_textarea`.
6. Inline completion display uses ghost overlay/mirror.

## Open decisions

1. Completion source: selected ST Connection Profile, with active connection fallback?
2. Should profile switch be per-request only, or should extension maintain its own lightweight provider fallback?
3. Translation direction: only user draft → target language, or bidirectional after swap?
4. If source language is `Auto detect`, should swap set source to previous target and target to detected language if API returns it?
5. Should LLM translation use same profile as autocomplete by default, or separate profile by default?
6. Should translated preview be sendable directly?
7. Should inline completion account for character persona/chat history?
