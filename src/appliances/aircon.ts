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

    const airconService = (
      accessory.getService(super.Service.Thermostat) ||
      accessory.addService(super.Service.Thermostat)
    )
      .setCharacteristic(super.Characteristic.Name, aircon.nickname)
      .setCharacteristic(super.Characteristic.ConfiguredName, aircon.nickname);

    // 運転状況取得
    airconService
      .getCharacteristic(super.Characteristic.CurrentHeatingCoolingState)
      .onGet(() => {
        if (aircon.settings.button === 'power-off') {
          return super.Characteristic.CurrentHeatingCoolingState.OFF;
        }
        return aircon.settings.mode === 'cool'
          ? super.Characteristic.CurrentHeatingCoolingState.COOL
          : aircon.settings.mode === 'warm'
          ? super.Characteristic.CurrentHeatingCoolingState.HEAT
          : aircon.settings.mode === 'dry'
          ? super.Characteristic.CurrentHeatingCoolingState.COOL
          : super.Characteristic.CurrentHeatingCoolingState.OFF;
      });

    // 運転状況変更時
    airconService
      .getCharacteristic(super.Characteristic.TargetHeatingCoolingState)
      .onSet(async (value) => {
        this.settings.targetMode = value;
        let mode = '';
        let button: 'power-off' | '' = '';
        switch (value) {
          case super.Characteristic.TargetHeatingCoolingState.AUTO:
            mode = 'dry';
            break;
          case super.Characteristic.TargetHeatingCoolingState.HEAT:
            mode = 'warm';
            break;
          case super.Characteristic.TargetHeatingCoolingState.COOL:
            mode = 'cool';
            break;
          case super.Characteristic.TargetHeatingCoolingState.OFF:
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
      .getCharacteristic(super.Characteristic.TargetTemperature)
      .setProps({
        maxValue: this.maxTemperature(),
        minValue: this.minTemperature(),
        minStep: 1,
      })
      .onSet((value) => {
        this.settings.targetTemperature = value;
        super.natureRemoApi.airconSettings(aircon.id, {
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
      .getCharacteristic(super.Characteristic.TargetRelativeHumidity)
      .setProps({
        minStep: 25,
      })
      .onSet((value) => {
        const num = Number(value);
        super.natureRemoApi.airconSettings(aircon.id, {
          button: '',
          temperature: aircon.settings.temp,
          dir: aircon.settings.dir,
          dirh: aircon.settings.dirh,
          operation_mode: aircon.settings.mode,
          volume:
            num === 0
              ? 'auto'
              : num === 25
              ? '1'
              : num === 50
              ? '2'
              : value === 75
              ? '3'
              : value === 100
              ? '4'
              : 'auto',
        });
        this.log(`TargetRelativeHumidity ${value}`);
      });

    // 温度単位
    airconService
      .getCharacteristic(super.Characteristic.TemperatureDisplayUnits)
      .updateValue(this.settings.tempUnit);

    // 現在の気温
    this.platform.devicesSubject.subscribe((devices) => {
      const device = devices.find((e) => e.id === aircon.device.id);
      const te = device?.newest_events.te.val;
      if (te) {
        airconService
          .getCharacteristic(super.Characteristic.CurrentTemperature)
          .updateValue(te);
      }
      const hu = device?.newest_events.hu?.val;
      if (hu) {
        airconService
          .getCharacteristic(super.Characteristic.CurrentRelativeHumidity)
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
        ? super.Characteristic.TemperatureDisplayUnits.CELSIUS
        : super.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
    if (settings.button === 'power-off') {
      targetMode = super.Characteristic.TargetHeatingCoolingState.OFF;
      return {
        targetMode,
        targetTemperature,
        tempUnit,
        targetVolume,
      };
    }

    switch (settings.mode) {
      case 'warm':
        targetMode = super.Characteristic.TargetHeatingCoolingState.HEAT;
        break;
      case 'cool':
        targetMode = super.Characteristic.TargetHeatingCoolingState.COOL;
        break;
      case 'dry':
        targetMode = super.Characteristic.TargetHeatingCoolingState.AUTO;
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
    const res = await super.natureRemoApi.airconSettings(
      this.aircon.id,
      params,
    );
    if (res) {
      this.settings = this.fromSettings(res);
    }
  }
}
