import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
//TODO: check why proxy was causing issues in iOS.
const LINKING_ERROR = `The package 'heycharge-react-native-sdk' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const HeychargeSdk = NativeModules.HeychargeSdk;
if (!HeychargeSdk) {
  throw new Error(LINKING_ERROR);
}
const chargersChannel = 'Chargers';
const sessionsChannel = 'Sessions';
const otaChannel = 'OTA';
export function initialize(sdkKey) {
  if (Platform.OS === 'android') {
    HeychargeSdk.initialize(sdkKey);
  }
  //on iOS, the SDK should be initialized from the AppDelegate in the iOS project.
}

export function setUserId(userId) {
  HeychargeSdk.setUserId(userId);
}
export function initializeChargers(propertyId) {
  HeychargeSdk.initializeChargers(propertyId);
}
export function getUserPropertiesCombined(callback, errorCallback) {
  console.log('before called getUserPropertiesCombined from native');
  HeychargeSdk.getUserPropertiesCombined(properties => {
    console.log('User properties:', properties);
    callback(properties);
  }, error => {
    console.error('Error fetching user properties:', error);
    errorCallback(error);
  });
}
export function observeChargers(callback) {
  const eventEmitter = new NativeEventEmitter(HeychargeSdk);
  const eventListener = eventEmitter.addListener(chargersChannel, chargersJson => {
    const chargers = chargersJson.map(item => JSON.parse(item));
    callback(chargers);
  });
  if (Platform.OS === 'ios') {
    HeychargeSdk.observeChargers();
  } else {
    HeychargeSdk.observeChargers(callback);
  }
  return eventListener;
}
export function removeChargersObserver(callback) {
  if (Platform.OS === 'ios') {
    HeychargeSdk.removeChargersObserver();
  } else {
    HeychargeSdk.removeChargersObserver(callback);
  }
}
export function observeSessionsFromDate(startDateInMillis, callback) {
  const eventEmitter = new NativeEventEmitter(HeychargeSdk);
  const eventListener = eventEmitter.addListener(sessionsChannel, sessionsJson => {
    const sessions = sessionsJson.map(item => JSON.parse(item));
    callback(sessions);
  });
  HeychargeSdk.observeSessionsFromDate(startDateInMillis.getTime(), callback);
  return eventListener;
}
export function removeSessionsObserver(callback) {
  if (Platform.OS === 'ios') {
    HeychargeSdk.removeSessionsObserver();
  } else {
    HeychargeSdk.removeSessionsObserver(callback);
  }
}
export function startCharging(charger) {
  const formattedJson = JSON.stringify(charger);
  return HeychargeSdk.startCharging(formattedJson);
}
export function stopCharging(charger) {
  const formattedJson = JSON.stringify(charger);
  return HeychargeSdk.stopCharging(formattedJson);
}
export function startOnboarding(charger) {
  const formattedJson = JSON.stringify(charger);
  return HeychargeSdk.startOnboarding(formattedJson);
}
export function startOtaUpdate(charger, onError, onProgress, onUpdateFinished) {
  const formattedJson = JSON.stringify(charger);
  const eventEmitter = new NativeEventEmitter(HeychargeSdk);
  const eventListener = eventEmitter.addListener(otaChannel, otaProgress => {
    onProgress(otaProgress);
  });
  HeychargeSdk.startOtaUpdate(formattedJson, onError, onUpdateFinished);
  return eventListener;
}
export * from './interfaces';
//# sourceMappingURL=index.js.map