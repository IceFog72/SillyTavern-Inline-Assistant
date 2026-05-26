import { IH_BTN_HISTORY_ID, IH_HISTORY_MENU_ID } from './constants.js';
import { getInputHistory } from './store.js';

const ANIMATION_MS = 410;

function waitForFrame(): Promise<void> {
    return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

export async function hideHistoryMenu(): Promise<void> {
    const menu = document.getElementById(IH_HISTORY_MENU_ID);
    const trigger = document.getElementById(IH_BTN_HISTORY_ID);
    if (!menu) return;
    menu.classList.remove('stih--active');
    trigger?.classList.remove('stih--hasMenu');
    await new Promise(resolve => setTimeout(resolve, ANIMATION_MS));
    menu.remove();
}

export async function showHistoryMenu(ta: HTMLTextAreaElement): Promise<void> {
    const existing = document.getElementById(IH_HISTORY_MENU_ID);
    if (existing) {
        await hideHistoryMenu();
        return;
    }

    const trigger = document.getElementById(IH_BTN_HISTORY_ID);
    trigger?.classList.add('stih--hasMenu');

    const menu = document.createElement('div');
    menu.id = IH_HISTORY_MENU_ID;
    menu.classList.add('stih--history');

    const renderItem = (text: string): void => {
        const item = document.createElement('div');
        item.classList.add('stih--item');
        item.title = text;

        const icon = document.createElement('div');
        icon.classList.add('stih--icon', 'fa-solid', 'fa-comment');
        item.append(icon);

        const label = document.createElement('div');
        label.classList.add('stih--label');

        const content = document.createElement('div');
        content.classList.add('stih--content');

        const title = document.createElement('div');
        title.classList.add('stih--title');
        if (text[0] === '/') title.classList.add('stih--code');
        title.textContent = text;

        content.append(title);
        label.append(content);
        item.append(label);

        item.addEventListener('click', async () => {
            await hideHistoryMenu();
            ta.value = text;
            ta.focus();
        });

        menu.append(item);
    };

    for (const entry of getInputHistory()) renderItem(entry);

    const container = document.querySelector('#nonQRFormItems');
    await waitForFrame();
    (container ?? document.body).append(menu);
    await waitForFrame();
    menu.classList.add('stih--active');
}

/** Filter menu items by the current textarea value */
export function filterHistoryMenu(filterText: string): void {
    const menu = document.getElementById(IH_HISTORY_MENU_ID);
    if (!menu) return;
    const history = getInputHistory();
    const terms = filterText.trim().split(/\s+/).filter(Boolean);
    history.forEach((entry, idx) => {
        const item = menu.children[idx] as HTMLElement | undefined;
        if (!item) return;
        const matches = terms.length === 0 || terms.every(t => entry.toLowerCase().includes(t.toLowerCase()));
        item.classList.toggle('stih--hidden', !matches);
    });
}
