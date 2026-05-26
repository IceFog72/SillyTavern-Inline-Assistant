import { STORAGE_KEY } from './constants.js';
import { ihSettings } from './settings.js';

let inputHistoryIdx = -1;

export function getInputHistory(): string[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
        return [];
    }
}

export function setInputHistory(history: string[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function addToInputHistory(text: string | null | undefined): void {
    const trimmed = text?.trim() ?? '';
    if (!trimmed) return;
    const history = getInputHistory();
    if (history[0] !== trimmed) {
        history.unshift(trimmed);
        const { maxHistory } = ihSettings();
        while (history.length > maxHistory) history.pop();
        setInputHistory(history);
    }
    inputHistoryIdx = -1;
}

export function inputHistoryBack(ta: HTMLTextAreaElement): void {
    const history = getInputHistory();
    if (inputHistoryIdx + 1 < history.length) inputHistoryIdx++;
    ta.value = history[inputHistoryIdx] ?? '';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
}

export function inputHistoryForward(ta: HTMLTextAreaElement): void {
    const history = getInputHistory();
    if (inputHistoryIdx >= 0) inputHistoryIdx--;
    ta.value = (history.length === 0 || inputHistoryIdx < 0) ? '' : (history[inputHistoryIdx] ?? '');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
}
