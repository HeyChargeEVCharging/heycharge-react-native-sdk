import React, { Component } from 'react';

import {
  View,
  Text,
  FlatList,
  Button,
  EmitterSubscription,
} from 'react-native';
import * as HeyCharge from 'heycharge-sdk';
import Card from './card';
import { type RNCharger, type Charger, ChargerState } from 'heycharge-sdk';

class AdminScreen extends Component {
  state = { chargers: [], otaProgress: 0 };
  private chargersEventListener: EmitterSubscription | null = null;
  private otaEventListener: EmitterSubscription | null = null;

  private callback = (chargers: RNCharger[]) => {
    this.setState({ chargers: chargers });
  };

  componentDidMount() {
    console.log('admin componentDidMount');
    this.chargersEventListener = HeyCharge.observeChargers(this.callback);
  }

  componentWillUnmount() {
    console.log('admin componentWillUnmount');
    this.chargersEventListener?.remove();
    this.otaEventListener?.remove();
    HeyCharge.removeChargersObserver(this.callback);
  }

  private startUpdate(charger: Charger) {
    this.setState({ otaProgress: 1 });
    this.otaEventListener = HeyCharge.startOtaUpdate(
      charger,
      (error) => {
        alert(error);
        this.setState({ otaProgress: 0 });
        this.otaEventListener?.remove();
      },
      (progress) => {
        this.setState({ otaProgress: progress });
      },
      () => {
        alert('Finished');
        this.setState({ otaProgress: 0 });
        this.otaEventListener?.remove();
      }
    );
  }

  render() {
    const progress = this.state.otaProgress;
    if (progress != 0) {
      return (
        <View>
          <Text>Progress: {progress}</Text>
        </View>
      );
    }
    return (
      <View>
        <FlatList
          data={this.state.chargers}
          renderItem={({ item }) => (
            <AdminChargerView
              chargerItem={item}
              onUpdatePressed={(charger: Charger) => this.startUpdate(charger)}
            />
          )}
        />
      </View>
    );
  }
}

export default AdminScreen;

const AdminChargerView = ({ chargerItem, onUpdatePressed }) => {
  async function onButtonPressed(
    charger: Charger,
    onboardingRequired: boolean,
    isChargerUpdateAvailable: boolean
  ) {
    if (!onboardingRequired && !isChargerUpdateAvailable) {
      return;
    }
    try {
      if (onboardingRequired) {
        await HeyCharge.startOnboarding(charger);
        return;
      }
      if (isChargerUpdateAvailable) {
        onUpdatePressed(charger);
      }
    } catch (err) {
      alert(err);
    }
  }

  const rnCharger = chargerItem as RNCharger;
  const charger = rnCharger.charger;
  const properties = rnCharger.properties;
  const status = charger.bluetoothState ?? ChargerState.UNKNOWN;
  const isChargerUpdateAvailable = properties.isChargerUpdateAvailable;
  const onboardingRequired = status == ChargerState.NOT_ONBOARDED;
  let buttonText = 'Complete Setup';
  let buttonVisible = false;
  if (onboardingRequired) {
    buttonVisible = true;
  } else if (isChargerUpdateAvailable) {
    buttonText = 'Update';
    buttonVisible = true;
  }
  let button;
  if (buttonVisible) {
    button = (
      <Button
        title={buttonText}
        onPress={() =>
          onButtonPressed(charger, onboardingRequired, isChargerUpdateAvailable)
        }
      />
    );
  }
  return (
    <Card>
      <Text>{charger.name}</Text>
      <Text>{charger.address}</Text>
      {button}
    </Card>
  );
};
