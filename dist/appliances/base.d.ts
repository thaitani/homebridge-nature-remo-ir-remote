import { LogLevel, PlatformAccessory, Service, WithUUID } from 'homebridge';
import NatureRemoRemotePlatform from '../platform';
type AccessoryInformation = {
    manufacturer: string;
    model: string;
    serialNumber: string;
    firmwareRevision: string;
};
export declare abstract class NatureRemoAccessory {
    protected platform: NatureRemoRemotePlatform;
    protected accessory: PlatformAccessory;
    constructor(platform: NatureRemoRemotePlatform, accessory: PlatformAccessory);
    protected Characteristic: typeof import("homebridge").Characteristic;
    protected Service: typeof Service;
    protected natureRemoApi: import("../api").INatureRemoApi;
    setAccessoryInformation(info: AccessoryInformation): void;
    getOrAddService(service: WithUUID<typeof Service>): Service;
    log(message: string, logLevel?: LogLevel): void;
}
export {};
//# sourceMappingURL=base.d.ts.map