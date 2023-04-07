import React, { Component } from 'react';
import {
  Text,
  FlatList,
  Button,
  EmitterSubscription,
  Platform,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from 'react-native';
import Card from './card';
import * as HeyCharge from '@HeyChargeEVCharging/heycharge-react-native-sdk';
import {
  type RNCharger,
  type Charger,
  ChargerState,
} from '@HeyChargeEVCharging/heycharge-react-native-sdk';

class ChargersScreen extends Component {
  state = {
    chargers: [],
    isLoading: true,
  };
  private chargersEventListener: EmitterSubscription | null = null;

  private chargersCallback = (chargers: RNCharger[]) => {
    this.setState({ chargers: chargers, isLoading: false });
  };

  componentDidMount() {
    this.chargersEventListener = HeyCharge.observeChargers(
      this.chargersCallback
    );
  }

  componentWillUnmount() {
    HeyCharge.removeChargersObserver(this.chargersCallback);
    this.chargersEventListener?.remove();
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="blue" />
        </View>
      );
    }

    return (
      <FlatList
        data={this.state.chargers}
        renderItem={({ item }) => <ChargerView chargerItem={item} />}
      />
    );
  }
}

export default ChargersScreen;

const ChargerView = ({ chargerItem }) => {
  async function onChargingButtonPress(
    charger: Charger,
    isAvailable: boolean,
    isChargingByUser: boolean,
    onboardingRequired: boolean
  ) {
    if (!isAvailable && !isChargingByUser) {
      return;
    }
    try {
      if (isAvailable) {
        await HeyCharge.startCharging(charger);
      } else {
        await HeyCharge.stopCharging(charger);
      }
    } catch (err) {
      alert(err);
    }
  }

  const rnCharger = chargerItem as RNCharger;
  const charger = rnCharger.charger;
  const properties = rnCharger.properties;
  const isAvailable = properties.isAvailable;
  const isChargingByUser = properties.isChargingByUser;
  const isChargerBusy = properties.isChargerBusy;
  const status = charger.bluetoothState ?? ChargerState.UNKNOWN;
  const onboardingRequired = status == ChargerState.NOT_ONBOARDED;
  let buttonText = 'Not available';
  let buttonDisabled = true;
  let statusText = 'Not in range';
  if (isAvailable) {
    buttonText = 'Start charging';
    statusText = 'Available';
    buttonDisabled = false;
  }
  if (isChargerBusy) {
    statusText = 'In use';
  }
  if (isChargingByUser) {
    buttonText = 'Stop charging';
    statusText = 'In use - self';
    buttonDisabled = false;
  }
  return (
    <Card>
      <Text>{charger.name}</Text>
      <Text>{charger.address}</Text>
      <Text>{statusText}</Text>
      <TouchableOpacity
        style={{
          backgroundColor: buttonDisabled ? '#D3D3D3' : '#007AFF',
          padding: 10,
          borderRadius: 5,
          alignSelf: 'flex-start',
          alignItems: 'center',
        }}
        disabled={buttonDisabled}
        onPress={() =>
          onChargingButtonPress(
            charger,
            isAvailable,
            isChargingByUser,
            onboardingRequired
          )
        }
      >
        <Text style={{ color: 'white' }}>{buttonText}</Text>
      </TouchableOpacity>
    </Card>
  );
};
