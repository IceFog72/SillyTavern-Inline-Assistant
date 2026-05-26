declare const SillyTavern: {
  getContext(): {
    extensionSettings: Record<string, Record<string, any>> & {
      connectionManager?: { selectedProfile?: string };
    };
    saveSettingsDebounced?: () => void;
    name1?: string;
    name2?: string;
    chat?: Array<{ mes?: string; is_system?: boolean; is_user?: boolean }>;
  };
};

declare module '/scripts/extensions/shared.js' {
  export const ConnectionManagerRequestService: {
    getSupportedProfiles(): Promise<Array<{ id: string; name: string }>>;
    sendRequest(
      profileId: string,
      messages: Array<{ role: string; content: string }>,
      maxTokens: number,
      options: Record<string, unknown>,
      payload: Record<string, unknown>,
    ): Promise<unknown>;
  };
}

declare module '/scripts/extensions/translate/index.js' {
  export function translate(input: string, targetLanguage: string): Promise<string>;
}

interface Toastr {
  success?: (message: string) => void;
}

interface Window {
  toastr?: Toastr;
}

declare global {
  var translate: ((input: string, targetLanguage: string, provider?: string | null) => Promise<string>) | undefined;
}

declare var toastr: Toastr | undefined;

// SillyTavern event system (used by InputHistory sub-module)
declare const eventSource: {
    on(event: string, callback: (...args: unknown[]) => void): void;
    emit(event: string, ...args: unknown[]): void;
} | undefined;

declare const event_types: Record<string, string> | undefined;
