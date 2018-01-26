import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class Track extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style = {{textAlign: 'center'}}>this is track</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'blue',
    height: 50,
    width: '100%',
    marginBottom: 10
  },
});
