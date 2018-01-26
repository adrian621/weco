import React from 'react';
import {Button, StyleSheet, Text, View } from 'react-native';
import SocketIOClient from 'socket.io-client';

export default class serverTest extends React.Component {

  constructor(props) {
    super(props);

    this.onPressFunction = this.onPressFunction.bind(this);

    this.socket = SocketIOClient('http://10.0.2.2:3000');
  }

  onPressFunction() {
    this.socket.emit('new-track', {trackID: 1, projectID: 1});
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={this.onPressFunction}
          title="Press me!"
          color="#841584"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  }
});
