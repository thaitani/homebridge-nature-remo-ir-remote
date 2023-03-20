import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import NatureRemoRemotePlatform from '../platform';
import { ApplianceAircon, Settings } from '../types/appliance';
import { AirconSettingParams } from './../api';
import { NatureRemoAccessory } from './base';
type AirconSettings = {
    targetMode: CharacteristicValue;
    targetTemperature: CharacteristicValue;
    targetVolume: CharacteristicValue;
    tempUnit: CharacteristicValue;
};
export declare class Aircon extends NatureRemoAccessory {
    protected readonly platform: NatureRemoRemotePlatform;
    protected readonly accessory: PlatformAccessory;
    protected readonly aircon: ApplianceAircon;
    private settings;
    volumeMapping: {
        readonly auto: 0;
        readonly '1': 25;
        readonly '2': 50;
        readonly '3': 75;
        readonly '4': 100;
    };
    constructor(platform: NatureRemoRemotePlatform, accessory: PlatformAccessory, aircon: ApplianceAircon);
    minTemperature(): number;
    maxTemperature(): number;
    fromSettings(settings: Settings): AirconSettings;
    sendAirconSetting(params: AirconSettingParams): Promise<void>;
}
export {};
//# sourceMappingURL=aircon.d.ts.map