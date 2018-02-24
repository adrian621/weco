import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import Project from './src/components/project/project';
import ServerTest from './src/components/project/serverTest';
import ProjectSelector from './src/components/project/projectSelector';

export default class App extends React.Component {
  componentDidMount() {
    StatusBar.setHidden(true);
  }

  render() {
    return (
      <ProjectSelector></ProjectSelector>
    );
  }
}
