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
    )
      .setCharacteristic(this.platform.Characteristic.Name, ir.nickname)
      .setCharacteristic(
        this.platform.Characteristic.ConfiguredName,
        ir.nickname,
      );
    tvService.setCharacteristic(
      this.platform.Characteristic.ActiveIdentifier,
      1,
    );

    tvService
      .getCharacteristic(this.platform.Characteristic.Active)
      .onSet(() => {
        this.sendSignal('active');
      });

    tvService
      .getCharacteristic(this.platform.Characteristic.RemoteKey)
      .onSet((newValue) => {
        switch (newValue) {
          case this.platform.Characteristic.RemoteKey.REWIND: {
            this.sendSignal('rewind');
            break;
          }
          case this.platform.Characteristic.RemoteKey.FAST_FORWARD: {
            this.sendSignal('fastForward');
            break;
          }
          case this.platform.Characteristic.RemoteKey.NEXT_TRACK: {
            this.sendSignal('nextTrack');
            break;
          }
          case this.platform.Characteristic.RemoteKey.PREVIOUS_TRACK: {
            this.sendSignal('previousTrack');
            break;
          }
          case this.platform.Characteristic.RemoteKey.ARROW_UP: {
            this.sendSignal('arrowUp');
            break;
          }
          case this.platform.Characteristic.RemoteKey.ARROW_DOWN: {
            this.sendSignal('arrowDown');
            break;
          }
          case this.platform.Characteristic.RemoteKey.ARROW_LEFT: {
            this.sendSignal('arrowLeft');
            break;
          }
          case this.platform.Characteristic.RemoteKey.ARROW_RIGHT: {
            this.sendSignal('arrowRight');
            break;
          }
          case this.platform.Characteristic.RemoteKey.SELECT: {
            this.sendSignal('select');
            break;
          }
          case this.platform.Characteristic.RemoteKey.BACK: {
            this.sendSignal('back');
            break;
          }
          case this.platform.Characteristic.RemoteKey.EXIT: {
            this.sendSignal('exit');
            break;
          }
          case this.platform.Characteristic.RemoteKey.PLAY_PAUSE: {
            this.sendSignal('playPause');
            break;
          }
          case this.platform.Characteristic.RemoteKey.INFORMATION: {
            this.sendSignal('information');
            break;
          }
        }
      });

    const speakerService =
      accessory.getService(this.platform.Service.TelevisionSpeaker) ||
      accessory.addService(this.platform.Service.TelevisionSpeaker);

    speakerService
      .setCharacteristic(
        this.platform.Characteristic.Active,
        this.platform.Characteristic.Active.ACTIVE,
      )
      .setCharacteristic(
        this.platform.Characteristic.VolumeControlType,
        this.platform.Characteristic.VolumeControlType.ABSOLUTE,
      );

    // handle volume control
    speakerService
      .getCharacteristic(this.platform.Characteristic.VolumeSelector)
      .onSet((newValue) => {
        if (
          newValue === this.platform.Characteristic.VolumeSelector.INCREMENT
        ) {
          this.log('volumeUp');
          this.sendSignal('volumeUp');
        } else {
          this.sendSignal('volumeDown');
        }
      });
  }

  sendSignal(target: string) {
    const targetName = this.irTVConfig.mapping[target];
    const signal = this.ir.signals.find((e) => e.name === targetName)?.id;
    this.log('target' + signal ?? 'not signal');
    if (signal) {
      this.platform.natureRemoApi.sendSignal(signal);
    }
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
