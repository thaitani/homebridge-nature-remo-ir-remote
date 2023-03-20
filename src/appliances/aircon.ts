import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import NatureRemoRemotePlatform from '../platform';
import { ApplianceAircon, Settings } from '../types/appliance';
import { AirconSettingParams } from './../api';
import { NatureRemoAccessory } from './base';

type AirconSettings = {
  targetMode: CharacteristicValue;
  targetTemperature: CharacteristicValue;
  targetVolume: CharacteristicValue;
  tempUnit: CharacteristicValue;
};

export class Aircon extends NatureRemoAccessory {
  private settings: AirconSettings;

  // settings.vol と TargetRelativeHumidity を対応付け
  // 0 => auto, 25 => 1, 50 => 2, 75 => 3, 100 => 4
  volumeMapping = {
    auto: 0,
    '1': 25,
    '2': 50,
    '3': 75,
    '4': 100,
  } as const;

  constructor(
    protected readonly platform: NatureRemoRemotePlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly aircon: ApplianceAircon,
  ) {
    super(platform, accessory);
    this.settings = this.fromSettings(aircon.settings);

    // 基本設定
    this.setAccessoryInformation({
      manufacturer: aircon.model.manufacturer,
      model: aircon.model.name,
      serialNumber: aircon.model.series,
      firmwareRevision: aircon.device.firmware_version,
    });

    const airconService = this.getOrAddService(this.Service.Thermostat)
      .setCharacteristic(this.Characteristic.Name, aircon.nickname)
      .setCharacteristic(this.Characteristic.ConfiguredName, aircon.nickname);

    // 運転状況取得
    airconService
      .getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
      .onGet(() => {
        if (aircon.settings.button === 'power-off') {
          return this.Characteristic.CurrentHeatingCoolingState.OFF;
        }
        switch (aircon.settings.mode) {
          case 'cool':
            return this.Characteristic.CurrentHeatingCoolingState.COOL;
          case 'warm':
            return this.Characteristic.CurrentHeatingCoolingState.HEAT;
          case 'dry':
            return this.Characteristic.CurrentHeatingCoolingState.COOL;
        }
      });

    // 運転状況変更時
    airconService
      .getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
      .onSet(async (value) => {
        this.settings.targetMode = value;
        let mode = '';
        let button: 'power-off' | '' = '';
        switch (value) {
          case this.Characteristic.TargetHeatingCoolingState.AUTO:
            mode = 'dry';
            break;
          case this.Characteristic.TargetHeatingCoolingState.HEAT:
            mode = 'warm';
            break;
          case this.Characteristic.TargetHeatingCoolingState.COOL:
            mode = 'cool';
            break;
          case this.Characteristic.TargetHeatingCoolingState.OFF:
            mode = this.aircon.settings.mode;
            button = 'power-off';
            break;
        }
        this.sendAirconSetting({
          operation_mode: mode,
          button,
        });
      })
      .onGet(() => this.settings.targetMode);

    // 設定温度
    airconService
      .getCharacteristic(this.Characteristic.TargetTemperature)
      .setProps({
        maxValue: this.maxTemperature(),
        minValue: this.minTemperature(),
        minStep: 1,
      })
      .onSet((value) => {
        this.settings.targetTemperature = value;
        this.natureRemoApi.airconSettings(aircon.id, {
          button: '',
          temperature: value.toString(),
          dir: aircon.settings.dir,
          dirh: aircon.settings.dirh,
          operation_mode: aircon.settings.mode,
          volume: aircon.settings.vol,
        });
        this.log(`TargetTemperature ${value}`);
      })
      .onGet(() => this.settings.targetTemperature);

    // 設定湿度
    airconService
      .getCharacteristic(this.Characteristic.TargetRelativeHumidity)
      .setProps({
        minStep: 25,
      })
      .onSet((value) => {
        const num = Number(value);
        const volume =
          Object.entries(this.volumeMapping).find((v) => v[1] === num)?.[0] ??
          'auto';
        this.natureRemoApi.airconSettings(aircon.id, {
          button: '',
          temperature: aircon.settings.temp,
          dir: aircon.settings.dir,
          dirh: aircon.settings.dirh,
          operation_mode: aircon.settings.mode,
          volume: volume,
        });
        this.log(`TargetRelativeHumidity ${value}`);
      });

    // 温度単位
    airconService
      .getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
      .updateValue(this.settings.tempUnit);

    // 現在の気温
    this.platform.devicesSubject.subscribe((devices) => {
      const device = devices.find((e) => e.id === aircon.device.id);
      const te = device?.newest_events.te.val;
      if (te) {
        airconService
          .getCharacteristic(this.Characteristic.CurrentTemperature)
          .updateValue(te);
      }
      const hu = device?.newest_events.hu?.val;
      if (hu) {
        airconService
          .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
          .updateValue(hu);
      }
    });
  }

  minTemperature(): number {
    const modes = Object.values(this.aircon.aircon.range.modes);
    return modes.reduce((prev, curr) => {
      const minInKey = Math.min(...curr.temp.map((e) => Number(e)));
      if (minInKey === 0) {
        return prev;
      }
      if (prev === 0) {
        return minInKey;
      }
      return Math.min(prev, minInKey);
    }, 0);
  }

  maxTemperature(): number {
    const modes = Object.values(this.aircon.aircon.range.modes);
    return modes.reduce((prev, curr) => {
      const minInKey = Math.max(...curr.temp.map((e) => Number(e)));
      return Math.max(prev, minInKey);
    }, 0);
  }

  fromSettings(settings: Settings): AirconSettings {
    let targetMode: CharacteristicValue;
    const targetTemperature =
      settings.temp === '0' ? this.minTemperature() : settings.temp;

    const targetVolume = this.volumeMapping[settings.vol] ?? 0;
    const tempUnit =
      settings.temp_unit === 'c'
        ? this.Characteristic.TemperatureDisplayUnits.CELSIUS
        : this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
    if (settings.button === 'power-off') {
      targetMode = this.Characteristic.TargetHeatingCoolingState.OFF;
      return {
        targetMode,
        targetTemperature,
        tempUnit,
        targetVolume,
      };
    }

    switch (settings.mode) {
      case 'warm':
        targetMode = this.Characteristic.TargetHeatingCoolingState.HEAT;
        break;
      case 'cool':
        targetMode = this.Characteristic.TargetHeatingCoolingState.COOL;
        break;
      case 'dry':
        targetMode = this.Characteristic.TargetHeatingCoolingState.AUTO;
        break;
    }
    return {
      targetMode,
      targetTemperature,
      tempUnit,
      targetVolume,
    };
  }

  async sendAirconSetting(params: AirconSettingParams): Promise<void> {
    const res = await this.natureRemoApi.airconSettings(this.aircon.id, params);
    if (res) {
      this.settings = this.fromSettings(res);
    }
  }
}
