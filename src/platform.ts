import {
  API,
  APIEvent,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  Service,
  UnknownContext,
} from 'homebridge';
import { Observable, map, timer } from 'rxjs';
import { NatureRemoApi } from './api';

import { PLATFORM_NAME } from './settings';
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

  public readonly appliancesObservable: Observable<Promise<Appliance[]>>;
  public readonly devicesObservable: Observable<Promise<Device[]>>;

  public readonly natureRemoApi = new NatureRemoApi(
    this.config.token,
    this.log,
  );

  constructor(
    public readonly log: Logger,
    public readonly config: NatureRemoPlatformConfig,
    public readonly api: API,
  ) {
    this.Characteristic = api.hap.Characteristic;
    this.log.debug(`Finished initializing platform: ${this.config.name}`);

    const refreshRate = this.config.refreshRate ?? 60;

    this.appliancesObservable = map(async () => {
      return this.natureRemoApi.getAppliances();
    })(timer(0, refreshRate * 1000));
    this.devicesObservable = map(async () => {
      return this.natureRemoApi.getDevices();
    })(timer(0, refreshRate * 1000));

    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      this.log.info(`${PLATFORM_NAME} 'didFinishLaunching'`);
      this.discoverDevices();
    });
  }

  async discoverDevices() {
    this.log.info(this.config.token);
    const appliances = await this.natureRemoApi.getAppliances();
    appliances.map((appliance) => {
      switch (appliance.type) {
        case 'IR':
          if (this.config.irDevices) {
            this.log.info(appliance.signals[0].name);
          }
          break;
        case 'AC':
          this.log.info(appliance.aircon.range.fixedButtons[0]);
          break;
        case 'QRIO_LOCK':
          this.log.info(
            'Qrio Lock is available:',
            appliance.qrio_lock.is_available,
          );
          break;
      }
    });
  }

  configureAccessory(accessory: PlatformAccessory<UnknownContext>): void {
    this.log.info('Configureing accessotry %s', accessory.displayName);
    this.accessories.push(accessory);
  }
}
