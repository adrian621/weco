import React from 'react';
import {StyleSheet, Text, View } from 'react-native';
import SampleBrowser from './samplebrowser/samplebrowser';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <SampleBrowser></SampleBrowser>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
