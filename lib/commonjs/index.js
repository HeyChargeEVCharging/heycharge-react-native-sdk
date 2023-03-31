"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  initialize: true,
  setUserId: true,
  observeChargers: true,
  removeChargersObserver: true,
  observeSessionsFromDate: true,
  removeSessionsObserver: true,
  startCharging: true,
  stopCharging: true,
  startOnboarding: true,
  startOtaUpdate: true
};
exports.initialize = initialize;
exports.observeChargers = observeChargers;
exports.observeSessionsFromDate = observeSessionsFromDate;
exports.removeChargersObserver = removeChargersObserver;
exports.removeSessionsObserver = removeSessionsObserver;
exports.setUserId = setUserId;
exports.startCharging = startCharging;
exports.startOnboarding = startOnboarding;
exports.startOtaUpdate = startOtaUpdate;
exports.stopCharging = stopCharging;
var _reactNative = require("react-native");
var _interfaces = require("./interfaces");
Object.keys(_interfaces).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _interfaces[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _interfaces[key];
    }
  });
});
//TODO: check why proxy was causing issues in iOS.
const LINKING_ERROR = `The package 'heycharge-sdk' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const HeychargeSdk = _reactNative.NativeModules.HeychargeSdk;
if (!HeychargeSdk) {
  throw new Error(LINKING_ERROR);
}
const chargersChannel = 'Chargers';
const sessionsChannel = 'Sessions';
const otaChannel = 'OTA';
function initialize(sdkKey) {
  if (_reactNative.Platform.OS === 'android') {
    HeychargeSdk.initialize(sdkKey);
  }
  //on iOS, the SDK should be initialized from the AppDelegate in the iOS project.
}

function setUserId(userId) {
  HeychargeSdk.setUserId(userId);
}
function observeChargers(callback) {
  const eventEmitter = new _reactNative.NativeEventEmitter(HeychargeSdk);
  const eventListener = eventEmitter.addListener(chargersChannel, chargersJson => {
    const chargers = chargersJson.map(item => JSON.parse(item));
    callback(chargers);
  });
  if (_reactNative.Platform.OS === 'ios') {
    HeychargeSdk.observeChargers();
  } else {
    HeychargeSdk.observeChargers(callback);
  }
  return eventListener;
}
function removeChargersObserver(callback) {
  if (_reactNative.Platform.OS === 'ios') {
    HeychargeSdk.removeChargersObserver();
  } else {
    HeychargeSdk.removeChargersObserver(callback);
  }
}
function observeSessionsFromDate(startDateInMillis, callback) {
  const eventEmitter = new _reactNative.NativeEventEmitter(HeychargeSdk);
  const eventListener = eventEmitter.addListener(sessionsChannel, sessionsJson => {
    const sessions = sessionsJson.map(item => JSON.parse(item));
    callback(sessions);
  });
  HeychargeSdk.observeSessionsFromDate(startDateInMillis.getTime(), callback);
  return eventListener;
}
function removeSessionsObserver(callback) {
  if (_reactNative.Platform.OS === 'ios') {
    HeychargeSdk.removeSessionsObserver();
  } else {
    HeychargeSdk.removeSessionsObserver(callback);
  }
}
function startCharging(charger) {
  const formattedJson = JSON.stringify(charger);
  return HeychargeSdk.startCharging(formattedJson);
}
function stopCharging(charger) {
  const formattedJson = JSON.stringify(charger);
  return HeychargeSdk.stopCharging(formattedJson);
}
function startOnboarding(charger) {
  const formattedJson = JSON.stringify(charger);
  return HeychargeSdk.startOnboarding(formattedJson);
}
function startOtaUpdate(charger, onError, onProgress, onUpdateFinished) {
  const formattedJson = JSON.stringify(charger);
  const eventEmitter = new _reactNative.NativeEventEmitter(HeychargeSdk);
  const eventListener = eventEmitter.addListener(otaChannel, otaProgress => {
    onProgress(otaProgress);
  });
  HeychargeSdk.startOtaUpdate(formattedJson, onError, onUpdateFinished);
  return eventListener;
}
//# sourceMappingURL=index.js.map