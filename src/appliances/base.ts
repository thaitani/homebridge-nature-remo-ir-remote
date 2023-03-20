import { LogLevel, PlatformAccessory, Service, WithUUID } from 'homebridge';
import NatureRemoRemotePlatform from '../platform';
import { getCategoryName } from '../utils';

type AccessoryInformation = {
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareRevision: string;
};

export abstract class NatureRemoAccessory {
  constructor(
    protected platform: NatureRemoRemotePlatform,
    protected accessory: PlatformAccessory,
  ) {}

  protected Characteristic = this.platform.Characteristic;
  protected Service = this.platform.Service;
  protected natureRemoApi = this.platform.natureRemoApi;

  setAccessoryInformation(info: AccessoryInformation) {
    this.accessory
      .getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, info.manufacturer)
      .setCharacteristic(this.Characteristic.Model, info.model)
      .setCharacteristic(this.Characteristic.SerialNumber, info.serialNumber)
      .setCharacteristic(
        this.Characteristic.FirmwareRevision,
        info.firmwareRevision,
      );
  }

  getOrAddService(service: WithUUID<typeof Service>) {
    return (
      this.accessory.getService(service) ||
      this.accessory.addService(service as unknown as Service)
    );
  }

  log(message: string, logLevel = LogLevel.DEBUG) {
    this.platform.logger.log(
      logLevel,
      `{${getCategoryName(this.accessory.category)}:${
        this.accessory.displayName
      }} ${message}`,
    );
  }
}
