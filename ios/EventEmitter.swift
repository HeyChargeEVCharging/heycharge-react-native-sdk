//
//  EventEmitter.swift
//  heycharge-react-native-sdk
//
//  Created by Muhammad Mneimneh on 17.07.2023.
//

import Foundation

@available(iOS 13.0, *)
class EventEmitter {

    public static var shared = EventEmitter()

    private var eventEmitter: HeychargeSdk!

    func register(eventEmitter: HeychargeSdk) {
        self.eventEmitter = eventEmitter
    }

    func emit(eventName: String, body: Any?) {
        self.eventEmitter.sendEvent(withName: eventName, body: body)
    }
}
