import { API, Categories, DynamicPlatformPlugin, Logger, LogLevel, PlatformAccessory, PlatformConfig, UnknownContext } from 'homebridge';
import { BehaviorSubject } from 'rxjs';
import { INatureRemoApi } from './api';
import { ApplianceAircon, ApplianceIR } from './types/appliance';
import { NatureRemoPlatformConfig } from './types/config';
import { Device } from './types/device';
export default class NatureRemoRemotePlatform implements DynamicPlatformPlugin {
    readonly logger: Logger;
    readonly config: PlatformConfig;
    readonly api: API;
    readonly Service: typeof import("homebridge").Service;
    readonly Characteristic: typeof import("homebridge").Characteristic;
    readonly accessories: PlatformAccessory[];
    readonly airconAppliancesSubject: BehaviorSubject<ApplianceAircon[]>;
    readonly irAppliancesSubject: BehaviorSubject<ApplianceIR[]>;
    readonly devicesSubject: BehaviorSubject<Device[]>;
    readonly natureRemoApi: INatureRemoApi;
    readonly safeConfig: NatureRemoPlatformConfig;
    constructor(logger: Logger, config: PlatformConfig, api: API);
    discoverDevices(): void;
    registerPlatformAccessories(id: string, displayName: string, setupAccessory: (accessory: PlatformAccessory) => void, category?: Categories): void;
    unregisterPlatformAccessories(): void;
    unregisterPlatformAccessory(targets: Array<{
        id: string;
    }>, category: Categories): void;
    configureAccessory(accessory: PlatformAccessory<UnknownContext>): void;
    log(message: string, logLevel?: LogLevel): void;
}
//# sourceMappingURL=platform.d.ts.map