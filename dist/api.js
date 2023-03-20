"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatureRemoApi = void 0;
const axios_1 = __importStar(require("axios"));
const settings_1 = require("./settings");
class NatureRemoApi {
    constructor(token, logger) {
        this.token = token;
        this.logger = logger;
        this.baseHeaders = {
            Authorization: `Bearer ${this.token}`,
            'content-type': 'application/x-www-form-urlencoded',
        };
    }
    async airconSettings(applianceId, params) {
        return this._request('POST', `/appliances/${applianceId}/aircon_settings`, params);
    }
    sendSignal(signal) {
        return this._request('POST', `/signals/${signal}/send`);
    }
    async getDevices() {
        return this._request('GET', '/devices');
    }
    async getAppliances() {
        return this._request('GET', '/appliances');
    }
    async _request(method, path, data) {
        this.log('request start', path);
        try {
            const res = await axios_1.default.request({
                url: `${settings_1.BASE_URI}${path}`,
                method: method,
                headers: this.baseHeaders,
                data,
            });
            this.limitLogging(res, path);
            return res.data;
        }
        catch (e) {
            if (!(0, axios_1.isAxiosError)(e)) {
                this.log(`unknown error ${e}`, path, "error" /* LogLevel.ERROR */);
                return;
            }
            if (e.response?.status === 429) {
                this.limitLogging(e.response, path, "warn" /* LogLevel.WARN */);
                return;
            }
            this.log(`api error status: ${e.response?.status} ${e.cause}`, path, "error" /* LogLevel.ERROR */);
        }
        finally {
            this.log('request end', path);
        }
    }
    limitLogging(res, path, logLevel = "debug" /* LogLevel.DEBUG */) {
        const limit = res?.headers?.['x-rate-limit-limit'] ?? 0;
        const remaining = res?.headers?.['x-rate-limit-remaining'] ?? 0;
        const reset = res?.headers?.['x-rate-limit-reset'] ?? 0;
        const resetDate = new Date(reset * 1000).toLocaleString();
        this.log(`status: ${res.status}, limit: ${limit - remaining}/${limit}, reset at [${resetDate}]`, path, logLevel);
    }
    log(message, path, logLevel = "debug" /* LogLevel.DEBUG */) {
        this.logger.log(logLevel, `{api:${path}} ${message}`);
    }
}
exports.NatureRemoApi = NatureRemoApi;
//# sourceMappingURL=api.js.map