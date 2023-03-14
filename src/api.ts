import axios, { AxiosResponse, isAxiosError } from 'axios';
import { Logger, LogLevel } from 'homebridge';
import { BASE_URI } from './settings';
import { Appliance, Device } from './types';

export class NatureRemoApi {
  constructor(public readonly token: string, public readonly logger: Logger) {}

  public readonly baseHeaders = {
    Authorization: `Bearer ${this.token}`,
    'content-type': 'application/x-www-form-urlencoded',
  };

  async sendSignal(signal: string) {
    await this._request('POST', `/signals/${signal}/send`);
  }

  async getDevices(): Promise<Device[]> {
    const devices: Device[] | undefined = await this._request(
      'GET',
      '/devices',
    );
    return devices ?? [];
  }

  async getAppliances(): Promise<Appliance[]> {
    const appliances: Appliance[] | undefined = await this._request(
      'GET',
      '/appliances',
    );
    return appliances ?? [];
  }

  async _request(method: 'GET' | 'POST', path: string, data?) {
    this.logger.debug('request start', path);
    try {
      const res = await axios.request({
        url: `${BASE_URI}${path}`,
        method: method,
        headers: this.baseHeaders,
        data,
      });
      this.limitLogging(res);
      return res.data;
    } catch (e) {
      if (!isAxiosError(e)) {
        this.logger.error('unknown error', e);
        return;
      }
      this.logger.info(e.request.headers);
      if (e.response?.status === 429) {
        this.limitLogging(e.response, LogLevel.WARN);
        return;
      }
      this.logger.error(`api error status: ${e.response?.status}`, e.message);
    } finally {
      this.logger.debug('request end', path);
    }
  }

  limitLogging(res: AxiosResponse, logLevel: LogLevel = LogLevel.INFO) {
    const limit = res?.headers?.['x-rate-limit-limit'] ?? 0;
    const remaining = res?.headers?.['x-rate-limit-remaining'] ?? 0;
    const reset = res?.headers?.['x-rate-limit-reset'] ?? 0;
    const resetDate = new Date(reset * 1000).toLocaleString();
    this.logger.log(
      logLevel,
      `status: ${res.status}, limit: ${
        limit - remaining
      }/${limit}, reset at [${resetDate}]`,
    );
  }
}