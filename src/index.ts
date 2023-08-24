import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  EmitterSubscription,
} from 'react-native';
import type { Charger, RNCharger, RNProperty, Session } from 'src/interfaces';

//TODO: check why proxy was causing issues in iOS.
const LINKING_ERROR =
  `The package 'heycharge-react-native-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const HeychargeSdk = NativeModules.HeychargeSdk;

if (!HeychargeSdk) {
  throw new Error(LINKING_ERROR);
}

const chargersChannel = 'Chargers';
const sessionsChannel = 'Sessions';
const otaChannel = 'OTA';

export function initialize(sdkKey: string) {
  if (Platform.OS === 'android') {
    HeychargeSdk.initialize(sdkKey);
  }
  //on iOS, the SDK should be initialized from the AppDelegate in the iOS project.
}

export function setUserId(userId: string) {
  HeychargeSdk.setUserId(userId);
}

export async function getUserProperties(): Promise<RNProperty[] | null> {
  try {
    const userPropertiesJson = await HeychargeSdk.getUserProperties();
    const userProperties: RNProperty[] = userPropertiesJson.map(
      (item: string) => JSON.parse(item) as RNCharger
    );
    return userProperties;
  } catch (error) {
    console.log('Error fetching properties:', error);
    return null;
  }
}

export function observeChargers(
  propertyId: string,
  callback: (chargers: RNCharger[]) => void
): EmitterSubscription {
  const eventEmitter = new NativeEventEmitter(HeychargeSdk);
  const eventListener = eventEmitter.addListener(
    chargersChannel,
    (chargersJson) => {
      const chargers: RNCharger[] = chargersJson.map(
        (item: string) => JSON.parse(item) as RNCharger
      );
      callback(chargers);
    }
  );
  if (Platform.OS === 'ios') {
    HeychargeSdk.initializeChargers(propertyId);
    HeychargeSdk.observeChargers();
  } else {
    HeychargeSdk.observeChargers(propertyId, callback);
  }
  return eventListener;
}

export function removeChargersObserver(
  callback: (chargers: RNCharger[]) => void
) {
  if (Platform.OS === 'ios') {
    HeychargeSdk.removeChargersObserver();
  } else {
    HeychargeSdk.removeChargersObserver(callback);
  }
}

export function observeSessionsFromDate(
  startDateInMillis: Date,
  callback: (sessions: Session[]) => void
): EmitterSubscription {
  const eventEmitter = new NativeEventEmitter(HeychargeSdk);
  const eventListener = eventEmitter.addListener(
    sessionsChannel,
    (sessionsJson) => {
      const sessions: Session[] = sessionsJson.map(
        (item: string) => JSON.parse(item) as Session
      );
      callback(sessions);
    }
  );
  HeychargeSdk.observeSessionsFromDate(startDateInMillis.getTime(), callback);
  return eventListener;
}

export function removeSessionsObserver(
  callback: (sessions: Session[]) => void
) {
  if (Platform.OS === 'ios') {
    HeychargeSdk.removeSessionsObserver();
  } else {
    HeychargeSdk.removeSessionsObserver(callback);
  }
}

export function startCharging(charger: Charger): Promise<null> {
  const formattedJson = JSON.stringify(charger);
  return HeychargeSdk.startCharging(formattedJson);
}

export function stopCharging(charger: Charger): Promise<null> {
  const formattedJson = JSON.stringify(charger);
  return HeychargeSdk.stopCharging(formattedJson);
}

export function startOnboarding(charger: Charger): Promise<null> {
  const formattedJson = JSON.stringify(charger);
  return HeychargeSdk.startOnboarding(formattedJson);
}

export function startOtaUpdate(
  charger: Charger,
  onError: (error: string) => void,
  onProgress: (progress: number) => void,
  onUpdateFinished: () => void
) {
  const formattedJson = JSON.stringify(charger);
  const eventEmitter = new NativeEventEmitter(HeychargeSdk);
  const eventListener = eventEmitter.addListener(otaChannel, (otaProgress) => {
    onProgress(otaProgress);
  });
  HeychargeSdk.startOtaUpdate(formattedJson, onError, onUpdateFinished);
  return eventListener;
}

export * from './interfaces';
