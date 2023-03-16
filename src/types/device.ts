// GET devices responseType
export type Device = {
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
  newest_events: NewestEvents;
};

export type Hu = {
  val: number;
  created_at: Date;
};

export type Il = {
  val: number;
  created_at: Date;
};

export type Mo = {
  val: number;
  created_at: Date;
};

export type Te = {
  val: number;
  created_at: Date;
};

export type NewestEvents = {
  hu?: Hu;
  il?: Il;
  mo?: Mo;
  te: Te;
};
