import { InnerDevice } from './device';

// GET appliances response type
export type Appliance = ApplianceIR | ApplianceAircon | ApplianceQrio;

export type ApplianceBase = {
  id: string;
  device: InnerDevice;
  model?: Model;
  nickname: string;
  image: string;
};

export type ApplianceIR = {
  type: 'IR';
  signals: Signal[];
} & ApplianceBase;

export type ApplianceAircon = {
  type: 'AC';
  aircon: Aircon;
  settings: Settings;
  model: Model;
} & ApplianceBase;

export type ApplianceQrio = {
  type: 'QRIO_LOCK';
  qrio_lock: QrioLock;
} & ApplianceBase;

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
  temp_unit: TempUnit;
  mode: Mode;
  vol: string;
  dir: string;
  dirh: string;
  button: string;
  updated_at: Date;
};

export type ModeRange = {
  temp: string[];
  dir: string[];
  dirh: string[];
  vol: string[];
};

export type Mode = 'cool' | 'dry' | 'warm';

export type Modes = {
  [key in Mode]: ModeRange;
};

export type Range = {
  modes: Modes;
  fixedButtons: string[];
};

export type Aircon = {
  range: Range;
  tempUnit: TempUnit;
};

type TempUnit = 'c' | 'f';

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
