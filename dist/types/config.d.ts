import { PlatformConfig } from 'homebridge';
export interface NatureRemoPlatformConfig extends PlatformConfig {
    token: string;
    devicesRefreshRate: number;
    appliancesRefreshRate: number;
    sensors: Array<SensorConfig>;
    appliances: Array<ApplianceConfig>;
}
export type ApplianceConfig = ApplianceAircon | ApplianceIRTV;
type ApplianceBase = {
    name: string;
};
export type ApplianceAircon = {
    type: 'aircon';
} & ApplianceBase;
export type ApplianceIRTV = {
    type: 'irtv';
    mapping: IRTVMappingConfig;
} & ApplianceBase;
type IRTVMappingConfig = {
    active?: string;
    volumeUp?: string;
    volumeDown?: string;
    rewind?: string;
    fastForward?: string;
    nextTrack?: string;
    previousTrack?: string;
    arrowUp?: string;
    arrowDown?: string;
    arrowLeft?: string;
    arrowRight?: string;
    select?: string;
    back?: string;
    exit?: string;
    playPause?: string;
    information?: string;
    inputSource?: Array<InputSourceConfig>;
};
type InputSourceConfig = {
    name: string;
    signal: string;
};
type SensorConfig = {
    name: string;
};
export {};
//# sourceMappingURL=config.d.ts.map