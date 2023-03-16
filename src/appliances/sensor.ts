import { LogLevel, PlatformAccessory } from 'homebridge';
import NatureRemoIRHomebridgePlatform from '../platform';
import { Device } from '../types/device';
import { getCategoryName, isNotMini } from '../utils';

export class Sensor {
  constructor(
    private readonly platform: NatureRemoIRHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device: Device,
  ) {
    this.log('setup sensor');

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
          device.newest_events.il!.val,
        );
    }
  }

  log(message: string, logLevel = LogLevel.DEBUG) {
    this.platform.log.log(
      logLevel,
      `{${getCategoryName(this.accessory.category)}:${
        this.device.name
      }} ${message}`,
    );
  }
}
