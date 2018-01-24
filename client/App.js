import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import Project from './src/components/project/project';

export default class App extends React.Component {
  componentDidMount() {
    StatusBar.setHidden(true);
  }

  render() {
    return (
      <Project></Project>
    );
  }
}
