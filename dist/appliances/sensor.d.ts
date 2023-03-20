import { PlatformAccessory } from 'homebridge';
import NatureRemoRemotePlatform from '../platform';
import { Device } from '../types/device';
import { NatureRemoAccessory } from './base';
export declare class Sensor extends NatureRemoAccessory {
    protected readonly platform: NatureRemoRemotePlatform;
    protected readonly accessory: PlatformAccessory;
    protected readonly device: Device;
    constructor(platform: NatureRemoRemotePlatform, accessory: PlatformAccessory, device: Device);
}
//# sourceMappingURL=sensor.d.ts.map