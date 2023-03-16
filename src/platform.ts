import {
  API,
  APIEvent,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  UnknownContext,
} from 'homebridge';
import { Subject, interval, map } from 'rxjs';
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

  public readonly appliancesSubject: Subject<Appliance[]> = new Subject();
  public readonly devicesSubject: Subject<Device[]> = new Subject();

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
    this.log.debug(`Finished initializing platform: ${this.config.name}`);

    // this.appliancesObservable = map(async () => {
    //   return await this.natureRemoApi.getAppliances();
    // })(interval((this.config.appliancesRefreshRate ?? 60) * 1000));
    interval((this.config.appliancesRefreshRate ?? 60) * 1000)
      .pipe(map(() => this.natureRemoApi.getAppliances()))
      .subscribe(async (newValue) => {
        const appliances = await newValue;
        if (appliances) {
          this.appliancesSubject.next(appliances);
        }
      });
    interval((this.config.devicesRefreshRate ?? 60) * 1000)
      .pipe(map(() => this.natureRemoApi.getDevices()))
      .subscribe(async (newValue) => {
        const devices = await newValue;
        if (devices) {
          this.devicesSubject.next(devices);
        }
      });

    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      this.log.info(`${PLATFORM_NAME} 'didFinishLaunching'`);
      this.discoverDevices();
    });
  }

  async discoverDevices() {
    const devices = await this.natureRemoApi.getDevices();
    if (devices) {
      devices.map((e) => {
        this.createSensor(e);
      });
    } else {
      this.log.debug('devices not find');
    }
  }

  createSensor(device: Device) {
    const uuid = this.api.hap.uuid.generate(device.id);
    const existingAccessory = this.accessories.find((a) => a.UUID === uuid);
    if (existingAccessory) {
      new Sensor(this, existingAccessory, device);
    } else {
      const accessory = new this.api.platformAccessory(device.name, uuid);
      new Sensor(this, accessory, device);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);
      this.accessories.push(accessory);
    }
  }

  configureAccessory(accessory: PlatformAccessory<UnknownContext>): void {
    this.log.info('Configuring accessory %s', accessory.displayName);
    this.accessories.push(accessory);
  }
}
