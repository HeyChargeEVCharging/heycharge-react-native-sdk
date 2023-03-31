//
//  HeychargeSdk.m
//  HeychargeSdk
//
//  Created by Muhammad Mneimneh on 10.02.2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(HeychargeSdk, RCTEventEmitter)

RCT_EXTERN_METHOD(initialize:(NSString *)sdkKey)
RCT_EXTERN_METHOD(setUserId:(NSString *)userId)
RCT_EXTERN_METHOD(observeChargers)
RCT_EXTERN_METHOD(removeChargersObserver)
RCT_EXTERN_METHOD(observeSessionsFromDate:(nonnull NSNumber *)startDateInMillis callback:(nonnull RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(removeSessionsObserver)
RCT_EXTERN_METHOD(startCharging:(NSString *)chargerJson resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopCharging:(NSString *)chargerJson resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(startOnboarding:(NSString *)chargerJson resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(startOtaUpdate:(NSString *)chargerJson onError:(RCTResponseSenderBlock)onError onUpdateFinished:(RCTResponseSenderBlock)onUpdateFinished)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
