"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const api_1 = require("./api");
const api_mock_1 = require("./api.mock");
const aircon_1 = require("./appliances/aircon");
const irtv_1 = require("./appliances/irtv");
const sensor_1 = require("./appliances/sensor");
const settings_1 = require("./settings");
const utils_1 = require("./utils");
class NatureRemoRemotePlatform {
    constructor(logger, config, api) {
        this.logger = logger;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.accessories = [];
        this.airconAppliancesSubject = new rxjs_1.BehaviorSubject([]);
        this.irAppliancesSubject = new rxjs_1.BehaviorSubject([]);
        this.devicesSubject = new rxjs_1.BehaviorSubject([]);
        this.natureRemoApi = process.env.DEBUG === 'test'
            ? new api_mock_1.ApiMock(this.logger)
            : new api_1.NatureRemoApi(this.config.token, this.logger);
        this.safeConfig = this.config;
        this.log(`Finished initializing platform: ${this.config.name}`);
        (0, rxjs_1.timer)(0, (this.config.appliancesRefreshRate ?? 300) * 1000)
            .pipe((0, rxjs_1.map)(() => this.natureRemoApi.getAppliances()))
            .subscribe(async (newValue) => {
            const appliances = await newValue;
            if (appliances) {
                const ac = appliances.filter((e) => e.type === 'AC');
                this.airconAppliancesSubject.next(ac);
                const ir = appliances.filter((e) => e.type === 'IR');
                this.irAppliancesSubject.next(ir);
            }
        });
        (0, rxjs_1.timer)(0, (this.safeConfig.devicesRefreshRate ?? 300) * 1000)
            .pipe((0, rxjs_1.map)(() => this.natureRemoApi.getDevices()))
            .subscribe(async (newValue) => {
            const devices = await newValue;
            if (devices) {
                this.devicesSubject.next(devices);
            }
        });
        this.api.on("didFinishLaunching" /* APIEvent.DID_FINISH_LAUNCHING */, () => {
            this.log(`${settings_1.PLATFORM_NAME} 'didFinishLaunching'`);
            this.discoverDevices();
            this.unregisterPlatformAccessories();
        });
    }
    discoverDevices() {
        this.devicesSubject.subscribe((devices) => {
            devices.forEach((device) => this.registerPlatformAccessories(device.id, device.name, (accessory) => new sensor_1.Sensor(this, accessory, device), 10 /* Categories.SENSOR */));
        });
        this.airconAppliancesSubject.subscribe((appliances) => {
            appliances.forEach((aircon) => this.registerPlatformAccessories(aircon.id, aircon.nickname, (accessory) => new aircon_1.Aircon(this, accessory, aircon), 21 /* Categories.AIR_CONDITIONER */));
        });
        const irtvConfig = this.safeConfig.appliances?.filter((e) => e.type === 'irtv');
        irtvConfig?.forEach((config) => {
            this.irAppliancesSubject.subscribe((appliances) => {
                appliances.forEach((ir) => {
                    if (ir.nickname === config.name) {
                        this.registerPlatformAccessories(ir.id, ir.nickname, (accessory) => new irtv_1.IRTV(this, accessory, ir, config), 31 /* Categories.TELEVISION */);
                    }
                });
            });
        });
    }
    registerPlatformAccessories(id, displayName, setupAccessory, category) {
        const uuid = this.api.hap.uuid.generate(id);
        const existingAccessory = this.accessories.find((e) => e.UUID === uuid);
        if (existingAccessory) {
            setupAccessory(existingAccessory);
        }
        else {
            const accessory = new this.api.platformAccessory(displayName, uuid, category);
            setupAccessory(accessory);
            this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [
                accessory,
            ]);
            this.accessories.push(accessory);
        }
    }
    // APIの結果にないAccessoryを削除する
    unregisterPlatformAccessories() {
        this.devicesSubject.subscribe((devices) => {
            this.unregisterPlatformAccessory(devices, 10 /* Categories.SENSOR */);
        });
        this.airconAppliancesSubject.subscribe((appliances) => {
            this.unregisterPlatformAccessory(appliances, 21 /* Categories.AIR_CONDITIONER */);
        });
        this.irAppliancesSubject.subscribe((irs) => {
            this.unregisterPlatformAccessory(irs, 31 /* Categories.TELEVISION */);
        });
    }
    unregisterPlatformAccessory(targets, category) {
        if (this.accessories.length === 0 || targets.length === 0) {
            return;
        }
        const uuids = targets.map((target) => this.api.hap.uuid.generate(target.id));
        const notExistsAccessories = this.accessories.filter((accessory) => accessory.category === category && !uuids.includes(accessory.UUID));
        if (notExistsAccessories.length > 0) {
            this.log(`unregister ${(0, utils_1.getCategoryName)(category)} accessories ${notExistsAccessories.reduce((prev, curr) => `${prev}, ${curr.displayName}`, '')}`);
            this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, notExistsAccessories);
        }
    }
    configureAccessory(accessory) {
        this.log(`Configuring accessory: ${(0, utils_1.getCategoryName)(accessory.category)}, ${accessory.displayName}`);
        this.accessories.push(accessory);
    }
    log(message, logLevel = "debug" /* LogLevel.DEBUG */) {
        this.logger.log(logLevel, `{platform} ${message}`);
    }
}
exports.default = NatureRemoRemotePlatform;
//# sourceMappingURL=platform.js.map