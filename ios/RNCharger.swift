//
//  RNCharger.swift
//  HeychargeSdk
//
//  Created by Muhammad Mneimneh on 15.02.2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import ios_sdk

struct RNCharger: Codable {
    let charger: Charger
    let properties: RNChargerProperties
}

struct RNChargerProperties: Codable {
    let isAvailable: Bool
    let isChargingByUser: Bool
    let isChargingBusy: Bool
    let isChargerUpdateAvailable: Bool
}
