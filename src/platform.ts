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
import { Aircon } from './appliances/aircon';

import { Sensor } from './appliances/sensor';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { ApplianceAircon, ApplianceIR } from './types/appliance';
import { NatureRemoPlatformConfig } from './types/config';
import { Device } from './types/device';
import { isAirconAppliances, isIRAppliances } from './utils';

export default class NatureRemoIRHomebridgePlatform
  implements DynamicPlatformPlugin
{
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  public readonly airconAppliancesSubject = new BehaviorSubject<
    ApplianceAircon[]
  >([]);

  public readonly irAppliancesSubject = new BehaviorSubject<ApplianceIR[]>([]);
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
          const ac = appliances.filter((e) => e.type === 'AC');
          if (isAirconAppliances(ac)) {
            this.airconAppliancesSubject.next(ac);
          }
          const ir = appliances.filter((e) => e.type === 'IR');
          if (isIRAppliances(ir)) {
            this.irAppliancesSubject.next(ir);
          }
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

  // APIの結果にないAccessoryを削除する
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
    this.airconAppliancesSubject.subscribe((appliances) => {
      const uuids = appliances.map((appliance) =>
        this.api.hap.uuid.generate(appliance.id),
      );
      const notExistsAircon = this.accessories.filter(
        (accessory) =>
          accessory.category === Categories.AIR_CONDITIONER &&
          !uuids.includes(accessory.UUID),
      );
      if (notExistsAircon.length > 0) {
        this.api.unregisterPlatformAccessories(
          PLUGIN_NAME,
          PLATFORM_NAME,
          notExistsAircon,
        );
      }
    });
  }

  discoverDevices() {
    this.devicesSubject.subscribe((devices) => {
      devices.forEach((e) => this.createSensor(e));
    });
    this.airconAppliancesSubject.subscribe((appliances) => {
      appliances.forEach((e) => this.createAircon(e));
    });
  }

  createSensor(device: Device) {
    const uuid = this.api.hap.uuid.generate(device.id);
    const existingAccessory = this.accessories.find((e) => e.UUID === uuid);
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

  createAircon(aircon: ApplianceAircon) {
    const uuid = this.api.hap.uuid.generate(aircon.id);
    const existingAccessory = this.accessories.find((e) => e.UUID === uuid);
    if (existingAccessory) {
      new Aircon(this, existingAccessory, aircon);
    } else {
      const accessory = new this.api.platformAccessory(
        aircon.nickname,
        uuid,
        Categories.AIR_CONDITIONER,
      );
      new Aircon(this, accessory, aircon);
      this.api.registerPlatformAccessories(PLATFORM_NAME, PLATFORM_NAME, [
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
