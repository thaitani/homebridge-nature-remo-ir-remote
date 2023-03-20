"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sensor = void 0;
const utils_1 = require("../utils");
const base_1 = require("./base");
class Sensor extends base_1.NatureRemoAccessory {
    constructor(platform, accessory, device) {
        super(platform, accessory);
        this.platform = platform;
        this.accessory = accessory;
        this.device = device;
        this.setAccessoryInformation({
            manufacturer: 'Nature',
            model: device.firmware_version.split('/')[0],
            serialNumber: device.serial_number,
            firmwareRevision: device.firmware_version,
        });
        this.getOrAddService(this.Service.TemperatureSensor)
            .setCharacteristic(this.Characteristic.Name, `${this.device.name} 温度計`)
            .setCharacteristic(this.Characteristic.ConfiguredName, `${this.device.name} 温度計`)
            .updateCharacteristic(this.Characteristic.CurrentTemperature, device.newest_events.te.val);
        if ((0, utils_1.isNotMini)(device)) {
            this.getOrAddService(this.Service.HumiditySensor)
                .setCharacteristic(this.Characteristic.Name, `${this.device.name} 湿度計`)
                .setCharacteristic(this.Characteristic.ConfiguredName, `${this.device.name} 湿度計`)
                .updateCharacteristic(this.Characteristic.CurrentRelativeHumidity, device.newest_events.hu.val);
            const lightLevel = device.newest_events.il.val === 0
                ? 0.0001
                : device.newest_events.il.val;
            this.getOrAddService(this.Service.LightSensor)
                .setCharacteristic(this.Characteristic.Name, `${this.device.name} 照度計`)
                .setCharacteristic(this.Characteristic.ConfiguredName, `${this.device.name} 照度計`)
                .updateCharacteristic(this.Characteristic.CurrentAmbientLightLevel, lightLevel);
        }
    }
}
exports.Sensor = Sensor;
//# sourceMappingURL=sensor.js.map