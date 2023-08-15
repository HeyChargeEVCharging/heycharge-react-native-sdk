import { EmitterSubscription } from 'react-native';
import type { Charger, RNCharger, Session } from 'src/interfaces';
export declare function initialize(sdkKey: string): void;
export declare function setUserId(userId: string): void;
export declare function initializeChargers(propertyId: string): void;
export declare function getUserPropertiesCombined(): Promise<unknown>;
export declare function observeChargers(callback: (chargers: RNCharger[]) => void): EmitterSubscription;
export declare function removeChargersObserver(callback: (chargers: RNCharger[]) => void): void;
export declare function observeSessionsFromDate(startDateInMillis: Date, callback: (sessions: Session[]) => void): EmitterSubscription;
export declare function removeSessionsObserver(callback: (sessions: Session[]) => void): void;
export declare function startCharging(charger: Charger): Promise<null>;
export declare function stopCharging(charger: Charger): Promise<null>;
export declare function startOnboarding(charger: Charger): Promise<null>;
export declare function startOtaUpdate(charger: Charger, onError: (error: string) => void, onProgress: (progress: number) => void, onUpdateFinished: () => void): EmitterSubscription;
export * from './interfaces';
//# sourceMappingURL=index.d.ts.map