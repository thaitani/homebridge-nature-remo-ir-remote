import {
  API,
  Logger,
  Service,
  Characteristic,
  DynamicPlatformPlugin,
  PlatformAccessory,
  UnknownContext,
  PlatformConfig,
  APIEvent,
} from 'homebridge';

import { BASE_URI, PLATFORM_NAME, PLUGIN_NAME } from './settings';

import axios from 'axios';

export default class NatureRemoIRHomebridgePlatform
  implements DynamicPlatformPlugin
{
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  tvAccessory: PlatformAccessory;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Characteristic = api.hap.Characteristic;
    this.log.info(`${this.config.name}`);

    const tvName = this.config.name ?? 'default TV';

    const uuid = this.api.hap.uuid.generate(`${PLUGIN_NAME}${tvName}`);

    this.tvAccessory = new api.platformAccessory(tvName, uuid);
    this.tvAccessory.category = this.api.hap.Categories.TELEVISION;

    // add the tv service
    const tvService = this.tvAccessory.addService(this.Service.Television);

    // set the tv name
    tvService.setCharacteristic(this.Characteristic.ConfiguredName, tvName);

    // set sleep discovery characteristic
    tvService.setCharacteristic(
      this.Characteristic.SleepDiscoveryMode,
      this.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE,
    );

    // handle on / off events using the Active characteristic
    tvService
      .getCharacteristic(this.Characteristic.Active)
      .onSet((newValue) => {
        this.log.info('set Active => setNewValue: ' + newValue);
        tvService.updateCharacteristic(this.Characteristic.Active, 1);
      });

    tvService.setCharacteristic(this.Characteristic.ActiveIdentifier, 1);

    // handle input source changes
    tvService
      .getCharacteristic(this.Characteristic.ActiveIdentifier)
      .onSet((newValue) => {
        // the value will be the value you set for the Identifier Characteristic
        // on the Input Source service that was selected - see input sources below.

        this.log.info('set Active Identifier => setNewValue: ' + newValue);
      });
    this.api.publishExternalAccessories(PLUGIN_NAME, [this.tvAccessory]);
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      this.log.info(`${PLATFORM_NAME} 'didFinishLaunching'`);
    });
  }

  configureAccessory(accessory: PlatformAccessory<UnknownContext>): void {
    this.log.info('Configureing accessotry %s', accessory.displayName);
  }

  async sendSignal(signal: string) {
    try {
      const res = await axios.post(
        `${BASE_URI}signals/${signal}/send`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.config.token}`,
          },
        },
      );
      this.log.debug(String(res.status));
    } catch (e) {
      this.log.error(String(e));
    }
  }
}
