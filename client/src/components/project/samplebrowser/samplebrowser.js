import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class SampleBrowser extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Sample Browser!</Text>
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
