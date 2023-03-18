import { Logger } from 'homebridge';
import { AirconSettingParams, INatureRemoApi } from './api';
import { Appliance } from './types/appliance';
import { Device } from './types/device';

export class ApiMock implements INatureRemoApi {
  constructor(private readonly logger: Logger) {}
  async airconSettings(applianceId: string, params: AirconSettingParams) {
    this.logger.debug(
      `{apimock} aircon settings ${applianceId}, ${params.button}, ${params.dir}, ${params.dirh} ${params.operation_mode}, ${params.temperature}, ${params.vol}`,
    );
    return params;
  }

  async sendSignal(signal: string): Promise<void | undefined> {
    this.logger.debug(`{apimock} send signal ${signal}`);
  }

  async getDevices(): Promise<Device[] | undefined> {
    this.logger.debug('{apimock} get devices');
    return [
      {
        name: '寝室',
        id: '3386e747-5c21-4c8e-938e-faf9a521cec3',
        created_at: new Date('2021-07-22T10:11:03Z'),
        updated_at: new Date('2023-03-14T06:57:18Z'),
        mac_address: 'e8:68:e7:27:c6:08',
        bt_mac_address: 'e8:68:e7:27:c6:0a',
        serial_number: '1W321030001678',
        firmware_version: 'Remo/1.12.1',
        temperature_offset: 0,
        humidity_offset: 0,

        newest_events: {
          hu: {
            val: 52,
            created_at: new Date('2023-03-15T08:55:59Z'),
          },
          il: {
            val: 0,
            created_at: new Date('2023-03-15T08:53:25Z'),
          },
          mo: {
            val: 1,
            created_at: new Date('2023-03-14T23:32:52Z'),
          },
          te: {
            val: 19.1,
            created_at: new Date('2023-03-15T09:07:00Z'),
          },
        },
      },
      {
        name: 'リビング',
        id: '7fb65610-3c4e-49c5-b5d9-916216acc7f2',
        created_at: new Date('2021-06-25T02:22:36Z'),
        updated_at: new Date('2023-03-13T04:46:02Z'),
        mac_address: '30:83:98:40:a7:50',
        bt_mac_address: '30:83:98:40:a7:52',
        serial_number: '2W221050018002',
        firmware_version: 'Remo-mini/1.11.2',
        temperature_offset: 0,
        humidity_offset: 0,

        newest_events: {
          te: {
            val: 22.3,
            created_at: new Date('2023-03-15T08:54:34Z'),
          },
        },
      },
    ];
  }

