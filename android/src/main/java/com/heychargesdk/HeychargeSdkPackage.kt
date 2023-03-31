package com.heychargesdk

import android.os.Handler
import android.os.Looper
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager


class HeychargeSdkPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(HeychargeSdkModule(reactContext, Handler(Looper.getMainLooper())))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
