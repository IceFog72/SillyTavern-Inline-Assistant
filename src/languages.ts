import { FALLBACK_LANGUAGE_OPTIONS, LEGACY_LANGUAGE_VALUES } from './constants.js';

export function normalizeLanguageValue(value, fallback) {
    return LEGACY_LANGUAGE_VALUES[value] ?? value ?? fallback;
}

export function selectOption(select, value) {
    const normalized = normalizeLanguageValue(value, value);
    select.value = normalized;
    if (select.value === normalized || !normalized) return;

    const option = document.createElement('option');
    option.value = normalized;
    option.textContent = String(normalized);
    option.dataset.inlineAssistantSynthetic = 'true';
    select.append(option);
    select.value = normalized;
}

export function fillLanguageSelect(select, allowAuto) {
    select.innerHTML = '';
    const options = getLanguageOptions(allowAuto);
    for (const [value, label] of options) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        select.append(option);
    }
}

export function getLanguageOptions(allowAuto) {
    const stTarget = document.getElementById('translation_target_language');
    const options = [];
    if (allowAuto) options.push(['auto', 'Auto detect']);

    if (stTarget instanceof HTMLSelectElement && stTarget.options.length > 0) {
        for (const option of stTarget.options) {
            if (!option.value) continue;
            const label = option.textContent?.trim() || option.value;
            options.push([option.value, label]);
        }
        return options;
    }

    for (const [value, label] of FALLBACK_LANGUAGE_OPTIONS) {
        if (!allowAuto && value === 'auto') continue;
        options.push([value, label]);
    }
    return options;
}

export function compactSelectedLanguageLabel(select) {
    if (!(select instanceof HTMLSelectElement)) return;
    for (const option of select.options) {
        if (!option.dataset.fullLabel) option.dataset.fullLabel = option.textContent || option.value;
        option.textContent = option.dataset.fullLabel;
    }
    const selected = select.selectedOptions[0];
    if (selected && selected.value !== 'auto') {
        selected.textContent = selected.value;
    }
}
