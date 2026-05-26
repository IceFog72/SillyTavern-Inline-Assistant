(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/constants.ts
  var MODULE_NAME = "inlineAssistant";
  var SETTINGS_PANEL_ID = "inline_assistant_settings";
  var PREVIEW_ID = "inline_assistant_preview";
  var GHOST_ID = "inline_assistant_ghost";
  var SOURCE_SELECT_ID = "inline_assistant_source_language";
  var EDITOR_CELL_ID = "inline_assistant_editor_cell";
  var PREVIEW_TOGGLE_ID = "inline_assistant_preview_toggle";
  var AUTOCOMPLETE_BUTTON_ID = "inline_assistant_autocomplete_button";
  var FALLBACK_LANGUAGE_OPTIONS = [
    ["auto", "Auto detect"],
    ["en", "English"],
    ["es", "Spanish"],
    ["fr", "French"],
    ["de", "German"],
    ["it", "Italian"],
    ["ja", "Japanese"],
    ["ko", "Korean"],
    ["zh-CN", "Chinese (Simplified)"],
    ["pt", "Portuguese"],
    ["ru", "Russian"]
  ];
  var LEGACY_LANGUAGE_VALUES = Object.freeze({
    English: "en",
    Spanish: "es",
    French: "fr",
    German: "de",
    Italian: "it",
    Japanese: "ja",
    Korean: "ko",
    Chinese: "zh-CN",
    Portuguese: "pt",
    Russian: "ru"
  });
  var DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    inlineEnabled: true,
    translationEnabled: true,
    debounceMs: 500,
    minChars: 3,
    debug: false,
    autocompleteProfile: "current",
    completionPrompt: "Continue the draft response on user message. Return only the continuation text, no quotes, no explanation.\n\nCurrent draft:\n{{input}}",
    maxCompletionLength: 80,
    temperature: 0.3,
    lastMessagesCount: 3,
    completionWordSpace: true,
    completionDebounce: true,
    manualAutocomplete: false,
    acceptKey: "Tab",
    dismissKey: "Escape",
    sourceLanguage: "auto",
    targetLanguage: "en",
    translationEngine: "st-api",
    translationProfile: "autocomplete-profile",
    translationPrompt: "Translate the text from {{sourceLanguage}} to {{targetLanguage}}.\nPreserve meaning, tone, punctuation, and line breaks.\nReturn only translated text. No notes, no quotes.\n\nText:\n{{input}}",
    triggerWord: true,
    triggerSentence: true,
    triggerNewline: true,
    triggerDebounce: true,
    swapLanguages: true,
    previewVisible: true
  });

  // src/languages.ts
  function normalizeLanguageValue(value, fallback) {
    return LEGACY_LANGUAGE_VALUES[value] ?? value ?? fallback;
  }
  function selectOption(select, value) {
    const normalized = normalizeLanguageValue(value, value);
    select.value = normalized;
    if (select.value !== normalized && select.options.length > 0) select.selectedIndex = 0;
  }
  function fillLanguageSelect(select, allowAuto) {
    select.innerHTML = "";
    const options = getLanguageOptions(allowAuto);
    for (const [value, label] of options) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    }
  }
  function getLanguageOptions(allowAuto) {
    const stTarget = document.getElementById("translation_target_language");
    const options = [];
    if (allowAuto) options.push(["auto", "Auto detect"]);
    if (stTarget instanceof HTMLSelectElement && stTarget.options.length > 0) {
      for (const option of stTarget.options) {
        if (!option.value) continue;
        const label = option.textContent?.trim() || option.value;
        options.push([option.value, label]);
      }
      return options;
    }
    for (const [value, label] of FALLBACK_LANGUAGE_OPTIONS) {
      if (!allowAuto && value === "auto") continue;
      options.push([value, label]);
    }
    return options;
  }
  function compactSelectedLanguageLabel(select) {
    if (!(select instanceof HTMLSelectElement)) return;
    for (const option of select.options) {
      if (!option.dataset.fullLabel) option.dataset.fullLabel = option.textContent || option.value;
      option.textContent = option.dataset.fullLabel;
    }
    const selected = select.selectedOptions[0];
    if (selected && selected.value !== "auto") {
      selected.textContent = selected.value;
    }
  }

  // src/settings-store.ts
  function context() {
    return SillyTavern.getContext();
  }
  function settings() {
    const ctx = context();
    ctx.extensionSettings[MODULE_NAME] ??= structuredClone(DEFAULT_SETTINGS);
    const current = ctx.extensionSettings[MODULE_NAME];
    if (typeof current.inlineEnabled !== "boolean" || typeof current.translationEnabled !== "boolean") {
      current.inlineEnabled = current.mode !== "translate";
      current.translationEnabled = current.mode !== "inline";
    }
    delete current.mode;
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      current[key] ??= value;
    }
    current.sourceLanguage = normalizeLanguageValue(current.sourceLanguage, DEFAULT_SETTINGS.sourceLanguage);
    current.targetLanguage = normalizeLanguageValue(current.targetLanguage, DEFAULT_SETTINGS.targetLanguage);
    return current;
  }
  function save() {
    context().saveSettingsDebounced?.();
  }
  function log(...args) {
    if (settings().debug) console.debug("[Inline Assistant]", ...args);
  }

  // src/index.ts
  var textarea = null;
  var wrapper = null;
  var preview = null;
  var ghost = null;
  var observer = null;
  var debounceTimer = null;
  var completion = "";
  var translationText = "";
  var lastInput = "";
  var requestId = 0;
  var boundTextarea = null;
  var translateModulePromise = null;
  var connectionModulePromise = null;
  var bindQueued = false;
  var normalizingDom = false;
  async function loadSettingsHtml() {
    const response = await fetch("/scripts/extensions/third-party/SillyTavern-Inline-Assistant/settings.html");
    return response.text();
  }
  function bindInput(id, key, type = "value") {
    const element = document.getElementById(id);
    if (!element) return;
    const s = settings();
    if (type === "checked" && element instanceof HTMLInputElement) element.checked = Boolean(s[key]);
    else element.value = s[key];
    element.addEventListener(type === "checked" ? "change" : "input", () => {
      s[key] = type === "checked" && element instanceof HTMLInputElement ? element.checked : element.type === "number" ? Number(element.value) : element.value;
      save();
      renderRuntime();
      scheduleWork("settings");
    });
  }
  async function injectSettings() {
    if (document.getElementById(SETTINGS_PANEL_ID)) return;
    const container = document.querySelector("#rm_extensions_block #extensions_settings") ?? document.getElementById("extensions_settings");
    if (!container) return;
    const template = document.createElement("template");
    template.innerHTML = await loadSettingsHtml();
    container.append(template.content);
    const source = document.getElementById("ia_source_language");
    const target = document.getElementById("ia_target_language");
    fillLanguageSelect(source, true);
    fillLanguageSelect(target, false);
    bindInput("ia_enabled", "enabled", "checked");
    bindInput("ia_inline_enabled", "inlineEnabled", "checked");
    bindInput("ia_translation_enabled", "translationEnabled", "checked");
    bindInput("ia_debounce_ms", "debounceMs");
    bindInput("ia_min_chars", "minChars");
    bindInput("ia_debug", "debug", "checked");
    bindInput("ia_autocomplete_profile", "autocompleteProfile");
    bindInput("ia_max_completion_length", "maxCompletionLength");
    bindInput("ia_temperature", "temperature");
    bindInput("ia_last_messages_count", "lastMessagesCount");
    bindInput("ia_completion_word_space", "completionWordSpace", "checked");
    bindInput("ia_completion_debounce", "completionDebounce", "checked");
    bindInput("ia_manual_autocomplete", "manualAutocomplete", "checked");
    bindInput("ia_completion_prompt", "completionPrompt");
    bindResetButton("ia_reset_completion_prompt", "ia_completion_prompt", "completionPrompt");
    bindInput("ia_source_language", "sourceLanguage");
    bindInput("ia_target_language", "targetLanguage");
    bindInput("ia_translation_engine", "translationEngine");
    bindInput("ia_translation_profile", "translationProfile");
    bindInput("ia_translation_prompt", "translationPrompt");
    bindResetButton("ia_reset_translation_prompt", "ia_translation_prompt", "translationPrompt");
    bindInput("ia_trigger_word", "triggerWord", "checked");
    bindInput("ia_trigger_sentence", "triggerSentence", "checked");
    bindInput("ia_trigger_newline", "triggerNewline", "checked");
    bindInput("ia_trigger_debounce", "triggerDebounce", "checked");
    bindInput("ia_swap_languages", "swapLanguages", "checked");
    const s = settings();
    selectOption(source, s.sourceLanguage);
    selectOption(target, s.targetLanguage);
    await populateConnectionProfileSelects();
  }
  function bindResetButton(buttonId, inputId, key) {
    const button = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    if (!button || !input) return;
    button.addEventListener("click", () => {
      const s = settings();
      s[key] = DEFAULT_SETTINGS[key];
      input.value = s[key];
      save();
      scheduleWork("settings");
    });
  }
  async function populateConnectionProfileSelects() {
    const autocomplete = document.getElementById("ia_autocomplete_profile");
    const translation = document.getElementById("ia_translation_profile");
    if (!autocomplete || !translation) return;
    const profileOptions = await getConnectionProfiles().catch((error) => {
      console.warn("[Inline Assistant] Connection profiles unavailable", error);
      return [];
    });
    fillProfileSelect(autocomplete, [{ value: "current", label: "Current Connection Manager profile" }], profileOptions, settings().autocompleteProfile);
    fillProfileSelect(translation, [
      { value: "autocomplete-profile", label: "Use autocomplete profile" },
      { value: "current", label: "Current active connection" }
    ], profileOptions, settings().translationProfile);
  }
  function fillProfileSelect(select, defaults, profiles, selectedValue) {
    select.innerHTML = "";
    for (const item of defaults) {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      select.append(option);
    }
    for (const profile of profiles) {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.name;
      select.append(option);
    }
    select.value = selectedValue;
    if (select.value !== selectedValue) select.selectedIndex = 0;
  }
  async function getConnectionProfiles() {
    const service = await getConnectionManagerService();
    return service.getSupportedProfiles();
  }
  async function getConnectionManagerService() {
    connectionModulePromise ??= import("/scripts/extensions/shared.js");
    const module = await connectionModulePromise;
    if (!module.ConnectionManagerRequestService) {
      throw new Error("ConnectionManagerRequestService not found");
    }
    return module.ConnectionManagerRequestService;
  }
  function makeButton(title, icon, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu_button menu_button_icon";
    button.title = title;
    button.innerHTML = `<i class="fa-solid ${icon}"></i>`;
    button.addEventListener("click", onClick);
    return button;
  }
  function makeSendFormIconButton(title, icon, onClick) {
    const button = document.createElement("div");
    button.className = `fa-solid ${icon} interactable`;
    button.title = title;
    button.tabIndex = 0;
    button.setAttribute("role", "button");
    button.addEventListener("click", onClick);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    });
    return button;
  }
  function createPreview() {
    const panel = document.createElement("div");
    panel.id = PREVIEW_ID;
    panel.className = "inline-assistant-preview";
    const row = document.createElement("div");
    row.className = "inline-assistant-preview-row";
    const target = document.createElement("select");
    target.className = "text_pole inline-assistant-language-select";
    fillLanguageSelect(target, false);
    target.addEventListener("change", () => updateLanguage("targetLanguage", target.value));
    const output = document.createElement("div");
    output.className = "inline-assistant-preview-output";
    output.textContent = "Translation preview";
    const buttons = document.createElement("div");
    buttons.className = "inline-assistant-button-row";
    buttons.append(
      makeButton("Swap text", "fa-right-left", swapText),
      makeButton("Replace input", "fa-arrow-down", replaceInput),
      makeButton("Copy translation", "fa-copy", copyTranslation)
    );
    row.append(target, output, buttons);
    panel.append(row);
    return panel;
  }
  function createSourceSelect() {
    const source = document.createElement("select");
    source.id = SOURCE_SELECT_ID;
    source.className = "text_pole inline-assistant-language-select";
    fillLanguageSelect(source, true);
    source.addEventListener("change", () => updateLanguage("sourceLanguage", source.value));
    return source;
  }
  function createPreviewToggle() {
    const button = makeSendFormIconButton("Show/hide translation preview", "fa-language", togglePreview);
    button.id = PREVIEW_TOGGLE_ID;
    return button;
  }
  function createAutocompleteButton() {
    const button = makeSendFormIconButton("Trigger inline autocomplete", "fa-wand-magic-sparkles", triggerAutocomplete);
    button.id = AUTOCOMPLETE_BUTTON_ID;
    return button;
  }
  function createGhost() {
    const node = document.createElement("div");
    node.id = GHOST_ID;
    node.className = "inline-assistant-ghost";
    node.innerHTML = '<div class="inline-assistant-ghost-content"><span class="inline-assistant-ghost-prefix"></span><span class="inline-assistant-ghost-suggestion"></span></div>';
    return node;
  }
  function bindTextarea() {
    const next = document.getElementById("send_textarea");
    if (!(next instanceof HTMLTextAreaElement)) return;
    if (next === boundTextarea) {
      normalizeRuntimePlacement();
      return;
    }
    if (boundTextarea) {
      boundTextarea.classList.remove("inline-assistant-bound");
      boundTextarea.removeEventListener("input", onInput);
      boundTextarea.removeEventListener("keydown", onKeyDown);
      boundTextarea.removeEventListener("scroll", syncGhost);
    }
    textarea = next;
    boundTextarea = next;
    if (!textarea.parentElement.classList.contains("inline-assistant-textarea-wrap")) {
      wrapper = document.createElement("div");
      wrapper.id = EDITOR_CELL_ID;
      wrapper.className = "inline-assistant-textarea-wrap inline-assistant-editor-cell";
      textarea.parentElement.insertBefore(wrapper, textarea);
      wrapper.append(textarea);
    } else {
      wrapper = textarea.parentElement;
      wrapper.id = EDITOR_CELL_ID;
      wrapper.classList.add("inline-assistant-textarea-wrap", "inline-assistant-editor-cell");
    }
    preview = document.getElementById(PREVIEW_ID) ?? createPreview();
    placePreview(preview);
    ghost = document.getElementById(GHOST_ID) ?? createGhost();
    wrapper.prepend(ghost);
    textarea.classList.add("inline-assistant-bound");
    textarea.addEventListener("input", onInput);
    textarea.addEventListener("keydown", onKeyDown);
    textarea.addEventListener("scroll", syncGhost);
    normalizeRuntimePlacement();
    renderRuntime();
    scheduleWork("bind");
    log("bound textarea");
  }
  function normalizeRuntimePlacement() {
    if (!textarea || !wrapper || normalizingDom) return;
    normalizingDom = true;
    const existingPreview = document.getElementById(PREVIEW_ID);
    const previewSelectCount = existingPreview?.querySelectorAll(".inline-assistant-preview-row > select").length ?? 0;
    if (!existingPreview || previewSelectCount !== 1) {
      existingPreview?.remove();
      preview = createPreview();
    } else {
      preview = existingPreview;
    }
    placePreview(preview);
    wrapper.querySelectorAll(`:scope > select.text_pole:not(#${SOURCE_SELECT_ID})`).forEach((select) => select.remove());
    let sourceSelect = document.getElementById(SOURCE_SELECT_ID);
    if (!(sourceSelect instanceof HTMLSelectElement)) {
      sourceSelect?.remove();
      sourceSelect = createSourceSelect();
    }
    wrapper.id = EDITOR_CELL_ID;
    wrapper.classList.add("inline-assistant-textarea-wrap", "inline-assistant-editor-cell");
    let previewToggle = document.getElementById(PREVIEW_TOGGLE_ID);
    let autocompleteButton = document.getElementById(AUTOCOMPLETE_BUTTON_ID);
    if (settings().enabled) {
      if (!(previewToggle instanceof HTMLElement)) {
        previewToggle = createPreviewToggle();
      }
      if (!(autocompleteButton instanceof HTMLElement)) {
        autocompleteButton = createAutocompleteButton();
      }
      const leftSendForm = document.getElementById("leftSendForm");
      const rightSendForm = document.getElementById("rightSendForm");
      if (leftSendForm) {
        if (previewToggle.parentElement !== leftSendForm) leftSendForm.append(previewToggle);
        if (sourceSelect.parentElement !== leftSendForm) leftSendForm.append(sourceSelect);
      } else {
        if (previewToggle.parentElement !== wrapper || previewToggle !== wrapper.firstElementChild) wrapper.prepend(previewToggle);
        if (sourceSelect.parentElement !== wrapper || sourceSelect.nextElementSibling !== textarea) wrapper.insertBefore(sourceSelect, textarea);
      }
      if (rightSendForm) {
        if (autocompleteButton.parentElement !== rightSendForm) rightSendForm.prepend(autocompleteButton);
      } else if (autocompleteButton.parentElement !== wrapper || autocompleteButton.previousElementSibling !== textarea) {
        textarea.insertAdjacentElement("afterend", autocompleteButton);
      }
      autocompleteButton.hidden = !modeAllows("inline") || !settings().manualAutocomplete;
    } else {
      previewToggle?.remove();
      autocompleteButton?.remove();
      sourceSelect.remove();
    }
    ghost = document.getElementById(GHOST_ID) ?? createGhost();
    if (ghost.parentElement !== wrapper || ghost.nextElementSibling !== textarea) {
      wrapper.insertBefore(ghost, textarea);
    }
    queueMicrotask(() => {
      normalizingDom = false;
    });
  }
  function placePreview(node) {
    const formShell = document.getElementById("form_sheld");
    if (formShell?.parentElement) {
      if (node.parentElement !== formShell.parentElement || node.nextElementSibling !== formShell) {
        formShell.parentElement.insertBefore(node, formShell);
      }
      return;
    }
    if (node.parentElement !== wrapper || node !== wrapper.firstElementChild) {
      wrapper.prepend(node);
    }
  }
  function modeAllows(kind) {
    const s = settings();
    if (!s.enabled) return false;
    return kind === "inline" ? s.inlineEnabled : s.translationEnabled;
  }
  function renderRuntime() {
    if (!preview || !ghost) return;
    const s = settings();
    if (!s.enabled) {
      document.getElementById(PREVIEW_TOGGLE_ID)?.remove();
      document.getElementById(AUTOCOMPLETE_BUTTON_ID)?.remove();
      document.getElementById(SOURCE_SELECT_ID)?.remove();
      preview.hidden = true;
      ghost.hidden = true;
      return;
    }
    if (!document.getElementById(PREVIEW_TOGGLE_ID) || !document.getElementById(AUTOCOMPLETE_BUTTON_ID) || !document.getElementById(SOURCE_SELECT_ID)) {
      normalizeRuntimePlacement();
    }
    const previewHidden = !modeAllows("translate") || !s.previewVisible;
    preview.hidden = previewHidden;
    const source = document.getElementById(SOURCE_SELECT_ID);
    if (source) source.hidden = previewHidden;
    const previewToggle = document.getElementById(PREVIEW_TOGGLE_ID);
    if (previewToggle) previewToggle.hidden = !s.translationEnabled;
    const autocompleteButton = document.getElementById(AUTOCOMPLETE_BUTTON_ID);
    if (autocompleteButton) autocompleteButton.hidden = !modeAllows("inline") || !s.manualAutocomplete;
    ghost.hidden = !modeAllows("inline") || !completion;
    syncPreviewControls();
    renderTranslation();
    renderGhost();
  }
  function syncPreviewControls() {
    if (!preview) return;
    const s = settings();
    const source = document.getElementById(SOURCE_SELECT_ID);
    const target = preview.querySelector("select");
    if (source) selectOption(source, s.sourceLanguage);
    if (target) selectOption(target, s.targetLanguage);
    if (source) compactSelectedLanguageLabel(source);
    if (target) compactSelectedLanguageLabel(target);
  }
  function renderTranslation(pending = false) {
    const output = preview?.querySelector(".inline-assistant-preview-output");
    if (!output) return;
    output.classList.toggle("is-pending", pending);
    output.textContent = pending ? "Translating\u2026" : translationText || "Translation preview";
  }
  function renderGhost() {
    if (!ghost || !textarea) return;
    const textareaStyle = getComputedStyle(textarea);
    ghost.style.left = `${textarea.offsetLeft}px`;
    ghost.style.top = `${textarea.offsetTop}px`;
    ghost.style.width = `${textarea.offsetWidth}px`;
    ghost.style.height = `${textarea.offsetHeight}px`;
    ghost.style.padding = textareaStyle.padding;
    ghost.style.border = textareaStyle.border;
    ghost.style.borderColor = "transparent";
    ghost.style.font = textareaStyle.font;
    ghost.style.lineHeight = textareaStyle.lineHeight;
    ghost.style.letterSpacing = textareaStyle.letterSpacing;
    ghost.style.textAlign = textareaStyle.textAlign;
    ghost.style.tabSize = textareaStyle.tabSize;
    const content = ghost.querySelector(".inline-assistant-ghost-content");
    if (content instanceof HTMLElement) {
      content.style.transform = `translate(${-textarea.scrollLeft}px, ${-textarea.scrollTop}px)`;
      content.style.width = `${textarea.scrollWidth}px`;
      content.style.minHeight = `${textarea.scrollHeight}px`;
    }
    const cursor = textarea.selectionStart;
    ghost.querySelector(".inline-assistant-ghost-prefix").textContent = textarea.value.slice(0, cursor);
    ghost.querySelector(".inline-assistant-ghost-suggestion").textContent = completion;
    ghost.hidden = !modeAllows("inline") || !completion;
  }
  function syncGhost() {
    renderGhost();
  }
  function onInput() {
    completion = "";
    scheduleWork("input");
    renderRuntime();
  }
  function onKeyDown(event) {
    const s = settings();
    if (event.key === s.acceptKey && completion && modeAllows("inline")) {
      event.preventDefault();
      insertAtCursor(completion);
      completion = "";
      scheduleWork("accept");
      renderRuntime();
    }
    if (event.key === s.dismissKey && completion) {
      event.preventDefault();
      completion = "";
      renderRuntime();
    }
  }
  function insertAtCursor(text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function scheduleWork(reason) {
    if (!textarea) return;
    clearTimeout(debounceTimer);
    const s = settings();
    const value = textarea.value;
    const shouldRunNow = shouldTrigger(value, lastInput, reason);
    lastInput = value;
    if (!s.enabled || value.trim().length < s.minChars) {
      completion = "";
      translationText = "";
      renderRuntime();
      return;
    }
    if (shouldRunNow && !s.triggerDebounce && !s.completionDebounce) runWork();
    if (s.triggerDebounce || s.completionDebounce) debounceTimer = setTimeout(runWork, s.debounceMs);
  }
  function shouldTrigger(value, previous, reason) {
    const s = settings();
    if (reason === "bind" || reason === "settings") return true;
    const added = value.slice(previous.length);
    return s.triggerWord && /\s$/.test(added) || s.triggerSentence && /[.!?;:,]$/.test(added) || s.triggerNewline && /\n$/.test(added);
  }
  function triggerAutocomplete() {
    if (!textarea) return;
    completion = "";
    runCompletion(textarea.value);
  }
  function runWork() {
    const id = ++requestId;
    const input = textarea?.value ?? "";
    if (!input.trim()) return;
    if (modeAllows("inline") && !settings().manualAutocomplete) {
      runCompletion(input, id);
    }
    if (modeAllows("translate") && settings().previewVisible) {
      renderTranslation(true);
      translateInput(input).then((result) => {
        if (id !== requestId) return;
        translationText = result;
        renderTranslation(false);
      }).catch((error) => {
        if (id !== requestId) return;
        console.error("[Inline Assistant] Translation failed", error);
        translationText = "";
        renderTranslation(false);
      });
    }
  }
  function runCompletion(input, expectedRequestId = ++requestId) {
    if (!modeAllows("inline")) return;
    if (!shouldRunCompletion(input)) {
      completion = "";
      renderGhost();
      return;
    }
    generateCompletion(input).then((result) => {
      if (expectedRequestId !== requestId) return;
      completion = result;
      renderGhost();
    }).catch((error) => {
      if (expectedRequestId !== requestId) return;
      console.error("[Inline Assistant] Completion failed", error);
      completion = "";
      renderGhost();
    });
  }
  function shouldRunCompletion(input) {
    const s = settings();
    const requiresSpace = s.completionWordSpace;
    return !requiresSpace || /\S\s$/.test(input);
  }
  async function translateInput(input) {
    const s = settings();
    if (s.translationEngine === "st-api") {
      return translateWithSillyTavern(input, s.targetLanguage);
    }
    const profileId = resolveProfileId(s.translationProfile === "autocomplete-profile" ? s.autocompleteProfile : s.translationProfile);
    if (!profileId) throw new Error("No Connection Manager profile selected for translation");
    const prompt = s.translationPrompt.replaceAll("{{input}}", input).replaceAll("{{sourceLanguage}}", getLanguageLabel(s.sourceLanguage)).replaceAll("{{targetLanguage}}", getLanguageLabel(s.targetLanguage));
    return generateWithConnectionProfile(profileId, [{ role: "user", content: prompt }], s.maxCompletionLength * 2);
  }
  async function generateCompletion(input) {
    const s = settings();
    const profileId = resolveProfileId(s.autocompleteProfile);
    if (!profileId) throw new Error("No Connection Manager profile selected for autocomplete");
    const cleanInput = removeThinkingBlocks(input);
    const draftPrompt = renderCompletionPrompt(cleanInput);
    const result = await generateWithConnectionProfile(profileId, buildCompletionMessages(draftPrompt, cleanInput, s), s.maxCompletionLength, {
      custom_exclude_body: "- logprobs\n- top_logprobs",
      stop: ["<think>", "</think>", ".", ";", ":", '"', "\u201D"]
    });
    return cleanupCompletion(cleanInput, extractCompletionText(result), draftPrompt);
  }
  function renderCompletionPrompt(input) {
    const s = settings();
    return String(s.completionPrompt || "{{input}}").replaceAll("{{input}}", input).replaceAll("{{user}}", context().name1 ?? "User").replaceAll("{{char}}", context().name2 ?? "Assistant");
  }
  function buildCompletionMessages(instruction, draft, s) {
    const messages = [{ role: "system", content: `${instruction}

Predict the user's next typed text. The recent chat roles are intentionally inverted so the active draft can be completed as a user-style message.` }];
    messages.push(...getLastChatMessages(s.lastMessagesCount));
    if (messages.at(-1)?.role !== "user") {
      messages.push({ role: "user", content: "" });
    }
    messages.push({ role: "assistant", content: draft });
    return messages;
  }
  function getLastChatMessages(count) {
    const chat = context().chat;
    if (!Array.isArray(chat)) return [];
    return chat.slice(-Math.max(0, Number(count) || 0)).filter((message) => message?.mes && !message.is_system).map((message) => ({
      role: message.is_user ? "assistant" : "user",
      content: removeThinkingBlocks(String(message.mes ?? "")).trim()
    })).filter((message) => message.content);
  }
  function resolveProfileId(profileSetting) {
    if (!profileSetting || profileSetting === "current") {
      return context().extensionSettings.connectionManager?.selectedProfile ?? null;
    }
    return profileSetting;
  }
  async function generateWithConnectionProfile(profileId, messages, maxTokens, overridePayload = {}) {
    const s = settings();
    const service = await getConnectionManagerService();
    const response = await service.sendRequest(profileId, messages, maxTokens, {
      extractData: true,
      includePreset: true,
      includeInstruct: true,
      stream: false
    }, {
      temperature: Number(s.temperature),
      ...overridePayload,
      custom_prompt_post_processing: "none",
      custom_include_body: "chat_template_kwargs:\n  enable_thinking: false\n  preserve_thinking: false"
    });
    return response?.content ?? response?.text ?? response?.data ?? response ?? "";
  }
  function extractCompletionText(result) {
    if (typeof result === "string") {
      try {
        const parsed = JSON.parse(result);
        return parsed?.completion ?? result;
      } catch {
        return result;
      }
    }
    if (result && typeof result === "object") {
      return result.completion ?? result.content?.completion ?? result.content ?? "";
    }
    return String(result ?? "");
  }
  function cleanupCompletion(input, result, renderedPrompt = input) {
    let output = removeThinkingBlocks(String(result ?? "")).trim();
    if (output.startsWith(renderedPrompt)) output = output.slice(renderedPrompt.length).trimStart();
    if (output.startsWith(input)) output = output.slice(input.length).trimStart();
    return output.replace(/^['"“”]+|['"“”]+$/g, "");
  }
  function removeThinkingBlocks(text) {
    return String(text ?? "").replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/<\/?think>/gi, "").trimStart();
  }
  async function translateWithSillyTavern(input, targetLanguage) {
    translateModulePromise ??= import("/scripts/extensions/translate/index.js");
    const module = await translateModulePromise;
    if (typeof module.translate !== "function") {
      throw new Error("SillyTavern translate extension did not export translate()");
    }
    return module.translate(input, targetLanguage);
  }
  function getLanguageLabel(value) {
    const normalized = normalizeLanguageValue(value, value);
    return getLanguageOptions(true).find(([id]) => id === normalized)?.[1] ?? normalized;
  }
  function togglePreview() {
    const s = settings();
    s.previewVisible = !s.previewVisible;
    save();
    renderRuntime();
  }
  function updateLanguage(key, value) {
    settings()[key] = value;
    const matching = document.getElementById(key === "sourceLanguage" ? "ia_source_language" : "ia_target_language");
    if (matching instanceof HTMLInputElement || matching instanceof HTMLTextAreaElement || matching instanceof HTMLSelectElement) matching.value = value;
    save();
    scheduleWork("settings");
  }
  function swapText() {
    if (!textarea || !translationText) return;
    const original = textarea.value;
    textarea.value = translationText;
    translationText = original;
    if (settings().swapLanguages && settings().sourceLanguage !== "auto") {
      const s = settings();
      [s.sourceLanguage, s.targetLanguage] = [s.targetLanguage, s.sourceLanguage];
      save();
    }
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    renderRuntime();
  }
  function replaceInput() {
    if (!textarea || !translationText) return;
    textarea.value = translationText;
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }
  async function copyTranslation() {
    if (!translationText) return;
    await navigator.clipboard.writeText(translationText);
    globalThis.toastr?.success?.("Translation copied");
  }
  function queueBindTextarea() {
    if (normalizingDom || bindQueued) return;
    bindQueued = true;
    requestAnimationFrame(() => {
      bindQueued = false;
      bindTextarea();
    });
  }
  function startObserver() {
    observer?.disconnect();
    observer = new MutationObserver(queueBindTextarea);
    observer.observe(document.body, { childList: true, subtree: true });
  }
  (async function init() {
    settings();
    await injectSettings();
    bindTextarea();
    startObserver();
    save();
  })();
})();
