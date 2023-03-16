import { Logger, LogLevel, PlatformAccessory, Service } from 'homebridge';
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
    this.log('setup sensor');

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

    if (this.isNotMini(device)) {
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
          device.newest_events.hu!.val,
        );
    }

    if (this.isNotMini(device)) {
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
          device.newest_events.il!.val,
        );
    }

    this.subscribe();
  }

  subscribe() {
    this.platform.devicesSubject.subscribe((devices) => {
      const device = devices.find((e) => e.id === this.device.id);
      if (!device) {
        this.log(
          `device not find: ${this.device.id} ${this.device.name}`,
          LogLevel.WARN,
        );
        return;
      }
      this.log(
        `subscribe device: te=${device.newest_events.te.val} hu=${device.newest_events.hu?.val} il=${device.newest_events.il?.val}`,
      );
      this.temperatureService.updateCharacteristic(
        this.platform.Characteristic.CurrentTemperature,
        device.newest_events.te.val,
      );

      if (this.isNotMini(device)) {
        this.lightSensorService
          ?.getCharacteristic(
            this.platform.Characteristic.CurrentAmbientLightLevel,
          )
          .updateValue(device.newest_events.il!.val);
        this.humidifierService?.updateCharacteristic(
          this.platform.Characteristic.CurrentRelativeHumidity,
          device.newest_events.hu!.val,
        );
      }
    });
  }

  isNotMini(device: Device) {
    if (device.newest_events.hu && device.newest_events.il) {
      return true;
    }
    return false;
  }

  log(message: string, logLevel = LogLevel.DEBUG) {
    this.logger.log(logLevel, `{sensor:${this.device.name}} ${message}`);
  }
}
