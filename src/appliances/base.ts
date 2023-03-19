import { LogLevel, PlatformAccessory } from 'homebridge';
import NatureRemoRemotePlatform from '../platform';
import { getCategoryName } from '../utils';

export abstract class NatureRemoAccessory {
  protected abstract platform: NatureRemoRemotePlatform;
  protected abstract accessory: PlatformAccessory;

  log(message: string, logLevel = LogLevel.DEBUG) {
    this.platform.logger.log(
      logLevel,
      `{${getCategoryName(this.accessory.category)}:${
        this.accessory.displayName
      }} ${message}`,
    );
  }
}
