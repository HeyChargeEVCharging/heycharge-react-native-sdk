package com.heychargesdk

import android.os.Handler
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import com.heycharge.androidsdk.core.HeyChargeSDK
import com.heycharge.androidsdk.data.ChargingCommandCallback
import com.heycharge.androidsdk.data.GetDataCallback
import com.heycharge.androidsdk.data.OTACallback
import com.heycharge.androidsdk.domain.Charger
import com.heycharge.androidsdk.domain.Property
import com.heycharge.androidsdk.domain.Session
import com.heycharge.androidsdk.domain.enums.HeyChargeRegion

class HeychargeSdkModule(
  private val reactContext: ReactApplicationContext,
  private val ui: Handler
) :
  ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

  private val rnChargersGson = Gson()
  private val sessionsGson = Gson()
  private val propertiesGson = Gson()
  private val chargersEventName = "Chargers"
  private val sessionsEventName = "Sessions"
  private val otaEventName = "OTA"

  private val chargersCallbacks = mutableMapOf<Callback, GetDataCallback<List<Charger>>>()
  private val sessionsCallbacks = mutableMapOf<Callback, GetDataCallback<List<Session>>>()

  override fun getName(): String {
    return NAME
  }

  private fun sendOTAEvent(reactContext: ReactContext, otaProgress: Int) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(otaEventName, otaProgress)
  }

  private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableArray) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  override fun onHostResume() {
    HeyChargeSDK.onResume()
  }

  override fun onHostPause() {
    HeyChargeSDK.onPause()
  }

  override fun onHostDestroy() {

  }

  @ReactMethod
  fun addListener(eventName: String) {
  }

  @ReactMethod
  fun removeListeners(count: Int) {
  }

  @ReactMethod
  fun initialize(sdkKey: String,regionEnumValue: Int) {
    val region = HeyChargeRegion.EU.parse(regionEnumValue)
    HeyChargeSDK.initialize(reactApplicationContext, sdkKey,region)
    reactApplicationContext.addLifecycleEventListener(this)
  }

  @ReactMethod
  fun setUserId(userId: String) {
    ui.post {
      HeyChargeSDK.setUserId(userId)
    }
  }

  @ReactMethod
  fun getUserProperties(promise: Promise) {
    ui.post {
      val propertiesCallback = object : GetDataCallback<List<Property>?> {
        override fun onGetDataFailure(exception: Exception) {
          promise.reject(exception)
        }

        override fun onGetDataSuccess(data: List<Property>?) {
          val array = Arguments.createArray()
          if (data != null) {
            for (prop in data) {
                  val rnPropertyJson = propertiesGson.toJson(prop, Property::class.java)
                  array.pushString(rnPropertyJson)
            }
            promise.resolve(array)
          } else {
            promise.reject(Exception("Could not fetch properties"))
          }
        }
      }
      HeyChargeSDK.chargers().getUserProperties(propertiesCallback)
    }
  }

  @ReactMethod
  fun observeChargers(propertyId: String, callback: Callback) {
    ui.post {
      removeChargersObserverInternal(callback)
      val chargersCallback = object : GetDataCallback<List<Charger>> {
        override fun onGetDataFailure(exception: Exception) {
        }

        override fun onGetDataSuccess(data: List<Charger>) {
          val sdk = HeyChargeSDK.chargers()
          val array = Arguments.createArray()
          for (charger in data) {
            val chargerProperties = RNChargerProperties(
              sdk.isChargerAvailable(charger),
              sdk.isChargingByUser(charger),
              sdk.isChargerBusy(charger), sdk.isChargerUpdateAvailable(charger)
            )
            val rnCharger = RNCharger(charger, chargerProperties)
            val rnChargerJson = rnChargersGson.toJson(rnCharger, RNCharger::class.java)
            array.pushString(rnChargerJson)
          }
          sendEvent(reactContext, chargersEventName, array)
        }
      }
      chargersCallbacks[callback] = chargersCallback
      HeyChargeSDK.chargers().observeChargers(propertyId,chargersCallback)
    }
  }

  private fun removeChargersObserverInternal(callback: Callback) {
    val existingChargersCallback = chargersCallbacks[callback]
    if (existingChargersCallback != null) {
      HeyChargeSDK.chargers().removeChargersObserver(existingChargersCallback)
      chargersCallbacks.remove(callback)
    }
  }

  @ReactMethod
  fun removeChargersObserver(callback: Callback) {
    ui.post {
      removeChargersObserverInternal(callback)
    }
  }

  @ReactMethod
  fun observeSessionsFromDate(startDateMillis: Double, callback: Callback) {
    ui.post {
      removeSessionsObserverInternal(callback)
      val sessionsCallback = object : GetDataCallback<List<Session>> {
        override fun onGetDataFailure(exception: Exception) {
        }

        override fun onGetDataSuccess(data: List<Session>) {
          val array = Arguments.createArray()
          for (session in data) {
            val sessionJson = sessionsGson.toJson(session, Session::class.java)
            array.pushString(sessionJson)
          }
          sendEvent(reactContext, sessionsEventName, array)
        }
      }
      sessionsCallbacks[callback] = sessionsCallback
      HeyChargeSDK.sessions().observeSessionsFromDate(
        startDateMillis.toLong(),
        sessionsCallback
      )
    }
  }

  private fun removeSessionsObserverInternal(callback: Callback) {
    val existingCallback = sessionsCallbacks[callback]
    if (existingCallback != null) {
      HeyChargeSDK.sessions().removeSessionsObserver(existingCallback)
      sessionsCallbacks.remove(callback)
    }
  }

  @ReactMethod
  fun removeSessionsObserver(callback: Callback) {
    ui.post {
      removeSessionsObserverInternal(callback)
    }
  }

  @ReactMethod
  fun isChargingByUser(chargerJson: String, promise: Promise) {
    val charger = ensureChargerJsonIsValid(chargerJson, promise) ?: return
    val isChargingByUser = HeyChargeSDK.chargers().isChargingByUser(charger)
    promise.resolve(isChargingByUser)
  }

  @ReactMethod
  fun startOnboarding(chargerJson: String, promise: Promise) {
    val charger = ensureChargerJsonIsValid(chargerJson, promise) ?: return
    HeyChargeSDK.chargers().startOnboarding(charger, object : ChargingCommandCallback {
      override fun onChargingCommandExecuted() {
        promise.resolve(null)
      }

      override fun onChargingCommandFailure(exception: java.lang.Exception) {
        promise.reject(exception)
      }
    })
  }

  @ReactMethod
  fun startCharging(chargerJson: String, promise: Promise) {
    val charger = ensureChargerJsonIsValid(chargerJson, promise) ?: return
    HeyChargeSDK.chargers().startCharging(charger, object : ChargingCommandCallback {
      override fun onChargingCommandExecuted() {
        promise.resolve(null)
      }

      override fun onChargingCommandFailure(exception: java.lang.Exception) {
        promise.reject(exception)
      }
    })
  }

  @ReactMethod
  fun stopCharging(chargerJson: String, promise: Promise) {
    val charger = ensureChargerJsonIsValid(chargerJson, promise) ?: return
    HeyChargeSDK.chargers().stopCharging(charger, object : ChargingCommandCallback {
      override fun onChargingCommandExecuted() {
        promise.resolve(null)
      }

      override fun onChargingCommandFailure(exception: java.lang.Exception) {
        promise.reject(exception)
      }
    })
  }


  @ReactMethod
  fun startOtaUpdate(chargerJson: String, onError: Callback, onUpdateFinished: Callback) {
    val charger = ensureChargerJsonIsValid(chargerJson, onError) ?: return
    HeyChargeSDK.chargers().startOtaUpdate(charger, object : OTACallback {
      override fun onError(e: java.lang.Exception) {
        onError.invoke(e.toString())
      }

      override fun onProgressUpdated(progress: Int) {
        sendOTAEvent(reactContext, progress)
      }

      override fun onUpdateFinished() {
        onUpdateFinished.invoke()
      }
    })
  }

  private fun ensureChargerJsonIsValid(chargerJson: String, promise: Promise): Charger? {
    val charger = Charger.fromJson(chargerJson)
    if (charger == null) {
      promise.reject(Exception("Something went wrong."))
      return null
    }
    return charger
  }

  private fun ensureChargerJsonIsValid(chargerJson: String, callback: Callback): Charger? {
    val charger = Charger.fromJson(chargerJson)
    if (charger == null) {
      callback.invoke("Something went wrong.")
      return null
    }
    return charger
  }

  companion object {
    const val NAME = "HeychargeSdk"
  }
}
