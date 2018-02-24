import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Project from './src/components/project/project';
import ServerTest from './src/components/project/serverTest';
import ProjectSelector from './src/components/project/projectSelector';

const RootStack = StackNavigator({
  Selector: {screen: ProjectSelector},
  Manager: {screen: Project},
  },
  {
    navigationOptions: {
      header: null
    }
  }
);

export default class App extends React.Component {
  componentDidMount() {
    StatusBar.setHidden(true);
  }

  render() {
    return (
      <RootStack />
    );
  }
}
