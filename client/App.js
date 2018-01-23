import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import SampleBrowser from './src/components/samplebrowser';

export default class App extends React.Component {
  componentDidMount() {
    StatusBar.setHidden(true);
  }

  render() {
    return (
      <View style={styles.container}>
        <SampleBrowser>eyyy</SampleBrowser>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
