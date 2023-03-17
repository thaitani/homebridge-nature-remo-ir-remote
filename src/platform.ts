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
import { INatureRemoApi, NatureRemoApi } from './api';
import { Aircon } from './appliances/aircon';
import { IRTV } from './appliances/irtv';

import { Sensor } from './appliances/sensor';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { ApplianceAircon, ApplianceIR } from './types/appliance';
import { NatureRemoPlatformConfig } from './types/config';
import { Device } from './types/device';
import {
  getCategoryName,
  isAirconAppliances,
  isIRAppliances,
  isIRTVAppliancesConfig,
} from './utils';

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

  public readonly natureRemoApi: INatureRemoApi = new NatureRemoApi(
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

  unregisterPlatformAccessotries(
    targets: Array<{ id: string }>,
    category: Categories,
  ) {
    if (this.accessories.length === 0 || targets.length === 0) {
      return;
    }
    const uuids = targets.map((target) =>
      this.api.hap.uuid.generate(target.id),
    );
    const notExistsSensors = this.accessories.filter(
      (accessory) =>
        accessory.category === category && !uuids.includes(accessory.UUID),
    );
    if (notExistsSensors.length > 0) {
      this.logger(
        `unregister ${getCategoryName(
          category,
        )} accessories ${notExistsSensors.reduce(
          (prev, curr) => `${prev}, ${curr.displayName}`,
          '',
        )}`,
      );
      this.api.unregisterPlatformAccessories(
        PLUGIN_NAME,
        PLATFORM_NAME,
        notExistsSensors,
      );
    }
  }

  // APIの結果にないAccessoryを削除する
  checkPlatformAccessories() {
    this.devicesSubject.subscribe((devices) => {
      this.unregisterPlatformAccessotries(devices, Categories.SENSOR);
    });
    this.airconAppliancesSubject.subscribe((appliances) => {
      this.unregisterPlatformAccessotries(
        appliances,
        Categories.AIR_CONDITIONER,
      );
    });
  }

  discoverDevices() {
    this.devicesSubject.subscribe((devices) => {
      devices.forEach((device) =>
        this.registerPlatformAccessotries(
          device.id,
          device.name,
          (accessory) => new Sensor(this, accessory, device),
          Categories.SENSOR,
        ),
      );
    });
    this.airconAppliancesSubject.subscribe((appliances) => {
      appliances.forEach((aircon) =>
        this.registerPlatformAccessotries(
          aircon.id,
          aircon.nickname,
          (accessory) => new Aircon(this, accessory, aircon),
          Categories.AIR_CONDITIONER,
        ),
      );
    });
    const irtvConfig = this.safeConfig.appliances?.filter(
      (e) => e.type === 'irtv',
    );
    if (isIRTVAppliancesConfig(irtvConfig)) {
      irtvConfig.forEach((config) => {
        this.irAppliancesSubject.subscribe((appliances) => {
          appliances.forEach((ir) => {
            if (ir.nickname === config.name) {
              this.registerPlatformAccessotries(
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
  }

  registerPlatformAccessotries(
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

  configureAccessory(accessory: PlatformAccessory<UnknownContext>): void {
    this.logger(
      `Configuring accessory: ${getCategoryName(accessory.category)}, ${
        accessory.displayName
      }`,
    );
    this.accessories.push(accessory);
  }

  logger(message: string, logLevel = LogLevel.DEBUG) {
    this.log.log(logLevel, `{platform} ${message}`);
  }
}
