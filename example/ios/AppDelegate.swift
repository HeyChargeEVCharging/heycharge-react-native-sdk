//
//  AppDelegate.swift
//  HeychargeSdkExample
//
//  Created by Muhammad Mneimneh on 14.02.2023.
//

import Foundation
import UIKit
import ios_sdk

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var bridge: RCTBridge!
  
  //dev
  // private let testSdkKey = "hc_sdk_KTrCsT64MbSBECjDejVNVKgu35n9t99G"
  //prod
  private let testSdkKey = "hc_sdk_399zzFUHpP6E6IWGcbbnR4st"

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let jsCodeLocation: URL
    jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "HeychargeSdkExample", initialProperties: nil, launchOptions: launchOptions)
    let rootViewController = UIViewController()
    rootViewController.view = rootView

    self.window = UIWindow(frame: UIScreen.main.bounds)
    self.window?.rootViewController = rootViewController
    self.window?.makeKeyAndVisible()
    
    //initializing HeyChargeSDK
    HeyChargeSDK.initialize(sdkKey: testSdkKey)

    return true
  }

  func applicationWillEnterForeground(_ application: UIApplication) {
    print("App will enter foregroundApp will enter foreground")
    HeyChargeSDK.applicationWillEnterForeground()
  }

  func applicationDidEnterBackground(_ application: UIApplication) {
    print("App did enter background")
    HeyChargeSDK.applicationDidEnterBackground()
  }
}
