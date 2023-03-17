import { Categories } from 'homebridge';
import { Appliance, ApplianceAircon, ApplianceIR } from './types/appliance';
import { ApplianceConfig, ApplianceIRTV } from './types/config';
import { InnerDevice } from './types/device';

export const isAirconAppliances = (
  appliances: Appliance[],
): appliances is ApplianceAircon[] => {
  return appliances.filter((e) => e.type !== 'AC').length === 0;
};

export const isIRAppliances = (
  appliances: Appliance[],
): appliances is ApplianceIR[] => {
  return appliances.filter((e) => e.type !== 'IR').length === 0;
};

export const isIRTVAppliancesConfig = (
  config: ApplianceConfig[],
): config is ApplianceIRTV[] => {
  return config.filter((e) => e.type !== 'irtv').length === 0;
};

export const isMini = (device?: InnerDevice) => {
  return device?.firmware_version.includes('Remo-mini') ?? true;
};

export const isNotMini = (device?: InnerDevice) => {
  return !isMini(device);
};

export const getCategoryName = (category: Categories) => {
  return {
    '1': 'OTHER',
    '2': 'BRIDGE',
    '3': 'FAN',
    '4': 'GARAGE_DOOR_OPENER',
    '5': 'LIGHTBULB',
    '6': 'DOOR_LOCK',
    '7': 'OUTLET',
    '8': 'SWITCH',
    '9': 'THERMOSTAT',
    '10': 'SENSOR',
    '11': 'SECURITY_SYSTEM',
    '12': 'DOOR',
    '13': 'WINDOW',
    '14': 'WINDOW_COVERING',
    '15': 'PROGRAMMABLE_SWITCH',
    '16': 'RANGE_EXTENDER',
    '17': 'IP_CAMERA',
    '18': 'VIDEO_DOORBELL',
    '19': 'AIR_PURIFIER',
    '20': 'AIR_HEATER',
    '21': 'AIR_CONDITIONER',
    '22': 'AIR_HUMIDIFIER',
    '23': 'AIR_DEHUMIDIFIER',
    '24': 'APPLE_TV',
    '25': 'HOMEPOD',
    '26': 'SPEAKER',
    '27': 'AIRPORT',
    '28': 'SPRINKLER',
    '29': 'FAUCET',
    '30': 'SHOWER_HEAD',
    '31': 'TELEVISION',
    '32': 'TARGET_CONTROLLER',
    '33': 'ROUTER',
    '34': 'AUDIO_RECEIVER',
    '35': 'TV_SET_TOP_BOX',
    '36': 'TV_STREAMING_STICK',
  }[category.toString()]!;
};
