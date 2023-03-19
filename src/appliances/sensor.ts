import { PlatformAccessory } from 'homebridge';
import NatureRemoRemotePlatform from '../platform';
import { Device } from '../types/device';
import { isNotMini } from '../utils';
import { NatureRemoAccessory } from './base';

export class Sensor extends NatureRemoAccessory {
  constructor(
    protected readonly platform: NatureRemoRemotePlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly device: Device,
  ) {
    super();
    accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Nature')
      .setCharacteristic(
        this.platform.Characteristic.Model,
        device.firmware_version.split('/')[0],
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        device.serial_number,
      )
      .setCharacteristic(
        this.platform.Characteristic.FirmwareRevision,
        device.firmware_version,
      );

    (
      accessory.getService(this.platform.Service.TemperatureSensor) ||
      accessory.addService(this.platform.Service.TemperatureSensor)
    )
      .setCharacteristic(
        this.platform.Characteristic.Name,
        `${this.device.name} 温度計`,
      )
      .setCharacteristic(
        this.platform.Characteristic.ConfiguredName,
        `${this.device.name} 温度計`,
      )
      .updateCharacteristic(
        this.platform.Characteristic.CurrentTemperature,
        device.newest_events.te.val,
      );

    if (isNotMini(device)) {
      (
        accessory.getService(this.platform.Service.HumiditySensor) ||
        accessory.addService(this.platform.Service.HumiditySensor)
      )
        .setCharacteristic(
          this.platform.Characteristic.Name,
          `${this.device.name} 湿度計`,
        )
        .setCharacteristic(
          this.platform.Characteristic.ConfiguredName,
          `${this.device.name} 湿度計`,
        )
        .updateCharacteristic(
          this.platform.Characteristic.CurrentRelativeHumidity,
          device.newest_events.hu!.val,
        );
      const lightLevel =
        device.newest_events.il!.val === 0
          ? 0.0001
          : device.newest_events.il!.val;

      (
        accessory.getService(this.platform.Service.LightSensor) ||
        accessory.addService(this.platform.Service.LightSensor)
      )
        .setCharacteristic(
          this.platform.Characteristic.Name,
          `${this.device.name} 照度計`,
        )
        .setCharacteristic(
          this.platform.Characteristic.ConfiguredName,
          `${this.device.name} 照度計`,
        )
        .updateCharacteristic(
          this.platform.Characteristic.CurrentAmbientLightLevel,
          lightLevel,
        );
    }
  }
}
