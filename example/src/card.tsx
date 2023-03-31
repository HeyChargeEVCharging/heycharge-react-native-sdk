import React from 'react';
import { View, StyleSheet } from 'react-native';
const Card = props => {
  return (
    <View style={{ ...styles.card }}>{props.children}</View>
  );
};
const styles = StyleSheet.create({
  card: {
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOpacity: 0.20,
    elevation: 8,
    padding: 20,
    borderRadius: 6
  }
});
export default Card;
