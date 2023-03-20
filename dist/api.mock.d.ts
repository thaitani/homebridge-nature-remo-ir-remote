import { Logger } from 'homebridge';
import { AirconSettingParams, AirconSettingsResponse, INatureRemoApi } from './api';
import { Appliance } from './types/appliance';
import { Device } from './types/device';
export declare class ApiMock implements INatureRemoApi {
    private readonly logger;
    constructor(logger: Logger);
    airconSettings(applianceId: string, params: AirconSettingParams): Promise<AirconSettingsResponse | undefined>;
    sendSignal(signal: string): Promise<void | undefined>;
    getDevices(): Promise<Device[] | undefined>;
    getAppliances(): Promise<Appliance[] | undefined>;
}
//# sourceMappingURL=api.mock.d.ts.map