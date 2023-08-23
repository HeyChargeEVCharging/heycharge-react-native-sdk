import React, { Component } from 'react';
import {
  Text,
  FlatList,
  EmitterSubscription,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Card from './card';
import * as HeyCharge from '@heycharge/heycharge-react-native-sdk';
import {
  type RNCharger,
  type RNProperty,
  type Charger,
  ChargerState,
} from '@heycharge/heycharge-react-native-sdk';

class ChargersScreen extends Component {
  state = {
    chargers: [],
    isLoading: true,
    userProperties: [] as RNProperty[],
    selectedProperty: '',
  };
  private chargersEventListener: EmitterSubscription | null = null;

  private chargersCallback = (chargers: RNCharger[]) => {
    this.setState({ chargers: chargers, isLoading: false });
  };

  async componentDidMount() {
    const fetchedUserProperties = await HeyCharge.getUserProperties();

    if (fetchedUserProperties == null) {
      return;
    }

    const userPropertiesList = fetchedUserProperties as RNProperty[];

    if (userPropertiesList.length > 0) {
      const defaultSelectedProperty = userPropertiesList[0]!.id;

      this.setState({
        userProperties: userPropertiesList,
        selectedProperty: defaultSelectedProperty,
      });

      this.setSelectedProperty(defaultSelectedProperty);
    }
  }

  componentWillUnmount() {
    HeyCharge.removeChargersObserver(this.chargersCallback);
    this.chargersEventListener?.remove();
  }

  setSelectedProperty(itemValue: string) {
    this.setState({ selectedProperty: itemValue });
    this.chargersEventListener = HeyCharge.observeChargers(
      itemValue,
      this.chargersCallback
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.userProperties.length > 0 ? (
          <Picker
            selectedValue={this.state.selectedProperty}
            onValueChange={(itemValue) => this.setSelectedProperty(itemValue)}
          >
            {this.state.userProperties.map((property) => (
              <Picker.Item
                key={property.id}
                label={property.name}
                value={property.id}
              />
            ))}
          </Picker>
        ) : (
          <Text>Fetching user properties...</Text>
        )}

        {this.state.isLoading ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size="large" color="blue" />
          </View>
        ) : this.state.chargers.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text>No chargers have been assigned to this property....</Text>
          </View>
        ) : (
          <FlatList
            data={this.state.chargers}
            renderItem={({ item }) => <ChargerView chargerItem={item} />}
          />
        )}
      </View>
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
