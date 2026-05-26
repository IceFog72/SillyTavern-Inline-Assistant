import { EDITOR_CELL_ID } from '../constants.js';
import { IH_ARROWS_WRAP_ID, IH_BTN_HISTORY_ID, IH_BTN_NEXT_ID, IH_BTN_PREV_ID, IH_BUTTON_WRAP_ID } from './constants.js';
import { hideHistoryMenu, showHistoryMenu } from './menu.js';
import { ihSettings } from './settings.js';
import { inputHistoryBack, inputHistoryForward } from './store.js';

function makeIHButton(id: string, classes: string[], title: string): HTMLDivElement {
    const btn = document.createElement('div');
    btn.id = id;
    btn.classList.add('stih--button', 'menu_button', ...classes);
    btn.title = title;
    return btn;
}

export function createButtons(ta: HTMLTextAreaElement): HTMLDivElement {
    const wrap = document.createElement('div');
    wrap.id = IH_BUTTON_WRAP_ID;
    wrap.classList.add('stih--buttons');

    const arrows = document.createElement('div');
    arrows.id = IH_ARROWS_WRAP_ID;
    arrows.classList.add('stih--arrows');

    const prev = makeIHButton(IH_BTN_PREV_ID, ['fa-solid', 'fa-chevron-up'], 'Previous input');
    prev.addEventListener('click', () => inputHistoryBack(ta));
    arrows.append(prev);

    const next = makeIHButton(IH_BTN_NEXT_ID, ['fa-solid', 'fa-chevron-down'], 'Next input');
    next.addEventListener('click', () => inputHistoryForward(ta));
    arrows.append(next);

    wrap.append(arrows);

    const historyBtn = makeIHButton(IH_BTN_HISTORY_ID, ['stih--menuTrigger', 'fa-solid', 'fa-clock-rotate-left'], 'Input History');
    historyBtn.addEventListener('click', () => {
        showHistoryMenu(ta);
        ta.focus();
    });
    wrap.append(historyBtn);

    return wrap;
}

/**
 * Place the `.stih--buttons` wrap immediately after `#inline_assistant_editor_cell` if it
 * exists in the DOM, otherwise fall back to inserting it after the raw textarea.
 */
export function placeButtons(ta: HTMLTextAreaElement): void {
    let wrap = document.getElementById(IH_BUTTON_WRAP_ID) as HTMLDivElement | null;
    if (!wrap) wrap = createButtons(ta);

    const editorCell = document.getElementById(EDITOR_CELL_ID);
    const anchor: Element = editorCell ?? ta;
    if (wrap.previousElementSibling !== anchor) {
        anchor.insertAdjacentElement('afterend', wrap);
    }
}

export function updateButtonVisibility(): void {
    const s = ihSettings();
    const wrap = document.getElementById(IH_BUTTON_WRAP_ID);
    const arrows = document.getElementById(IH_ARROWS_WRAP_ID);
    const historyBtn = document.getElementById(IH_BTN_HISTORY_ID);

    if (!wrap) return;

    wrap.classList.toggle('stih--hidden', !s.showButtons);
    arrows?.classList.toggle('stih--hidden', !s.showArrowButtons);

    if (historyBtn) {
        historyBtn.classList.toggle('stih--hidden', !s.showHistoryButton);
        if (!s.showHistoryButton) hideHistoryMenu();
    }
}
