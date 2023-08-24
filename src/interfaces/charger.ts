export interface RNCharger {
  charger: Charger;
  properties: ChargerProperties;
}

export interface ChargerProperties {
  isAvailable: boolean;
  isChargingByUser: boolean;
  isChargerBusy: boolean;
  isChargerUpdateAvailable: boolean;
}

export interface Charger {
  name: string;
  address: string;
  bluetoothState?: ChargerState;
  type: ChargerType;
  commercialModel: CommercialModel;
}

export enum ChargerState {
  UNKNOWN = 0,
  NOT_ONBOARDED = 1,
  ONBOARDING = 2,
  IDLE = 3,
  CHARGING_INITIATED = 4,
  CHARGING = 5,
  CHARGING_STOPPED = 6,
  FATAL_ERROR = 7,
  BOOT = 8,
  CHARGING_STOP_INITIATED = 9,
  HOST_OTA = 10,
  OTA = 100,
}

export enum ChargerType {
  OCPP = 'ocpp',
  SECURE_CHARGE = 'secureCharge',
}

export enum CommercialModel {
  INFORMATIONAL = 'informational',
  HC_METER = 'hcMeter',
}
