/**
 * InputHistory sub-module entry point.
 *
 * Registers event listeners, sets up keyboard shortcuts, and initialises the
 * history buttons. Imported once by the Inline Assistant's main index.ts so
 * it shares the same build bundle.
 */
import { placeButtons, updateButtonVisibility } from './buttons.js';
import { filterHistoryMenu } from './menu.js';
import { registerSlashCommands } from './slash-commands.js';
import { addToInputHistory, getInputHistory, inputHistoryBack, inputHistoryForward, setInputHistory } from './store.js';

export { getInputHistory, setInputHistory, addToInputHistory, inputHistoryBack, inputHistoryForward };

let lastTaValue = '';

function getTextarea(): HTMLTextAreaElement | null {
    const el = document.getElementById('send_textarea');
    return el instanceof HTMLTextAreaElement ? el : null;
}

function initButtons(): void {
    const ta = getTextarea();
    if (!ta) return;
    placeButtons(ta);
    updateButtonVisibility();
}

function onTaKeyDown(evt: KeyboardEvent): void {
    if (!evt.altKey) return;
    const ta = evt.currentTarget as HTMLTextAreaElement;
    if (evt.key === 'ArrowUp') {
        evt.preventDefault();
        evt.stopPropagation();
        inputHistoryBack(ta);
    } else if (evt.key === 'ArrowDown') {
        evt.preventDefault();
        evt.stopPropagation();
        inputHistoryForward(ta);
    }
}

function onTaInput(evt: Event): void {
    const ta = evt.currentTarget as HTMLTextAreaElement;
    if (ta.value.trim()) lastTaValue = ta.value;
    filterHistoryMenu(ta.value);
}

let boundTa: HTMLTextAreaElement | null = null;

function bindTextareaListeners(): void {
    const ta = getTextarea();
    if (!ta || ta === boundTa) return;
    boundTa?.removeEventListener('keydown', onTaKeyDown);
    boundTa?.removeEventListener('input', onTaInput);
    ta.addEventListener('keydown', onTaKeyDown);
    ta.addEventListener('input', onTaInput);
    boundTa = ta;
}

function initializeInputHistory(): void {
    bindTextareaListeners();
    initButtons();
    registerSlashCommands();
}

/** Called when Inline Assistant fires its own normalizeRuntimePlacement so buttons stay in the right slot. */
export function refreshIHPlacement(): void {
    bindTextareaListeners();
    const ta = getTextarea();
    if (ta) placeButtons(ta);
    updateButtonVisibility();
}

// ── ST event wiring ─────────────────────────────────────────────────────────

function wireEvents(): void {
    const ctx = SillyTavern.getContext();
    const es = ctx.eventSource;
    const types = ctx.eventTypes;
    if (!es || !types) return;

    if (types.APP_READY) {
        es.on(types.APP_READY, initializeInputHistory);
    }

    if (types.GENERATION_STARTED) {
        es.on(types.GENERATION_STARTED, (...args: unknown[]) => {
            const isDryRun = args[2] === true;
            if (!isDryRun) addToInputHistory(lastTaValue);
        });
    }

    // Third-party extensions can also be loaded/reloaded after APP_READY.
    initializeInputHistory();
}

wireEvents();
