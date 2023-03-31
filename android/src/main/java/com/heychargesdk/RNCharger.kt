package com.heychargesdk

import com.heycharge.androidsdk.domain.Charger


data class RNCharger(val charger: Charger, val properties: RNChargerProperties)

data class RNChargerProperties(
  val isAvailable: Boolean,
  val isChargingByUser: Boolean,
  val isChargingBusy: Boolean,
  val isChargerUpdateAvailable: Boolean
)