  async getAppliances(): Promise<Appliance[] | undefined> {
    this.logger.debug('{apimock} get appliances');
    return [
      {
        id: '95201d2a-370c-4b27-82d5-3b6fa46639cc',
        device: {
          name: '寝室',
          id: '3386e747-5c21-4c8e-938e-faf9a521cec3',
          created_at: new Date(new Date('2021-07-22T10:11:03Z')),
          updated_at: new Date('2023-03-13T06:41:49Z'),
          mac_address: 'e8:68:e7:27:c6:08',
          bt_mac_address: 'e8:68:e7:27:c6:0a',
          serial_number: '1W321030001678',
          firmware_version: 'Remo/1.11.2',
          temperature_offset: 0,
          humidity_offset: 0,
        },
        type: 'IR',
        nickname: 'プロジェクター寝室',
        image: 'ico_tv',
        signals: [
          {
            id: '71638b2f-a29d-411b-9261-78a670bade73',
            name: '音量ー',
            image: 'ico_minus',
          },
          {
            id: '05f7f80c-5d4a-422e-b788-096248c4d3c9',
            name: '電源',
            image: 'ico_io',
          },
          {
            id: '7115c35c-1f63-4e5d-9d11-eadad6f38f16',
            name: '音量＋',
            image: 'ico_plus',
          },
          {
            id: '4ce8a6b5-f67f-40d0-9635-1f6eb633002f',
            name: 'HDMI',
            image: 'ico_display',
          },
          {
            id: '0db229d3-3cc2-4069-a7e8-e90270a63c68',
            name: 'フォーカス',
            image: 'ico_broadcast',
          },
        ],
      },
      {
        id: '99de22f1-5ebc-4acb-8c0d-39676943f713',
        device: {
          name: 'リビング',
          id: '7fb65610-3c4e-49c5-b5d9-916216acc7f2',
          created_at: new Date('2021-06-25T02:22:36Z'),
          updated_at: new Date('2023-03-13T04:46:02Z'),
          mac_address: '30:83:98:40:a7:50',
          bt_mac_address: '30:83:98:40:a7:52',
          serial_number: '2W221050018002',
          firmware_version: 'Remo-mini/1.11.2',
          temperature_offset: 0,
          humidity_offset: 0,
        },
        type: 'IR',
        nickname: 'プロジェクターリビング',
        image: 'ico_tv',
        signals: [
          {
            id: '6d7c1349-00e4-460f-9b4f-8cc9f0712b72',
            name: '音量ー',
            image: 'ico_minus',
          },
          {
            id: 'b8134480-532f-4bfc-9bae-b77ca02149a5',
            name: '電源',
            image: 'ico_io',
          },
          {
            id: '51c06224-35a5-42ee-9fb7-1ccffe968359',
            name: '音量＋',
            image: 'ico_plus',
          },
          {
            id: 'cf1ff5aa-ef25-4ef7-8114-49b244fb32ba',
            name: 'HDMI',
            image: 'ico_display',
          },
          {
            id: 'd3060f95-c64e-425d-878d-0f9d7bfa20b8',
            name: 'フォーカス',
            image: 'ico_broadcast',
          },
        ],
      },
      {
        id: '13739842-eebb-4520-b659-5cf362165199',
        device: {
          name: 'リビング',
          id: '7fb65610-3c4e-49c5-b5d9-916216acc7f2',
          created_at: new Date('2021-06-25T02:22:36Z'),
          updated_at: new Date('2023-03-13T04:46:02Z'),
          mac_address: '30:83:98:40:a7:50',
          bt_mac_address: '30:83:98:40:a7:52',
          serial_number: '2W221050018002',
          firmware_version: 'Remo-mini/1.11.2',
          temperature_offset: 0,
          humidity_offset: 0,
        },
        model: {
          id: '662B89B3-384D-41F6-90D7-91E2F7E4C2A1',
          country: 'JP',
          manufacturer: 'hitachi',
          remote_name: 'rar3b1',
          series: 'Hitachi AC',
          name: 'Hitachi AC 001',
          image: 'ico_ac_1',
        },
        type: 'AC',
        nickname: 'リビングのエアコン',
        image: 'ico_ac_1',
        settings: {
          temp: '0',
          temp_unit: 'c',
          mode: 'dry',
          vol: '1',
          dir: '',
          dirh: '',
          button: '',
          updated_at: new Date('2023-03-02T08:55:08Z'),
        },
        aircon: {
          range: {
            modes: {
              cool: {
                temp: [
                  '16',
                  '17',
                  '18',
                  '19',
                  '20',
                  '21',
                  '22',
                  '23',
                  '24',
                  '25',
                  '26',
                  '27',
                  '28',
                  '29',
                  '30',
                  '31',
                  '32',
                ],
                dir: [''],
                dirh: [''],
                vol: ['1', '2', '3', '4', 'auto'],
              },
              dry: {
                temp: ['0'],
                dir: [''],
                dirh: [''],
                vol: ['1', '2', '3', '4', 'auto'],
              },
              warm: {
                temp: [
                  '16',
                  '17',
                  '18',
                  '19',
                  '20',
                  '21',
                  '22',
                  '23',
                  '24',
                  '25',
                  '26',
                  '27',
                  '28',
                  '29',
                  '30',
                  '31',
                  '32',
                ],
                dir: [''],
                dirh: [''],
                vol: ['1', '2', '3', '4', 'auto'],
              },
            },
            fixedButtons: ['power-off'],
          },
          tempUnit: 'c',
        },
      },
      {
        id: 'aec5b55d-8561-41a5-bde7-07facddd713e',
        device: {
          name: '寝室',
          id: '3386e747-5c21-4c8e-938e-faf9a521cec3',
          created_at: new Date(new Date('2021-07-22T10:11:03Z')),
          updated_at: new Date('2023-03-13T06:41:49Z'),
          mac_address: 'e8:68:e7:27:c6:08',
          bt_mac_address: 'e8:68:e7:27:c6:0a',
          serial_number: '1W321030001678',
          firmware_version: 'Remo/1.11.2',
          temperature_offset: 0,
          humidity_offset: 0,
        },
        model: {
          id: '662B89B3-384D-41F6-90D7-91E2F7E4C2A1',
          country: 'JP',
          manufacturer: 'hitachi',
          remote_name: 'rar3b1',
          series: 'Hitachi AC',
          name: 'Hitachi AC 001',
          image: 'ico_ac_1',
        },
        type: 'AC',
        nickname: '寝室のエアコン',
        image: 'ico_ac_1',
        settings: {
          temp: '18',
          temp_unit: 'c',
          mode: 'warm',
          vol: 'auto',
          dir: '',
          dirh: '',
          button: 'power-off',
          updated_at: new Date('2023-01-25T12:36:31Z'),
        },
        aircon: {
          range: {
            modes: {
              cool: {
                temp: [
                  '16',
                  '17',
                  '18',
                  '19',
                  '20',
                  '21',
                  '22',
                  '23',
                  '24',
                  '25',
                  '26',
                  '27',
                  '28',
                  '29',
                  '30',
                  '31',
                  '32',
                ],
                dir: [''],
                dirh: [''],
                vol: ['1', '2', '3', '4', 'auto'],
              },
              dry: {
                temp: ['0'],
                dir: [''],
                dirh: [''],
                vol: ['1', '2', '3', '4', 'auto'],
              },
              warm: {
                temp: [
                  '16',
                  '17',
                  '18',
                  '19',
                  '20',
                  '21',
                  '22',
                  '23',
                  '24',
                  '25',
                  '26',
                  '27',
                  '28',
                  '29',
                  '30',
                  '31',
                  '32',
                ],
                dir: [''],
                dirh: [''],
                vol: ['1', '2', '3', '4', 'auto'],
              },
            },
            fixedButtons: ['power-off'],
          },
          tempUnit: 'c',
        },
      },
    ];
  }
}
