import {
  API,
  APIEvent,
  Categories,
  DynamicPlatformPlugin,
  Logger,
  LogLevel,
  PlatformAccessory,
  PlatformConfig,
  UnknownContext,
} from 'homebridge';
import { BehaviorSubject, map, timer } from 'rxjs';
import { INatureRemoApi, NatureRemoApi } from './api';
import { ApiMock } from './api.mock';
import { Aircon } from './appliances/aircon';
import { IRTV } from './appliances/irtv';

import { Sensor } from './appliances/sensor';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { ApplianceAircon, ApplianceIR } from './types/appliance';
import { ApplianceIRTV, NatureRemoPlatformConfig } from './types/config';
import { Device } from './types/device';
import { getCategoryName } from './utils';

export default class NatureRemoRemotePlatform implements DynamicPlatformPlugin {
  public readonly Service = this.api.hap.Service;
  public readonly Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  public readonly airconAppliancesSubject = new BehaviorSubject<
    ApplianceAircon[]
  >([]);

  public readonly irAppliancesSubject = new BehaviorSubject<ApplianceIR[]>([]);
  public readonly devicesSubject = new BehaviorSubject<Device[]>([]);

  public readonly natureRemoApi: INatureRemoApi =
    process.env.DEBUG === 'test'
      ? new ApiMock(this.logger)
      : new NatureRemoApi(this.config.token, this.logger);

  public readonly safeConfig = this.config as NatureRemoPlatformConfig;

  constructor(
    public readonly logger: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log(`Finished initializing platform: ${this.config.name}`);

    timer(0, (this.config.appliancesRefreshRate ?? 300) * 1000)
      .pipe(map(() => this.natureRemoApi.getAppliances()))
      .subscribe(async (newValue) => {
        const appliances = await newValue;
        if (appliances) {
          const ac = appliances.filter(
            (e): e is ApplianceAircon => e.type === 'AC',
          );
          this.airconAppliancesSubject.next(ac);

          const ir = appliances.filter(
            (e): e is ApplianceIR => e.type === 'IR',
          );
          this.irAppliancesSubject.next(ir);
        }
      });

    timer(0, (this.safeConfig.devicesRefreshRate ?? 300) * 1000)
      .pipe(map(() => this.natureRemoApi.getDevices()))
      .subscribe(async (newValue) => {
        const devices = await newValue;
        if (devices) {
          this.devicesSubject.next(devices);
        }
      });

    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      this.log(`${PLATFORM_NAME} 'didFinishLaunching'`);

      this.discoverDevices();
      this.unregisterPlatformAccessories();
    });
  }

  discoverDevices() {
    this.devicesSubject.subscribe((devices) => {
      devices.forEach((device) =>
        this.registerPlatformAccessories(
          device.id,
          device.name,
          (accessory) => new Sensor(this, accessory, device),
          Categories.SENSOR,
        ),
      );
    });
    this.airconAppliancesSubject.subscribe((appliances) => {
      appliances.forEach((aircon) =>
        this.registerPlatformAccessories(
          aircon.id,
          aircon.nickname,
          (accessory) => new Aircon(this, accessory, aircon),
          Categories.AIR_CONDITIONER,
        ),
      );
    });
    const irtvConfig = this.safeConfig.appliances?.filter(
      (e): e is ApplianceIRTV => e.type === 'irtv',
    );
    irtvConfig?.forEach((config) => {
      this.irAppliancesSubject.subscribe((appliances) => {
        appliances.forEach((ir) => {
          if (ir.nickname === config.name) {
            this.registerPlatformAccessories(
              ir.id,
              ir.nickname,
              (accessory) => new IRTV(this, accessory, ir, config),
              Categories.TELEVISION,
            );
          }
        });
      });
    });
  }

  registerPlatformAccessories(
    id: string,
    displayName: string,
    setupAccessory: (accessory: PlatformAccessory) => void,
    category?: Categories,
  ) {
    const uuid = this.api.hap.uuid.generate(id);
    const existingAccessory = this.accessories.find((e) => e.UUID === uuid);
    if (existingAccessory) {
      setupAccessory(existingAccessory);
    } else {
      const accessory = new this.api.platformAccessory(
        displayName,
        uuid,
        category,
      );
      setupAccessory(accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);
      this.accessories.push(accessory);
    }
  }

  // APIの結果にないAccessoryを削除する
  unregisterPlatformAccessories() {
    this.devicesSubject.subscribe((devices) => {
      this.unregisterPlatformAccessory(devices, Categories.SENSOR);
    });
    this.airconAppliancesSubject.subscribe((appliances) => {
      this.unregisterPlatformAccessory(appliances, Categories.AIR_CONDITIONER);
    });
    this.irAppliancesSubject.subscribe((irs) => {
      this.unregisterPlatformAccessory(irs, Categories.TELEVISION);
    });
  }

  unregisterPlatformAccessory(
    targets: Array<{ id: string }>,
    category: Categories,
  ) {
    if (this.accessories.length === 0 || targets.length === 0) {
      return;
    }
    const uuids = targets.map((target) =>
      this.api.hap.uuid.generate(target.id),
    );
    const notExistsAccessories = this.accessories.filter(
      (accessory) =>
        accessory.category === category && !uuids.includes(accessory.UUID),
    );
    if (notExistsAccessories.length > 0) {
      this.log(
        `unregister ${getCategoryName(
          category,
        )} accessories ${notExistsAccessories.reduce(
          (prev, curr) => `${prev}, ${curr.displayName}`,
          '',
        )}`,
      );
      this.api.unregisterPlatformAccessories(
        PLUGIN_NAME,
        PLATFORM_NAME,
        notExistsAccessories,
      );
    }
  }

  configureAccessory(accessory: PlatformAccessory<UnknownContext>): void {
    this.log(
      `Configuring accessory: ${getCategoryName(accessory.category)}, ${
        accessory.displayName
      }`,
    );
    this.accessories.push(accessory);
  }

  log(message: string, logLevel = LogLevel.DEBUG) {
    this.logger.log(logLevel, `{platform} ${message}`);
  }
}
