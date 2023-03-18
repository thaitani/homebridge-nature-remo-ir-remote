import axios, { AxiosResponse, isAxiosError } from 'axios';
import { LogLevel, Logger } from 'homebridge';
import { BASE_URI } from './settings';
import { Appliance, Settings } from './types/appliance';
import { Device } from './types/device';

export type AirconSettingParams = {
  button: 'power-off' | '';
  dir?: string;
  dirh?: string;
  operation_mode?: string;
  temperature?: string;
  volume?: string;
};

export type AirconSettingsResponse = Settings;

export interface INatureRemoApi {
  sendSignal(signal: string): Promise<void>;
  airconSettings(
    applianceId: string,
    params: AirconSettingParams,
  ): Promise<AirconSettingsResponse | undefined>;
  getDevices(): Promise<Device[] | undefined>;
  getAppliances(): Promise<Appliance[] | undefined>;
}

export class NatureRemoApi implements INatureRemoApi {
  constructor(
    private readonly token: string,
    private readonly logger: Logger,
  ) {}

  private readonly baseHeaders = {
    Authorization: `Bearer ${this.token}`,
    'content-type': 'application/x-www-form-urlencoded',
  };

  async airconSettings(
    applianceId: string,
    params: AirconSettingParams,
  ): Promise<AirconSettingsResponse | undefined> {
    return this._request<AirconSettingsResponse>(
      'POST',
      `/appliances/${applianceId}/aircon_settings`,
      params,
    );
  }

  sendSignal(signal: string) {
    return this._request<void>('POST', `/signals/${signal}/send`);
  }

  async getDevices(): Promise<Device[] | undefined> {
    return this._request<Device[]>('GET', '/devices');
  }

  async getAppliances(): Promise<Appliance[] | undefined> {
    return this._request<Appliance[]>('GET', '/appliances');
  }

  async _request<T>(
    method: 'GET' | 'POST',
    path: string,
    data?,
  ): Promise<T | undefined> {
    this.log('request start', path);
    try {
      const res = await axios.request<T>({
        url: `${BASE_URI}${path}`,
        method: method,
        headers: this.baseHeaders,
        data,
      });
      this.limitLogging(res, path);
      return res.data;
    } catch (e) {
      if (!isAxiosError(e)) {
        this.log(`unknown error ${e}`, path, LogLevel.ERROR);
        return;
      }
      if (e.response?.status === 429) {
        this.limitLogging(e.response, path, LogLevel.WARN);
        return;
      }
      this.log(
        `api error status: ${e.response?.status} ${e.cause}`,
        path,
        LogLevel.ERROR,
      );
    } finally {
      this.log('request end', path);
    }
  }

  limitLogging(
    res: AxiosResponse,
    path: string,
    logLevel: LogLevel = LogLevel.DEBUG,
  ) {
    const limit = res?.headers?.['x-rate-limit-limit'] ?? 0;
    const remaining = res?.headers?.['x-rate-limit-remaining'] ?? 0;
    const reset = res?.headers?.['x-rate-limit-reset'] ?? 0;
    const resetDate = new Date(reset * 1000).toLocaleString();
    this.log(
      `status: ${res.status}, limit: ${
        limit - remaining
      }/${limit}, reset at [${resetDate}]`,
      path,
      logLevel,
    );
  }

  log(message: string, path: string, logLevel = LogLevel.DEBUG) {
    this.logger.log(logLevel, `{api:${path}} ${message}`);
  }
}
