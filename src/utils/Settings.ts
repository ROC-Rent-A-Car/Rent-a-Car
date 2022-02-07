import { SettingsObject } from "../interfaces/settings/SettingsObject";

export class Settings {

    private readonly object: SettingsObject;

    constructor(object: SettingsObject) {
        this.object = object;
    }

    public get<K extends keyof SettingsObject>(key: K): SettingsObject[K] {
        return this.object[key];
    }

    public set<K extends keyof SettingsObject>(key: K, value: SettingsObject[K]): void {
        this.object[key] = value;
    }
}