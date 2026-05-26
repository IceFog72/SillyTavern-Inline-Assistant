import { MODULE_NAME } from './constants.js';

export interface IHSettings {
    maxHistory: number;
    showButtons: boolean;
    showArrowButtons: boolean;
    showHistoryButton: boolean;
}

export const DEFAULT_IH_SETTINGS: Readonly<IHSettings> = Object.freeze({
    maxHistory: 10,
    showButtons: true,
    showArrowButtons: true,
    showHistoryButton: true,
});

export function ihSettings(): IHSettings {
    const ctx = SillyTavern.getContext();
    const ext = ctx.extensionSettings as Record<string, IHSettings>;
    if (!ext[MODULE_NAME]) {
        ext[MODULE_NAME] = { ...DEFAULT_IH_SETTINGS };
    }
    const current = ext[MODULE_NAME];
    for (const [key, value] of Object.entries(DEFAULT_IH_SETTINGS) as [keyof IHSettings, IHSettings[keyof IHSettings]][]) {
        if (current[key] === undefined) (current as unknown as Record<string, unknown>)[key] = value;
    }
    return current;
}

export function ihSave(): void {
    SillyTavern.getContext().saveSettingsDebounced?.();
}
