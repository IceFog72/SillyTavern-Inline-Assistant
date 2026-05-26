import { DEFAULT_SETTINGS, MODULE_NAME } from './constants.js';
import { normalizeLanguageValue } from './languages.js';

export function context() {
    return SillyTavern.getContext();
}

export function settings() {
    const ctx = context();
    ctx.extensionSettings[MODULE_NAME] ??= structuredClone(DEFAULT_SETTINGS);
    const current = ctx.extensionSettings[MODULE_NAME];
    if (typeof current.inlineEnabled !== 'boolean' || typeof current.translationEnabled !== 'boolean') {
        current.inlineEnabled = current.mode !== 'translate';
        current.translationEnabled = current.mode !== 'inline';
    }
    delete current.mode;
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        current[key] ??= value;
    }
    current.sourceLanguage = normalizeLanguageValue(current.sourceLanguage, DEFAULT_SETTINGS.sourceLanguage);
    current.targetLanguage = normalizeLanguageValue(current.targetLanguage, DEFAULT_SETTINGS.targetLanguage);
    return current;
}

export function save() {
    context().saveSettingsDebounced?.();
}

export function log(...args) {
    if (settings().debug) console.debug('[Inline Assistant]', ...args);
}
