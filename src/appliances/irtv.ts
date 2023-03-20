import { PlatformAccessory } from 'homebridge';
import NatureRemoRemotePlatform from '../platform';
import { ApplianceIR } from '../types/appliance';
import { ApplianceIRTV } from '../types/config';
import { NatureRemoAccessory } from './base';

export class IRTV extends NatureRemoAccessory {
  constructor(
    protected readonly platform: NatureRemoRemotePlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly ir: ApplianceIR,
    protected readonly irTVConfig: ApplianceIRTV,
  ) {
    super(platform, accessory);
    this.setAccessoryInformation({
      manufacturer: 'Nature',
      model: ir.device.name,
      serialNumber: ir.device.serial_number,
      firmwareRevision: ir.device.firmware_version,
    });

    const tvService = this.getOrAddService(this.Service.Television)
      .setCharacteristic(this.Characteristic.Name, ir.nickname)
      .setCharacteristic(this.Characteristic.ConfiguredName, ir.nickname)
      .setCharacteristic(this.Characteristic.ActiveIdentifier, 1);

    tvService.getCharacteristic(this.Characteristic.Active).onSet(() => {
      this.sendSignal('active');
    });

    tvService
      .getCharacteristic(this.Characteristic.RemoteKey)
      .onSet((newValue) => {
        switch (newValue) {
          case this.Characteristic.RemoteKey.REWIND: {
            this.sendSignal('rewind');
            break;
          }
          case this.Characteristic.RemoteKey.FAST_FORWARD: {
            this.sendSignal('fastForward');
            break;
          }
          case this.Characteristic.RemoteKey.NEXT_TRACK: {
            this.sendSignal('nextTrack');
            break;
          }
          case this.Characteristic.RemoteKey.PREVIOUS_TRACK: {
            this.sendSignal('previousTrack');
            break;
          }
          case this.Characteristic.RemoteKey.ARROW_UP: {
            this.sendSignal('arrowUp');
            break;
          }
          case this.Characteristic.RemoteKey.ARROW_DOWN: {
            this.sendSignal('arrowDown');
            break;
          }
          case this.Characteristic.RemoteKey.ARROW_LEFT: {
            this.sendSignal('arrowLeft');
            break;
          }
          case this.Characteristic.RemoteKey.ARROW_RIGHT: {
            this.sendSignal('arrowRight');
            break;
          }
          case this.Characteristic.RemoteKey.SELECT: {
            this.sendSignal('select');
            break;
          }
          case this.Characteristic.RemoteKey.BACK: {
            this.sendSignal('back');
            break;
          }
          case this.Characteristic.RemoteKey.EXIT: {
            this.sendSignal('exit');
            break;
          }
          case this.Characteristic.RemoteKey.PLAY_PAUSE: {
            this.sendSignal('playPause');
            break;
          }
          case this.Characteristic.RemoteKey.INFORMATION: {
            this.sendSignal('information');
            break;
          }
        }
      });

    const speakerService = this.getOrAddService(this.Service.TelevisionSpeaker)
      .setCharacteristic(
        this.Characteristic.Active,
        this.Characteristic.Active.ACTIVE,
      )
      .setCharacteristic(
        this.Characteristic.VolumeControlType,
        this.Characteristic.VolumeControlType.ABSOLUTE,
      );

    // handle volume control
    speakerService
      .getCharacteristic(this.Characteristic.VolumeSelector)
      .onSet((newValue) => {
        if (newValue === this.Characteristic.VolumeSelector.INCREMENT) {
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
      this.natureRemoApi.sendSignal(signal);
    }
  }
}
