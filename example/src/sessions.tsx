import React, { Component } from 'react';

import {
  View,
  Text,
  FlatList,
  EmitterSubscription,
  Button,
} from 'react-native';
import * as HeyCharge from '@heycharge/heycharge-react-native-sdk';
import DatePicker from 'react-native-date-picker';
import Card from './card'
import type { Session } from '@heycharge/heycharge-react-native-sdk';

class SessionsScreen extends Component {
  state = { sessions: [], showPicker: false, period: new Date() };
  private eventListener: EmitterSubscription | null = null;

  private callback = (sessions: Session[]) => {
    this.setState({ sessions: sessions });
  }

  componentDidMount() {
    const currentDate = this.state.period;
    const dateToStartFrom = new Date(currentDate.setDate(currentDate.getDate() - 7));
    this.setState({ period: dateToStartFrom });
    this.showSessionsFromStateDate(dateToStartFrom);
  }

  private showSessionsFromStateDate(dateToStartFrom: Date) {
    this.eventListener?.remove();
    this.eventListener = HeyCharge.observeSessionsFromDate(dateToStartFrom, this.callback);
  }

  componentWillUnmount() {
    HeyCharge.removeSessionsObserver(this.callback);
    this.eventListener?.remove();
  }

  render() {
    return (
      <View>
        <Button
          title="Pick date"
          onPress={() => {
            this.setState({ showPicker: true });
          }} />
        <DatePicker
          modal
          open={this.state.showPicker}
          date={this.state.period}
          onConfirm={(date) => {
            this.showSessionsFromStateDate(date);
            this.setState({ showPicker: false, period: date });
          }}
          onCancel={() => {
            this.setState({ showPicker: false });
          }} />
        <Text>Show sessions from {this.state.period.toLocaleString()}</Text>
        <FlatList data={this.state.sessions} renderItem={({ item }) => <SessionView sessionItem={item} />} />
      </View>
    );
  }
}

export default SessionsScreen;

const SessionView = ({ sessionItem }) => {
  const session = sessionItem as Session;
  const charged = (session.chargeAmount / 1000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const endDate = new Date(session.endDate).toLocaleString();
  return <Card>
    <Text>{session.chargerName}</Text>
    <Text>{charged} kWh</Text>
    <Text>{endDate}</Text>
  </Card>

}
