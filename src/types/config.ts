import { PlatformConfig } from 'homebridge';

export interface NatureRemoPlatformConfig extends PlatformConfig {
  token: string;
  refreshRate: number;
  options?: Options | Record<string, never>;
}

export type Options = {
  devices?: Array<DeviceConfig>;
};

export type DeviceConfig = {
  name: string;
};
