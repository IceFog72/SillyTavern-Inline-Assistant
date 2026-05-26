export const MODULE_NAME = 'inlineAssistant';
export const SETTINGS_PANEL_ID = 'inline_assistant_settings';
export const PREVIEW_ID = 'inline_assistant_preview';
export const GHOST_ID = 'inline_assistant_ghost';
export const SOURCE_SELECT_ID = 'inline_assistant_source_language';
export const EDITOR_CELL_ID = 'inline_assistant_editor_cell';
export const PREVIEW_TOGGLE_ID = 'inline_assistant_preview_toggle';
export const AUTOCOMPLETE_BUTTON_ID = 'inline_assistant_autocomplete_button';

export const FALLBACK_LANGUAGE_OPTIONS = [
    ['auto', 'Auto detect'],
    ['en', 'English'],
    ['es', 'Spanish'],
    ['fr', 'French'],
    ['de', 'German'],
    ['it', 'Italian'],
    ['ja', 'Japanese'],
    ['ko', 'Korean'],
    ['zh-CN', 'Chinese (Simplified)'],
    ['pt', 'Portuguese'],
    ['ru', 'Russian'],
] as const;

export const LEGACY_LANGUAGE_VALUES = Object.freeze({
    English: 'en',
    Spanish: 'es',
    French: 'fr',
    German: 'de',
    Italian: 'it',
    Japanese: 'ja',
    Korean: 'ko',
    Chinese: 'zh-CN',
    Portuguese: 'pt',
    Russian: 'ru',
});

export const DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    inlineEnabled: false,
    translationEnabled: true,
    debounceMs: 500,
    minChars: 3,
    debug: false,
    autocompleteProfile: 'current',
    completionPrompt: 'Continue message draft. Return only the continuation text, no quotes, no explanation.\n\nCurrent draft:\n{{input}}',
    maxCompletionLength: 80,
    temperature: 0.3,
    lastMessagesCount: 3,
    completionWordSpace: true,
    completionDebounce: true,
    manualAutocomplete: false,
    acceptKey: 'Tab',
    dismissKey: 'Escape',
    sourceLanguage: 'auto',
    targetLanguage: 'en',
    translationEngine: 'st-api',
    translationProfile: 'autocomplete-profile',
    translationPrompt: 'Translate the text from {{sourceLanguage}} to {{targetLanguage}}.\nPreserve meaning, tone, punctuation, and line breaks.\nReturn only translated text. No notes, no quotes.\n\nText:\n{{input}}',
    triggerWord: true,
    triggerSentence: true,
    triggerNewline: true,
    triggerDebounce: true,
    previewVisible: true,
});
