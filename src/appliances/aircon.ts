import { LogLevel, PlatformAccessory } from 'homebridge';
import NatureRemoIRHomebridgePlatform from '../platform';
import { ApplianceAircon } from '../types/appliance';
import { getCategoryName } from './../utils';

export class Aircon {
  constructor(
    private readonly platform: NatureRemoIRHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly aircon: ApplianceAircon,
  ) {
    this.log('setup start');

    accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        aircon.model.manufacturer,
      )
      .setCharacteristic(this.platform.Characteristic.Model, aircon.model.name)
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        aircon.model.series,
      )
      .setCharacteristic(
        this.platform.Characteristic.FirmwareRevision,
        aircon.device.firmware_version,
      );

    (
      accessory.getService(this.platform.Service.Thermostat) ||
      accessory.addService(this.platform.Service.Thermostat)
    ).setCharacteristic(this.platform.Characteristic.Name, aircon.nickname);
  }

  log(message: string, logLevel = LogLevel.DEBUG) {
    this.platform.log.log(
      logLevel,
      `{${getCategoryName(this.accessory.category)}:${
        this.aircon.nickname
      }} ${message}`,
    );
  }
}
