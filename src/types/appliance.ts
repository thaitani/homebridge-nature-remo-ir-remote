// GET appliances response type
export type Appliance = ApplianceIR | ApplianceAircon | ApplianceQrio;

export type ApplianceBase = {
  id: string;
  device: Device;
  model: Model;
  nickname: string;
  image: string;
};

type ApplianceIR = {
  type: 'IR';
  signals: Signal[];
} & ApplianceBase;

type ApplianceAircon = {
  type: 'AC';
  aircon: Aircon;
  settings: Settings;
  model: Model;
} & ApplianceBase;

type ApplianceQrio = {
  type: 'QRIO_LOCK';
  qrio_lock: QrioLock;
} & ApplianceBase;

type Device = {
  name: string;
  id: string;
  created_at: Date;
  updated_at: Date;
  mac_address: string;
  bt_mac_address: string;
  serial_number: string;
  firmware_version: string;
  temperature_offset: number;
  humidity_offset: number;
};

export type Model = {
  id: string;
  country: string;
  manufacturer: string;
  remote_name: string;
  series: string;
  name: string;
  image: string;
};

export type Settings = {
  temp: string;
  temp_unit: string;
  mode: string;
  vol: string;
  dir: string;
  dirh: string;
  button: string;
  updated_at: Date;
};

export type Cool = {
  temp: string[];
  dir: string[];
  dirh: string[];
  vol: string[];
};

export type Dry = {
  temp: string[];
  dir: string[];
  dirh: string[];
  vol: string[];
};

export type Warm = {
  temp: string[];
  dir: string[];
  dirh: string[];
  vol: string[];
};

export type Modes = {
  cool: Cool;
  dry: Dry;
  warm: Warm;
};

export type Range = {
  modes: Modes;
  fixedButtons: string[];
};

export type Aircon = {
  range: Range;
  tempUnit: string;
};

export type Signal = {
  id: string;
  name: string;
  image: string;
};

export type QrioLockDevice = {
  id: number;
  image: string;
  name: string;
};

export type QrioLock = {
  device: QrioLockDevice;
  bd_address: string;
  is_available: boolean;
};
