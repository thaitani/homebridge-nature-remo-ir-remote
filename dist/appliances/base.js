"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatureRemoAccessory = void 0;
const utils_1 = require("../utils");
class NatureRemoAccessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.Characteristic = this.platform.Characteristic;
        this.Service = this.platform.Service;
        this.natureRemoApi = this.platform.natureRemoApi;
    }
    setAccessoryInformation(info) {
        this.accessory
            .getService(this.Service.AccessoryInformation)
            .setCharacteristic(this.Characteristic.Manufacturer, info.manufacturer)
            .setCharacteristic(this.Characteristic.Model, info.model)
            .setCharacteristic(this.Characteristic.SerialNumber, info.serialNumber)
            .setCharacteristic(this.Characteristic.FirmwareRevision, info.firmwareRevision);
    }
    getOrAddService(service) {
        return (this.accessory.getService(service) ||
            this.accessory.addService(service));
    }
    log(message, logLevel = "debug" /* LogLevel.DEBUG */) {
        this.platform.logger.log(logLevel, `{${(0, utils_1.getCategoryName)(this.accessory.category)}:${this.accessory.displayName}} ${message}`);
    }
}
exports.NatureRemoAccessory = NatureRemoAccessory;
//# sourceMappingURL=base.js.map