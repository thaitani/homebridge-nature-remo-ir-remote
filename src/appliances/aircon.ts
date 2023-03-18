import { CharacteristicValue, LogLevel, PlatformAccessory } from 'homebridge';
import NatureRemoIRHomebridgePlatform from '../platform';
import { ApplianceAircon, Settings } from '../types/appliance';
import { AirconSettingParams } from './../api';
import { getCategoryName } from './../utils';

type AirconSettings = {
  targetMode: CharacteristicValue;
  targetTemperature: CharacteristicValue;
  targetVolume: CharacteristicValue;
  tempUnit: CharacteristicValue;
};

export class Aircon {
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
    private readonly platform: NatureRemoIRHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly aircon: ApplianceAircon,
  ) {
    this.settings = this.fromSettings(aircon.settings);

    // 基本設定
    accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        aircon.model.manufacturer,
      )
      .setCharacteristic(this.platform.Characteristic.Model, aircon.model.name)
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        aircon.model.series,
      )
      .setCharacteristic(
        this.platform.Characteristic.FirmwareRevision,
        aircon.device.firmware_version,
      );

    const airconService = (
      accessory.getService(this.platform.Service.Thermostat) ||
      accessory.addService(this.platform.Service.Thermostat)
    ).setCharacteristic(this.platform.Characteristic.Name, aircon.nickname);

    // 運転状況取得
    airconService
      .getCharacteristic(
        this.platform.Characteristic.CurrentHeatingCoolingState,
      )
      .onGet(() => {
        if (aircon.settings.button === 'power-off') {
          return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
        }
        return aircon.settings.mode === 'cool'
          ? this.platform.Characteristic.CurrentHeatingCoolingState.COOL
          : aircon.settings.mode === 'warm'
          ? this.platform.Characteristic.CurrentHeatingCoolingState.HEAT
          : aircon.settings.mode === 'dry'
          ? this.platform.Characteristic.CurrentHeatingCoolingState.COOL
          : this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
      });

    // 運転状況変更時
    airconService
      .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .onSet(async (value) => {
        this.settings.targetMode = value;
        let mode = '';
        let button: 'power-off' | '' = '';
        switch (value) {
          case this.platform.Characteristic.TargetHeatingCoolingState.AUTO:
            mode = 'dry';
            break;
          case this.platform.Characteristic.TargetHeatingCoolingState.HEAT:
            mode = 'warm';
            break;
          case this.platform.Characteristic.TargetHeatingCoolingState.COOL:
            mode = 'cool';
            break;
          case this.platform.Characteristic.TargetHeatingCoolingState.OFF:
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
      .getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .setProps({
        maxValue: this.maxTemperature(),
        minValue: this.minTemperature(),
        minStep: 1,
      })
      .onSet((value) => {
        this.settings.targetTemperature = value;
        this.platform.natureRemoApi.airconSettings(aircon.id, {
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
      .getCharacteristic(this.platform.Characteristic.TargetRelativeHumidity)
      .setProps({
        minStep: 25,
      })
      .onSet((value) => {
        const num = Number(value);
        this.platform.natureRemoApi.airconSettings(aircon.id, {
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
      .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .updateValue(this.settings.tempUnit);

    // 現在の気温
    this.platform.devicesSubject.subscribe((devices) => {
      const device = devices.find((e) => e.id === aircon.device.id);
      const te = device?.newest_events.te.val;
      if (te) {
        airconService
          .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
          .updateValue(te);
      }
      const hu = device?.newest_events.hu?.val;
      if (hu) {
        airconService
          .getCharacteristic(
            this.platform.Characteristic.CurrentRelativeHumidity,
          )
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
        ? this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS
        : this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
    if (settings.button === 'power-off') {
      targetMode = this.platform.Characteristic.TargetHeatingCoolingState.OFF;
      return {
        targetMode,
        targetTemperature,
        tempUnit,
        targetVolume,
      };
    }

    switch (settings.mode) {
      case 'warm':
        targetMode =
          this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
        break;
      case 'cool':
        targetMode =
          this.platform.Characteristic.TargetHeatingCoolingState.COOL;
        break;
      case 'dry':
        targetMode =
          this.platform.Characteristic.TargetHeatingCoolingState.AUTO;
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
    const res = await this.platform.natureRemoApi.airconSettings(
      this.aircon.id,
      params,
    );
    if (res) {
      this.settings = this.fromSettings(res);
    }
  }

  log(message: string, logLevel = LogLevel.DEBUG) {
    this.platform.log.log(
      logLevel,
      `{${getCategoryName(this.accessory.category)}:${
        this.aircon.nickname
      }} ${message}`,
    );
  }
}
