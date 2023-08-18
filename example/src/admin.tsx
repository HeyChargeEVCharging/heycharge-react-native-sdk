import React, { Component } from 'react';

import {
  View,
  Text,
  FlatList,
  Button,
  EmitterSubscription,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as HeyCharge from '@heycharge/heycharge-react-native-sdk';
import Card from './card';
import {
  type RNCharger,
  type Charger,
  ChargerState,
} from '@heycharge/heycharge-react-native-sdk';

class AdminScreen extends Component {
  state = {
    chargers: [],
    userProperties: [] as { id: string; name: string }[],
    selectedProperty: '',
    otaProgress: 0,
  };
  private chargersEventListener: EmitterSubscription | null = null;
  private otaEventListener: EmitterSubscription | null = null;

  private callback = (chargers: RNCharger[]) => {
    this.setState({ chargers: chargers });
  };

  parseUserProperties(userPropertiesString: string) {
    try {
      const parsedResult = JSON.parse(userPropertiesString);

      const userProperties = Object.entries(parsedResult).map(([id, name]) => ({
        id,
        name,
      }));
      return userProperties;
    } catch (error) {
      console.log('Error parsing JSON:', error);
      return null;
    }
  }

  async componentDidMount() {
    const userPropertiesString = await HeyCharge.getUserPropertiesCombined();
    const parsedPropertiesDict = this.parseUserProperties(
      userPropertiesString as string
    );

    if (parsedPropertiesDict != null) {
      const defaultSelectedProperty =
        parsedPropertiesDict.length > 0 ? parsedPropertiesDict[0]!.id : '';

      this.setState({
        userProperties: parsedPropertiesDict,
        selectedProperty: defaultSelectedProperty,
      });

      this.setSelectedProperty(defaultSelectedProperty);
    }
  }
  setSelectedProperty(itemValue: string) {
    this.setState({ selectedProperty: itemValue });
    this.chargersEventListener = HeyCharge.observeChargers(
      itemValue,
      this.callback
    );
  }
  componentWillUnmount() {
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
      <View style={{ flex: 1 }}>
        <Picker
          selectedValue={this.state.selectedProperty}
          onValueChange={(itemValue) => this.setSelectedProperty(itemValue)}
        >
          <Picker.Item />
          {this.state.userProperties.map((property) => (
            <Picker.Item
              key={property.id}
              label={property.name}
              value={property.id}
            />
          ))}
        </Picker>
        {this.state.chargers.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text>No chargers have been assigned to this property....</Text>
          </View>
        ) : (
          <FlatList
            data={this.state.chargers}
            renderItem={({ item }) => (
              <AdminChargerView
                chargerItem={item}
                onUpdatePressed={(charger: Charger) =>
                  this.startUpdate(charger)
                }
              />
            )}
          />
        )}
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
