import * as React from 'react';

import { View, Button, TextInput, StyleSheet } from 'react-native';

function LoginScreen({ navigation }) {
  const [text, onChangeText] = React.useState("");
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
      />
      <Button
        title="Login"
        onPress={() => {
          if (text.trim().length != 0) {
            navigation.navigate('Home', { userId: text });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default LoginScreen;
