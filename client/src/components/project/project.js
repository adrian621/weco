import React from 'react';
import {StyleSheet, Text, View } from 'react-native';
import SampleBrowser from './samplebrowser/samplebrowser';
import TrackManager from './trackmanager/trackmanager';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 2}}>
          <SampleBrowser></SampleBrowser>
        </View>
        <View style = {{flex: 0.01, backgroundColor: 'black'}}/>
          <View style = {{flex: 7}}>
            <TrackManager></TrackManager>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  }
});
