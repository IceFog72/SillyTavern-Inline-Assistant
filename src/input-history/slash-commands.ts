import { MODULE_NAME } from './constants.js';
import { DEFAULT_IH_SETTINGS, IHSettings, ihSave, ihSettings } from './settings.js';
import { addToInputHistory } from './store.js';
import { updateButtonVisibility } from './buttons.js';

type SettingKey = keyof IHSettings;
type SettingValue = IHSettings[SettingKey];

const SETTING_TYPES: Record<SettingKey, (v: string) => SettingValue> = {
    maxHistory: (v) => Number(v),
    showButtons: isTrueBoolean,
    showArrowButtons: isTrueBoolean,
    showHistoryButton: isTrueBoolean,
};

function isTrueBoolean(v: string): boolean {
    return v?.toLowerCase?.() === 'true';
}

function toastrError(msg: string): void {
    (globalThis as unknown as { toastr?: { error?: (m: string) => void } }).toastr?.error?.(msg);
}
function toastrInfo(msg: string): void {
    (globalThis as unknown as { toastr?: { info?: (m: string) => void } }).toastr?.info?.(msg);
}

export function registerSlashCommands(): void {
    const SlashCommandParserMod = (globalThis as Record<string, unknown>).SlashCommandParser as {
        addCommandObject?: (cmd: unknown) => void;
    } | undefined;
    const SlashCommandMod = (globalThis as Record<string, unknown>).SlashCommand as {
        fromProps?: (props: unknown) => unknown;
    } | undefined;
    const SlashCommandNamedArgumentMod = (globalThis as Record<string, unknown>).SlashCommandNamedArgument as {
        fromProps?: (props: unknown) => unknown;
    } | undefined;
    const SlashCommandArgumentMod = (globalThis as Record<string, unknown>).SlashCommandArgument as {
        fromProps?: (props: unknown) => unknown;
    } | undefined;
    const ARGUMENT_TYPE = (globalThis as unknown as Record<string, Record<string, string>>).ARGUMENT_TYPE;

    if (!SlashCommandParserMod?.addCommandObject || !SlashCommandMod?.fromProps) return;

    const allKeys = Object.keys(DEFAULT_IH_SETTINGS) as SettingKey[];

    SlashCommandParserMod.addCommandObject(
        SlashCommandMod.fromProps({
            name: 'inputhistory-config',
            callback: ({ key, get }: { key: string; get: string }, value: string) => {
                if (!key) { toastrError(`Required argument "key" missing for /inputhistory-config`); return; }
                if (!allKeys.includes(key as SettingKey)) { toastrError(`Invalid "key" argument "${key}" for /inputhistory-config`); return; }
                const s = ihSettings();
                if (isTrueBoolean(get)) {
                    toastrInfo(`Input History setting ${key} = ${JSON.stringify(s[key as SettingKey])}`);
                    return JSON.stringify(s[key as SettingKey]);
                }
                (s as unknown as Record<string, SettingValue>)[key] = SETTING_TYPES[key as SettingKey](value.trim());
                updateButtonVisibility();
                ihSave();
            },
            aliases: ['ih-config'],
            namedArgumentList: [
                SlashCommandNamedArgumentMod?.fromProps?.({
                    name: 'key',
                    description: 'Setting key to change or retrieve',
                    typeList: [ARGUMENT_TYPE?.STRING ?? 'string'],
                    enumList: allKeys,
                    isRequired: true,
                }),
                SlashCommandNamedArgumentMod?.fromProps?.({
                    name: 'get',
                    description: 'Retrieve value without changing',
                    typeList: [ARGUMENT_TYPE?.BOOLEAN ?? 'boolean'],
                    isRequired: false,
                    defaultValue: 'false',
                    enumList: ['true', 'false'],
                }),
            ].filter(Boolean),
            unnamedArgumentList: [
                SlashCommandArgumentMod?.fromProps?.({
                    description: 'New config value',
                    typeList: [ARGUMENT_TYPE?.NUMBER ?? 'number', ARGUMENT_TYPE?.BOOLEAN ?? 'boolean'],
                    isRequired: false,
                }),
            ].filter(Boolean),
            helpString: `Change ${MODULE_NAME} settings. Use <code>get=true</code> to read current value.`,
        }),
    );

    SlashCommandParserMod.addCommandObject(
        SlashCommandMod.fromProps({
            name: 'inputhistory-add',
            callback: (_args: unknown, value: string) => {
                if (!value.trim()) { toastrError('Required string missing for /inputhistory-add'); return; }
                addToInputHistory(value);
            },
            aliases: ['ih-add'],
            unnamedArgumentList: [
                SlashCommandArgumentMod?.fromProps?.({
                    description: 'String to add to input history',
                    typeList: [ARGUMENT_TYPE?.STRING ?? 'string'],
                    isRequired: true,
                }),
            ].filter(Boolean),
            helpString: 'Adds a string to Input History.',
        }),
    );
}
