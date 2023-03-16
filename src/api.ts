import axios, { AxiosResponse, isAxiosError } from 'axios';
import { Logger, LogLevel } from 'homebridge';
import { BASE_URI } from './settings';
import { Appliance } from './types/appliance';
import { Device } from './types/device';

export class NatureRemoApi {
  constructor(public readonly token: string, public readonly logger: Logger) {}

  public readonly baseHeaders = {
    Authorization: `Bearer ${this.token}`,
    'content-type': 'application/x-www-form-urlencoded',
  };

  sendSignal(signal: string) {
    return this._request<void>('POST', `/signals/${signal}/send`);
  }

  getDevices(): Promise<Device[] | undefined> {
    return this._request<Device[]>('GET', '/devices');
  }

  getAppliances(): Promise<Appliance[] | undefined> {
    return this._request<Appliance[]>('GET', '/appliances');
  }

  async _request<T>(
    method: 'GET' | 'POST',
    path: string,
    data?,
  ): Promise<T | undefined> {
    this.log(`request start ${path}`);
    try {
      const res = await axios.request<T>({
        url: `${BASE_URI}${path}`,
        method: method,
        headers: this.baseHeaders,
        data,
      });
      this.limitLogging(res);
      return res.data;
    } catch (e) {
      if (!isAxiosError(e)) {
        this.log(`unknown error ${e}`, LogLevel.ERROR);
        return;
      }
      if (e.response?.status === 429) {
        this.limitLogging(e.response, LogLevel.WARN);
        return;
      }
      this.log(
        `api error status: ${e.response?.status} ${e.cause}`,
        LogLevel.ERROR,
      );
    } finally {
      this.log(`request end: ${path}`);
    }
  }

  limitLogging(res: AxiosResponse, logLevel: LogLevel = LogLevel.DEBUG) {
    const limit = res?.headers?.['x-rate-limit-limit'] ?? 0;
    const remaining = res?.headers?.['x-rate-limit-remaining'] ?? 0;
    const reset = res?.headers?.['x-rate-limit-reset'] ?? 0;
    const resetDate = new Date(reset * 1000).toLocaleString();
    this.log(
      `status: ${res.status}, limit: ${
        limit - remaining
      }/${limit}, reset at [${resetDate}]`,
      logLevel,
    );
  }

  log(message: string, logLevel = LogLevel.DEBUG) {
    this.logger.log(logLevel, `{api} ${message}`);
  }
}
