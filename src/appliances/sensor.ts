import { Logger, PlatformAccessory, Service } from 'homebridge';
import NatureRemoIRHomebridgePlatform from '../platform';
import { Device } from '../types/device';

export class Sensor {
  private temperatureService: Service;
  private humidifierService?: Service;
  private lightSensorService?: Service;

  private logger: Logger = this.platform.log;

  constructor(
    private readonly platform: NatureRemoIRHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device: Device,
  ) {
    this.logger.debug('set up Sensor', device.name);

    accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Nature')
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        device.serial_number,
      )
      .setCharacteristic(
        this.platform.Characteristic.FirmwareRevision,
        device.firmware_version,
      );

    (this.temperatureService =
      accessory.getService(this.platform.Service.TemperatureSensor) ||
      accessory.addService(this.platform.Service.TemperatureSensor))
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

    if (device?.newest_events.hu) {
      (this.humidifierService =
        accessory.getService(this.platform.Service.HumiditySensor) ||
        accessory.addService(this.platform.Service.HumiditySensor))
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
          device.newest_events.hu.val,
        );
    }

    if (device?.newest_events.il) {
      (this.lightSensorService =
        accessory.getService(this.platform.Service.LightSensor) ||
        accessory.addService(this.platform.Service.LightSensor))
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
          device.newest_events.il.val,
        );
    }

    this.subscribe();
  }

  subscribe() {
    this.platform.devicesSubject.subscribe((devices) => {
      const device = devices.find((e) => e.id === this.device.id);
      this.logger.info(device?.name ?? '');
      if (device?.newest_events.hu) {
        this.humidifierService?.updateCharacteristic(
          this.platform.Characteristic.CurrentRelativeHumidity,
          device.newest_events.hu.val,
        );
      }
      if (device?.newest_events.te) {
        this.temperatureService.updateCharacteristic(
          this.platform.Characteristic.CurrentTemperature,
          device.newest_events.te.val,
        );
      }
      if (device?.newest_events.il) {
        this.lightSensorService
          ?.getCharacteristic(
            this.platform.Characteristic.CurrentAmbientLightLevel,
          )
          .updateValue(device.newest_events.il.val);
      }
    });
  }
}
