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

    const tvService = (
      accessory.getService(super.Service.Television) ||
      accessory.addService(super.Service.Television)
    )
      .setCharacteristic(super.Characteristic.Name, ir.nickname)
      .setCharacteristic(super.Characteristic.ConfiguredName, ir.nickname)
      .setCharacteristic(super.Characteristic.ActiveIdentifier, 1);

    tvService.getCharacteristic(super.Characteristic.Active).onSet(() => {
      this.sendSignal('active');
    });

    tvService
      .getCharacteristic(super.Characteristic.RemoteKey)
      .onSet((newValue) => {
        switch (newValue) {
          case super.Characteristic.RemoteKey.REWIND: {
            this.sendSignal('rewind');
            break;
          }
          case super.Characteristic.RemoteKey.FAST_FORWARD: {
            this.sendSignal('fastForward');
            break;
          }
          case super.Characteristic.RemoteKey.NEXT_TRACK: {
            this.sendSignal('nextTrack');
            break;
          }
          case super.Characteristic.RemoteKey.PREVIOUS_TRACK: {
            this.sendSignal('previousTrack');
            break;
          }
          case super.Characteristic.RemoteKey.ARROW_UP: {
            this.sendSignal('arrowUp');
            break;
          }
          case super.Characteristic.RemoteKey.ARROW_DOWN: {
            this.sendSignal('arrowDown');
            break;
          }
          case super.Characteristic.RemoteKey.ARROW_LEFT: {
            this.sendSignal('arrowLeft');
            break;
          }
          case super.Characteristic.RemoteKey.ARROW_RIGHT: {
            this.sendSignal('arrowRight');
            break;
          }
          case super.Characteristic.RemoteKey.SELECT: {
            this.sendSignal('select');
            break;
          }
          case super.Characteristic.RemoteKey.BACK: {
            this.sendSignal('back');
            break;
          }
          case super.Characteristic.RemoteKey.EXIT: {
            this.sendSignal('exit');
            break;
          }
          case super.Characteristic.RemoteKey.PLAY_PAUSE: {
            this.sendSignal('playPause');
            break;
          }
          case super.Characteristic.RemoteKey.INFORMATION: {
            this.sendSignal('information');
            break;
          }
        }
      });

    const speakerService =
      accessory.getService(super.Service.TelevisionSpeaker) ||
      accessory.addService(super.Service.TelevisionSpeaker);

    speakerService
      .setCharacteristic(
        super.Characteristic.Active,
        super.Characteristic.Active.ACTIVE,
      )
      .setCharacteristic(
        super.Characteristic.VolumeControlType,
        super.Characteristic.VolumeControlType.ABSOLUTE,
      );

    // handle volume control
    speakerService
      .getCharacteristic(super.Characteristic.VolumeSelector)
      .onSet((newValue) => {
        if (newValue === super.Characteristic.VolumeSelector.INCREMENT) {
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
      super.natureRemoApi.sendSignal(signal);
    }
  }
}
