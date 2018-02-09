import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native';

export default class newTrackButton extends Component {

    handleLayout = (e)=>{
      this.props.onLayout(e.nativeEvent.layout.height);
    }

    render() {
      return (
        <View onLayout={this.handleLayout} style = {styles.container}>
          <Button
          onPress={this.props.OnNewTrack}
          title="Add track"
          color="gray"
          accessibilityLabel="Learn more about this purple button"
          />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '10%',
    marginBottom:0

  },
});
