"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommercialModel = exports.ChargerType = exports.ChargerState = void 0;
let ChargerState;
exports.ChargerState = ChargerState;
(function (ChargerState) {
  ChargerState[ChargerState["UNKNOWN"] = 0] = "UNKNOWN";
  ChargerState[ChargerState["NOT_ONBOARDED"] = 1] = "NOT_ONBOARDED";
  ChargerState[ChargerState["ONBOARDING"] = 2] = "ONBOARDING";
  ChargerState[ChargerState["IDLE"] = 3] = "IDLE";
  ChargerState[ChargerState["CHARGING_INITIATED"] = 4] = "CHARGING_INITIATED";
  ChargerState[ChargerState["CHARGING"] = 5] = "CHARGING";
  ChargerState[ChargerState["CHARGING_STOPPED"] = 6] = "CHARGING_STOPPED";
  ChargerState[ChargerState["FATAL_ERROR"] = 7] = "FATAL_ERROR";
  ChargerState[ChargerState["BOOT"] = 8] = "BOOT";
  ChargerState[ChargerState["CHARGING_STOP_INITIATED"] = 9] = "CHARGING_STOP_INITIATED";
  ChargerState[ChargerState["HOST_OTA"] = 10] = "HOST_OTA";
  ChargerState[ChargerState["OTA"] = 99] = "OTA";
})(ChargerState || (exports.ChargerState = ChargerState = {}));
let ChargerType;
exports.ChargerType = ChargerType;
(function (ChargerType) {
  ChargerType["OCPP"] = "ocpp";
  ChargerType["SECURE_CHARGE"] = "secureCharge";
})(ChargerType || (exports.ChargerType = ChargerType = {}));
let CommercialModel;
exports.CommercialModel = CommercialModel;
(function (CommercialModel) {
  CommercialModel["INFORMATIONAL"] = "informational";
  CommercialModel["HC_METER"] = "hcMeter";
})(CommercialModel || (exports.CommercialModel = CommercialModel = {}));
//# sourceMappingURL=charger.js.map