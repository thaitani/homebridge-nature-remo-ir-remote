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
    super(platform, accessory);
    this.setAccessoryInformation({
      manufacturer: 'Nature',
      model: device.firmware_version.split('/')[0],
      serialNumber: device.serial_number,
      firmwareRevision: device.firmware_version,
    });

    this.getOrAddService(this.Service.TemperatureSensor)
      .setCharacteristic(this.Characteristic.Name, `${this.device.name} 温度計`)
      .setCharacteristic(
        this.Characteristic.ConfiguredName,
        `${this.device.name} 温度計`,
      )
      .updateCharacteristic(
        this.Characteristic.CurrentTemperature,
        device.newest_events.te.val,
      );

    if (isNotMini(device)) {
      this.getOrAddService(this.Service.HumiditySensor)
        .setCharacteristic(
          this.Characteristic.Name,
          `${this.device.name} 湿度計`,
        )
        .setCharacteristic(
          this.Characteristic.ConfiguredName,
          `${this.device.name} 湿度計`,
        )
        .updateCharacteristic(
          this.Characteristic.CurrentRelativeHumidity,
          device.newest_events.hu!.val,
        );
      const lightLevel =
        device.newest_events.il!.val === 0
          ? 0.0001
          : device.newest_events.il!.val;

      this.getOrAddService(this.Service.LightSensor)
        .setCharacteristic(
          this.Characteristic.Name,
          `${this.device.name} 照度計`,
        )
        .setCharacteristic(
          this.Characteristic.ConfiguredName,
          `${this.device.name} 照度計`,
        )
        .updateCharacteristic(
          this.Characteristic.CurrentAmbientLightLevel,
          lightLevel,
        );
    }
  }
}
