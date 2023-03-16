import {
  API,
  APIEvent,
  Categories,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  LogLevel,
  PlatformAccessory,
  PlatformConfig,
  Service,
  UnknownContext,
} from 'homebridge';
import { BehaviorSubject, map, timer } from 'rxjs';
import { NatureRemoApi } from './api';

import { Sensor } from './appliances/sensor';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { Appliance } from './types/appliance';
import { NatureRemoPlatformConfig } from './types/config';
import { Device } from './types/device';

export default class NatureRemoIRHomebridgePlatform
  implements DynamicPlatformPlugin
{
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  public readonly appliancesSubject = new BehaviorSubject<Appliance[]>([]);
  public readonly devicesSubject = new BehaviorSubject<Device[]>([]);

  public readonly natureRemoApi = new NatureRemoApi(
    this.config.token,
    this.log,
  );

  public readonly safeConfig = this.config as NatureRemoPlatformConfig;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.logger(`Finished initializing platform: ${this.config.name}`);

    timer(0, (this.config.appliancesRefreshRate ?? 300) * 1000)
      .pipe(map(() => this.natureRemoApi.getAppliances()))
      .subscribe(async (newValue) => {
        const appliances = await newValue;
        if (appliances) {
          this.appliancesSubject.next(appliances);
        }
      });
    timer(0, (this.config.devicesRefreshRate ?? 300) * 1000)
      .pipe(map(() => this.natureRemoApi.getDevices()))
      .subscribe(async (newValue) => {
        const devices = await newValue;
        if (devices) {
          this.devicesSubject.next(devices);
        }
      });

    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      this.logger(`${PLATFORM_NAME} 'didFinishLaunching'`);

      this.discoverDevices();

      this.checkPlatformAccessories();
    });
  }

  checkPlatformAccessories() {
    this.devicesSubject.subscribe((devices) => {
      const uuids = devices.map((device) =>
        this.api.hap.uuid.generate(device.id),
      );
      const notExistsSensors = this.accessories.filter(
        (accessory) =>
          accessory.category === Categories.SENSOR &&
          !uuids.includes(accessory.UUID),
      );
      if (notExistsSensors.length > 0) {
        this.api.unregisterPlatformAccessories(
          PLUGIN_NAME,
          PLATFORM_NAME,
          notExistsSensors,
        );
      }
    });
  }

  discoverDevices() {
    this.devicesSubject.subscribe((devices) => {
      if (devices) {
        devices.map((e) => {
          this.createSensor(e);
        });
      } else {
        this.logger('getDevices is not return');
      }
    });
  }

  createSensor(device: Device) {
    const uuid = this.api.hap.uuid.generate(device.id);
    const existingAccessory = this.accessories.find((a) => a.UUID === uuid);
    if (existingAccessory) {
      new Sensor(this, existingAccessory, device);
    } else {
      const accessory = new this.api.platformAccessory(
        device.name,
        uuid,
        Categories.SENSOR,
      );
      new Sensor(this, accessory, device);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);
      this.accessories.push(accessory);
    }
  }

  configureAccessory(accessory: PlatformAccessory<UnknownContext>): void {
    this.logger(`Configuring accessory ${accessory.displayName}`);
    this.accessories.push(accessory);
  }

  logger(message: string, logLevel = LogLevel.DEBUG) {
    this.log.log(logLevel, `{platform} ${message}`);
  }
}
