import { PlatformAccessory } from 'homebridge';
import NatureRemoRemotePlatform from '../platform';
import { ApplianceIR } from '../types/appliance';
import { ApplianceIRTV } from '../types/config';
import { NatureRemoAccessory } from './base';
export declare class IRTV extends NatureRemoAccessory {
    protected readonly platform: NatureRemoRemotePlatform;
    protected readonly accessory: PlatformAccessory;
    protected readonly ir: ApplianceIR;
    protected readonly irTVConfig: ApplianceIRTV;
    constructor(platform: NatureRemoRemotePlatform, accessory: PlatformAccessory, ir: ApplianceIR, irTVConfig: ApplianceIRTV);
    sendSignal(target: string): void;
}
//# sourceMappingURL=irtv.d.ts.map