import { CharacteristicValue, LogLevel, PlatformAccessory } from 'homebridge';
import NatureRemoIRHomebridgePlatform from '../platform';
import { ApplianceAircon, Settings } from '../types/appliance';
import { getCategoryName } from './../utils';

type AirconSettings = {
  currentMode: CharacteristicValue;
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
      .onSet((value) => {
        this.settings.currentMode = value;
        this.log(`CurrentHeaterCoolerState ${value}`);
      });

    // 運転状況変更時
    airconService
      .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .onSet((value) => {
        this.settings.targetMode = value;
        this.log(`TargetHeaterCoolerState ${this.settings.targetMode}`);
      })
      .onGet(() => this.settings.targetMode);

    // 設定温度
    airconService
      .getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .setProps({
        maxValue: this.maxTemprature(),
        minValue: this.minTemprature(),
      })
      .onSet((value) => {
        this.settings.targetTemperature = value;
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

  minTemprature(): number {
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

  maxTemprature(): number {
    const modes = Object.values(this.aircon.aircon.range.modes);
    return modes.reduce((prev, curr) => {
      const minInKey = Math.max(...curr.temp.map((e) => Number(e)));
      return Math.max(prev, minInKey);
    }, 0);
  }

  fromSettings(settings: Settings): AirconSettings {
    let targetMode: CharacteristicValue;
    let currentMode: CharacteristicValue;
    const targetTemperature =
      settings.temp === '0' ? this.minTemprature() : settings.temp;

    const targetVolume = this.volumeMapping[settings.vol] ?? 0;
    const tempUnit =
      settings.temp_unit === 'c'
        ? this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS
        : this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
    if (settings.button === 'power-off') {
      currentMode = this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
      targetMode = this.platform.Characteristic.TargetHeatingCoolingState.OFF;
      return {
        currentMode,
        targetMode,
        targetTemperature,
        tempUnit,
        targetVolume,
      };
    }

    switch (settings.mode) {
      case 'warm':
        currentMode =
          this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
        targetMode =
          this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
        break;
      case 'cool':
        currentMode =
          this.platform.Characteristic.CurrentHeatingCoolingState.COOL;
        targetMode =
          this.platform.Characteristic.TargetHeatingCoolingState.COOL;
        break;
      case 'dry':
        currentMode =
          this.platform.Characteristic.CurrentHeatingCoolingState.COOL;
        targetMode =
          this.platform.Characteristic.TargetHeatingCoolingState.AUTO;
        break;
    }
    return {
      targetMode,
      currentMode,
      targetTemperature,
      tempUnit,
      targetVolume,
    };
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
