import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SampleBox from './sampleBox';

export default class TrackManager extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Track manager!!!!</Text>
      <SampleBox></SampleBox>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d9d9',
    height: '90%'
  },
});
