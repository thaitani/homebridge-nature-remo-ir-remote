import { AxiosResponse } from 'axios';
import { LogLevel, Logger } from 'homebridge';
import { Appliance, Settings } from './types/appliance';
import { Device } from './types/device';
export type AirconSettingParams = {
    button: 'power-off' | '';
    dir?: string;
    dirh?: string;
    operation_mode?: string;
    temperature?: string;
    volume?: string;
};
export type AirconSettingsResponse = Settings;
export interface INatureRemoApi {
    sendSignal(signal: string): Promise<void>;
    airconSettings(applianceId: string, params: AirconSettingParams): Promise<AirconSettingsResponse | undefined>;
    getDevices(): Promise<Device[] | undefined>;
    getAppliances(): Promise<Appliance[] | undefined>;
}
export declare class NatureRemoApi implements INatureRemoApi {
    private readonly token;
    private readonly logger;
    constructor(token: string, logger: Logger);
    private readonly baseHeaders;
    airconSettings(applianceId: string, params: AirconSettingParams): Promise<AirconSettingsResponse | undefined>;
    sendSignal(signal: string): Promise<void | undefined>;
    getDevices(): Promise<Device[] | undefined>;
    getAppliances(): Promise<Appliance[] | undefined>;
    _request<T>(method: 'GET' | 'POST', path: string, data?: any): Promise<T | undefined>;
    limitLogging(res: AxiosResponse, path: string, logLevel?: LogLevel): void;
    log(message: string, path: string, logLevel?: LogLevel): void;
}
//# sourceMappingURL=api.d.ts.map