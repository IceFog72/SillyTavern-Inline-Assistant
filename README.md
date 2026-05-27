# SillyTavern — Inline Assistant

An extension that brings inline autocomplete suggestions (a la GitHub Copilot), real-time translation preview, and visual input history navigation directly into your SillyTavern message editor.

<img width="2560" height="1402" alt="image" src="https://github.com/user-attachments/assets/941bc4e6-d183-4a1a-a1cc-ffbc05652516" />

* *You don't need to use [ProbablyTooManyTabs](https://github.com/IceFog72/SillyTavern-ProbablyTooManyTabs) to use Inline Assistant, but they integrate seamlessly.*

---

## Features

- **Inline Completion (Ghost Text)**: An LLM-powered variation of *impersonate* that contextually predicts and drafts the continuation of your message. Displays suggestions as subtle ghost text right after your cursor. Press `Tab` to accept and insert, or `Escape` to dismiss.
- **Real-Time Translation Preview**: Instant translation of your message draft. Shows a sleek preview drawer above the chatbox. Features quick buttons to swap languages, replace your input text, or copy the translation to your clipboard.
- **Dual Translation Engines**: Full support for both **SillyTavern's native Translate API** extension and **custom LLM connection profiles** (with completely customizable translation prompt templates).
- **Input History Navigator**: Keep track of your sent drafts and message history. Use `Alt+ArrowUp` and `Alt+ArrowDown` to cycle through them, or click the visual clock button next to the input area to search and select past drafts.
- **Smart Completion Filters**: Inverts chat history role mapping to predict your next user draft, cleans up outputs, and filters out thinking blocks (`<think>...</think>`) on the fly.
- **Highly Configurable**: Custom prompt templates (using `{{input}}`, `{{user}}`, `{{char}}`), debounce timers, temperature controls, context message counts, trigger boundaries, and custom token limits.
- **Seamless UI Integration**: Integrates directly with SillyTavern's chat bar and wraps the send textarea without disrupting native style palettes or extensions.

---

## Installation

1. Install via SillyTavern's extension installer, or
2. Clone into `SillyTavern/data/default-user/extensions/`

```bash
git clone https://github.com/IceFog72/SillyTavern-Inline-Assistant
```

Then reload SillyTavern and enable **Inline Assistant** from the extensions panel.

---

## Requirements

- SillyTavern `1.12.0` or newer
- Modern Chromium/Firefox-based browser

---

## Quick Start

### Inline Completion
1. Enable **Inline completion** in the settings drawer.
2. Select your preferred **Connection profile** (defaults to your active LLM profile).
3. Start typing in the text editor. A suggestion will appear in gray text as a localized variation of *impersonate*.
4. Press `Tab` to insert the suggestion, or `Escape` to dismiss it.
5. Alternatively, click the **Wand Icon** (`fa-wand-magic-sparkles`) next to the chat bar to trigger completion manually.

### Translation Preview
1. Enable **Translation preview** in the settings drawer.
2. Select your **Source language** (supports Auto-detect) and **Target language** on the selectors surrounding the chatbox.
3. Choose your engine (**SillyTavern translation API** or **LLM connection profile**) in the settings.
4. As you type, the translated draft will appear above the chat input box.
5. Click **Replace Input** (`fa-arrow-down`) to paste the translation over your draft, or **Copy** (`fa-copy`) to save it to your clipboard.
6. Click **Swap** (`fa-right-left`) to flip the source and target languages instantly.

### Input History
1. Press `Alt+ArrowUp` while inside the message box to cycle backward through your sent messages.
2. Press `Alt+ArrowDown` to cycle forward.
3. Click the **Clock Icon** (`fa-clock-rotate-left`) to open a dropdown panel with all stored message drafts.
4. Start typing inside the message box while the dropdown is open to instantly filter the list.

---

## Configuration Settings

### Global Options
- **Enabled**: Toggle the entire extension runtime.
- **Inline completion**: Turn autocomplete suggestions on/off.
- **Translation preview**: Turn real-time translation on/off.
- **Debounce (ms)**: Idle time (in milliseconds) after typing stops before initiating AI/translation API requests.
- **Minimum characters**: Number of characters required before suggestions or translation previews trigger.

### Inline Completion Advanced Settings
- **Connection profile**: Map completions to specific API profiles configured in the SillyTavern Connection Manager.
- **Max completion length**: The maximum token length generated for inline ghost suggestions.
- **Last messages count**: The number of preceding chat logs sent as conversation context to help the assistant generate natural completions.
- **Completion prompt**: Fully customizable instruct template to dictate continuation behaviors (supports `{{input}}`, `{{user}}`, and `{{char}}`).

### Input History Slash Commands
Manage your history and extension configurations directly using SillyTavern commands:
- `/inputhistory-config [key] [value]` (alias `/ih-config`): Retrieves or sets Input History configurations.
  - *Example*: `/ih-config key=maxHistory 15`
  - *Example*: `/ih-config key=showArrowButtons false`
- `/inputhistory-add [text]` (alias `/ih-add`): Add an entry directly into the input history list.

---

## Project Structure

```text
SillyTavern-Inline-Assistant/
├── index.js                  # Bundled runtime loaded by SillyTavern
├── manifest.json             # Extension manifest & loading definitions
├── settings.html             # Injected HTML configuration drawer
├── style.css                 # Interface layout, ghost overlay, and button styles
├── package.json              # Development build scripts and dependencies
├── tsconfig.json             # TypeScript configuration
├── docs/                     # Engineering design & development logs
│   ├── architecture.md       # Integration mapping & execution flow
│   ├── changelog.md          # Extension release & update history
│   └── problems.md           # Known challenges & future improvements
└── src/                      # TypeScript source files
    ├── index.ts              # Main setup, textarea binder, and completion loop
    ├── constants.ts          # Default settings & DOM selectors
    ├── languages.ts          # Language select dropdown options & normalization
    ├── settings-store.ts     # SillyTavern settings integration facade
    ├── globals.d.ts          # SillyTavern types
    └── input-history/        # Input history module
        ├── index.ts          # Input history entry point & event binders
        ├── store.ts          # LocalStorage history array wrapper
        ├── buttons.ts        # Chat bar up/down/clock button injectors
        ├── menu.ts           # Dropdown list UI & dynamic search filter
        ├── settings.ts       # Sub-module settings facade
        └── slash-commands.ts # Slash command registration (/ih-config, /ih-add)
```

---

## Support

- **Discord**: [https://discord.gg/2tJcWeMjFQ](https://discord.gg/2tJcWeMjFQ)
- **SillyTavern Discord**: Find me on the official server
- **GitHub Issues**: Bug reports and feature requests

---

## Support Development

Support my projects: [💸 PayPal](https://www.paypal.com/ncp/payment/ABWFG6Y3SRGE6)

---

## Credits

- **[SillyTavern-InputHistory](https://github.com/LenAnderson/SillyTavern-InputHistory)**: Inline Assistant features an integrated version of history tracking and visual selector extension by LenAnderson.

---

## License

GNU License - See [LICENSE](LICENSE) for details.
