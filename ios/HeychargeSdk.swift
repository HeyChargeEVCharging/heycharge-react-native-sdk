import Foundation
import React
import ios_sdk
import Combine

@available(iOS 13.0, *)
@objc(HeychargeSdk)
class HeychargeSdk: RCTEventEmitter {
    
    private var chargersCancellable: AnyCancellable?
    private var sessionsCancellable: AnyCancellable?
    private let chargersChannel = "Chargers"
    private let sessionsChannel = "Sessions"
    private let otaChannel = "OTA"
    
    override init() {
        super.init()
        EventEmitter.shared.register(eventEmitter: self)
    }
        
    private func emit(eventName: String, body: Any? = nil) {
        EventEmitter.shared.emit(eventName: eventName, body: body)
    }

    @objc func initialize(_ sdkKey: String) -> Void {
        HeyChargeSDK.initialize(sdkKey: sdkKey)
    }
    
    @objc func setUserId(_ userId: String) -> Void {
        HeyChargeSDK.setUserId(userId: userId)
    }
    
    @objc func initializeChargers(_ propertyId: String) -> Void {
        HeyChargeSDK.chargers().initializeChargers(propertyId: propertyId)
    }
    
    @objc func getUserProperties(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            guard let userProperties = await HeyChargeSDK.chargers().getUserProperties() else {
                let error = NSError(domain: "heycharge-sdk", code: 0, userInfo: nil)
                reject("USER_PROPERTIES_ERROR", "Error fetching user properties", error)
                return
            }
            var rnProperties : [String] = []
            let encoder = JSONEncoder()
            encoder.outputFormatting = .prettyPrinted
            
            for property in userProperties {
                let rnProperty = RNProperty(id: property.id, name: property.name)
                do {
                    let jsonData = try encoder.encode(rnProperty)
                    let jsonString = String(data: jsonData, encoding: .utf8)
                    if let jsonString = jsonString {
                        rnProperties.append(jsonString)
                    }
                } catch {
                    print("Failed to encode property to JSON: \(error)")
                }
            }
            resolve(rnProperties);
        }
    }
    
    @objc func observeChargers() {
        let sdk = HeyChargeSDK.chargers()
        if(chargersCancellable == nil) {
            chargersCancellable = sdk.observeChargers(receiveCompletion: { result in
                switch result {
                    case .failure(let error): fatalError("an error has occured: \(error.localizedDescription)")
                    case .finished: print("finished called.")
                }
            }, receiveValue: { chargers in
                var rnChargers: [String] = []
                for charger in chargers {
                    let chargerProperties = RNChargerProperties(
                        isAvailable: sdk.isChargerAvailable(charger: charger),
                        isChargingByUser: sdk.isChargingByUser(charger: charger),
                        isChargingBusy: sdk.isChargerBusy(charger: charger),
                        isChargerUpdateAvailable: sdk.isChargerUpdateAvailable(charger: charger)
                    )
                    let rnCharger = RNCharger(charger: charger, properties: chargerProperties)
                    
                    let encoder = JSONEncoder()
                    encoder.outputFormatting = .prettyPrinted
                    
                    do {
                        let jsonData = try encoder.encode(rnCharger)
                        let jsonString = String(data: jsonData, encoding: .utf8)
                        if let jsonString = jsonString {
                            //TODO: remove after fixing in iOS SDK
                            let modifiedJsonString = jsonString.replacingOccurrences(of: "bluetoothStatus", with: "bluetoothState")
                            rnChargers.append(modifiedJsonString)
                        }
                    } catch {
                        print("Failed to encode charger to JSON: \(error)")
                    }
                }
                self.emit(eventName: self.chargersChannel, body: rnChargers)
            })
        }
    }
    
    @objc func removeChargersObserver() {
        chargersCancellable?.cancel()
    }
    
    @objc func observeSessionsFromDate(_ startDateInMillis: NSNumber, callback: @escaping RCTResponseSenderBlock) {
        let sdk = HeyChargeSDK.sessions()
        sessionsCancellable?.cancel()
        sessionsCancellable = sdk.observeSessions(startDateInMillis:Int(truncating: startDateInMillis), receiveCompletion: { result in
            switch result {
            case .failure(let error): fatalError(error.localizedDescription)
            case .finished: print("finished called.")
            }
        }, receiveValue: { sessions in
            var rnSessions: [String] = []
            for session in sessions {
                let encoder = JSONEncoder()
                encoder.outputFormatting = .prettyPrinted
                
                do {
                    let jsonData = try encoder.encode(session)
                    let jsonString = String(data: jsonData, encoding: .utf8)
                    if let jsonString = jsonString {
                        rnSessions.append(jsonString)
                    }
                } catch {
                    print("Failed to encode charger to JSON: \(error)")
                }
            }
            self.emit(eventName: self.sessionsChannel, body: rnSessions)
        })
    }
    
    @objc func removeSessionsObserver() {
        sessionsCancellable?.cancel()
    }
    
    @objc func startCharging(_ chargerJson: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        //TODO: remove after fixing in iOS SDK
        let modifiedJsonString = chargerJson.replacingOccurrences(of: "bluetoothState", with: "bluetoothStatus")
        guard let charger = self.getChargerFromJson(chargerJson: modifiedJsonString) else {
            let error = NSError(domain: "StartChargingError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid JSON"])
            reject("StartChargingError", "Failed to decode JSON", error)
            return
        }
        HeyChargeSDK.chargers().startCharging(charger: charger) {
            resolve(nil)
        } onChargingCommandFailure: { SDKError in
            reject("StartChargingError", "Charging command failure", SDKError)
        }
    }
    
    @objc func stopCharging(_ chargerJson: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        //TODO: remove after fixing in iOS SDK
        let modifiedJsonString = chargerJson.replacingOccurrences(of: "bluetoothState", with: "bluetoothStatus")
        guard let charger = self.getChargerFromJson(chargerJson: modifiedJsonString) else {
            let error = NSError(domain: "StopChargingError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid JSON"])
            reject("StopChargingError", "Failed to decode JSON", error)
            return
        }
        HeyChargeSDK.chargers().stopCharging(charger: charger) {
            resolve(nil)
        } onChargingCommandFailure: { SDKError in
            reject("StopChargingError", "Charging command failure", SDKError)
        }
    }
    
    @objc func startOnboarding(_ chargerJson: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        //TODO: remove after fixing in iOS SDK
        let modifiedJsonString = chargerJson.replacingOccurrences(of: "bluetoothState", with: "bluetoothStatus")
        guard let charger = self.getChargerFromJson(chargerJson: modifiedJsonString) else {
            let error = NSError(domain: "StartOnboardingError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid JSON"])
            reject("StartOnboardingError", "Failed to decode JSON", error)
            return
        }
        HeyChargeSDK.chargers().startOnboarding(charger: charger) {
            resolve(nil)
        } onChargingCommandFailure: { SDKError in
            reject("StarOnboardingError", "Charging command failure", SDKError)
        }
    }
    
    @objc func startOtaUpdate(_ chargerJson: String, onError: @escaping RCTResponseSenderBlock, onUpdateFinished: @escaping RCTResponseSenderBlock) {
        //TODO: remove after fixing in iOS SDK
        let modifiedJsonString = chargerJson.replacingOccurrences(of: "bluetoothState", with: "bluetoothStatus")
        guard let charger = self.getChargerFromJson(chargerJson: modifiedJsonString) else {
            let error = NSError(domain: "startOtaUpdateError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid JSON"])
            onError([error.localizedDescription])
            return
        }
        HeyChargeSDK.chargers().startOtaUpdate(charger: charger) { SDKError in
            onError([SDKError.localizedDescription])
        } otaCallbackOnUpdateFinished: {
            onUpdateFinished([])
        } otaCallbackOnProgressUpdated: { progress in
            self.sendEvent(withName: self.otaChannel, body: progress)
        }
    }
    
    override func supportedEvents() -> [String]! {
        return [chargersChannel, sessionsChannel, otaChannel]
    }
    
    private func getChargerFromJson(chargerJson: String) -> Charger? {
        guard let jsonData = chargerJson.data(using: .utf8) else {
            return nil
        }
        do {
            let decoder = JSONDecoder()
            let charger = try decoder.decode(Charger.self, from: jsonData)
            return charger
        } catch let error {
            print("Failed to decode charger from JSON", error)
            return nil
        }
    }
}
