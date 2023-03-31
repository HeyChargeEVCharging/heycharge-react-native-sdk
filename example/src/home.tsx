import * as React from 'react';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';
import {
  View,
  Text,
  Permission,
  PermissionsAndroid,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import * as HeyCharge from 'heycharge-sdk';
import ChargersScreen from './chargers';
import SessionsScreen from './sessions';
import AdminScreen from './admin';

const renderScene = SceneMap({
  chargers: ChargersScreen,
  sessions: SessionsScreen,
  admin: AdminScreen,
});

function HomeScreen({ route }) {
  const layout = useWindowDimensions();
  const { userId } = route.params;
  const [index, setIndex] = React.useState(0);
  const [permissionsGranted, setPermissionsGranted] = React.useState(false);
  const [routes] = React.useState([
    { key: 'chargers', title: 'Chargers' },
    { key: 'sessions', title: 'Sessions' },
    { key: 'admin', title: 'Admin' },
  ]);

  React.useEffect(() => {
    async function requestPermissions() {
      const permissions: Permission[] = [];

      if (Platform.OS === 'android') {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

        if (Platform.Version >= 31) {
          permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
          permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
        }

        try {
          const result = await PermissionsAndroid.requestMultiple(permissions);
          const androidPermissionsGranted =
            Platform.Version >= 31
              ? result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
                  PermissionsAndroid.RESULTS.GRANTED &&
                result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
                  PermissionsAndroid.RESULTS.GRANTED &&
                result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
                  PermissionsAndroid.RESULTS.GRANTED
              : result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
                PermissionsAndroid.RESULTS.GRANTED;

          if (androidPermissionsGranted) {
            HeyCharge.setUserId(userId);
            setPermissionsGranted(true);
          }
        } catch (err) {
          console.warn(err);
        }
      } else if (Platform.OS === 'ios') {
        try {
          var iosPermissionsGranted = false;
          const res = await check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
          if (res === RESULTS.GRANTED) {
            iosPermissionsGranted = true;
          } else if (res === RESULTS.DENIED) {
            const res2 = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
            res2 === RESULTS.GRANTED
              ? (iosPermissionsGranted = true)
              : (iosPermissionsGranted = false);
          }

          if (iosPermissionsGranted) {
            HeyCharge.setUserId(userId);
            setPermissionsGranted(true);
          }
        } catch (err) {
          console.warn(err);
        }
      }
    }

    requestPermissions();
  }, []);

  if (!permissionsGranted) {
    return (
      <View>
        <Text>Need permissions</Text>
      </View>
    );
  }

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}

export default HomeScreen;
