"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryName = exports.isNotMini = exports.isMini = void 0;
const isMini = (device) => {
    return device?.firmware_version.includes('Remo-mini') ?? true;
};
exports.isMini = isMini;
const isNotMini = (device) => {
    return !(0, exports.isMini)(device);
};
exports.isNotMini = isNotMini;
const getCategoryName = (category) => {
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
    }[category.toString()];
};
exports.getCategoryName = getCategoryName;
//# sourceMappingURL=utils.js.map