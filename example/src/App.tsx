import * as React from 'react';
import * as HeyCharge from 'heycharge-sdk';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './login';
import HomeScreen from './home';

// dev
const testSdkKey = 'hc_sdk_KTrCsT64MbSBECjDejVNVKgu35n9t99G';
// prod
// const testSdkKey = "hc_sdk_399zzFUHpP6E6IWGcbbnR4st"
const Stack = createNativeStackNavigator();

function App() {
  //on iOS, the SDK should be initialized from the AppDelegate in the iOS project.
  HeyCharge.initialize(testSdkKey);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
