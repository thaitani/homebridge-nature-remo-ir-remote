import { LogLevel, PlatformAccessory } from 'homebridge';
import NatureRemoIRHomebridgePlatform from '../platform';
import { ApplianceIR } from '../types/appliance';
import { ApplianceIRTV } from '../types/config';
import { getCategoryName } from './../utils';

export class IRTV {
  constructor(
    private readonly platform: NatureRemoIRHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly ir: ApplianceIR,
    private readonly irTVConfig: ApplianceIRTV,
  ) {
    accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Nature')
      .setCharacteristic(this.platform.Characteristic.Model, ir.device.name)
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        ir.device.serial_number,
      )
      .setCharacteristic(
        this.platform.Characteristic.FirmwareRevision,
        ir.device.firmware_version,
      );

    const tvService = (
      accessory.getService(this.platform.Service.Television) ||
      accessory.addService(this.platform.Service.Television)
    ).setCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      ir.nickname,
    );

    tvService
      .getCharacteristic(this.platform.Characteristic.Active)
      .onSet(() => {
        const targetName = this.irTVConfig.mapping.active;
        const signal = ir.signals.find((e) => e.name === targetName)?.id;
        if (signal) {
          this.platform.natureRemoApi.sendSignal(signal);
        }
      });

    tvService.setCharacteristic(
      this.platform.Characteristic.ActiveIdentifier,
      1,
    );
  }

  log(message: string, logLevel = LogLevel.DEBUG) {
    this.platform.log.log(
      logLevel,
      `{${getCategoryName(this.accessory.category)}:${
        this.ir.nickname
      }} ${message}`,
    );
  }
}
