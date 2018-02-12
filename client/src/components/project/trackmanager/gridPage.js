import React, {Component} from "React";
import { StyleSheet, View, Text} from 'react-native';

export default class GridPage extends Component {

  constructor(props){
      super(props);
      this.state = {
          id: this.props.id,
          samples: [],
      };
  }

  componentWillReceiveProps(nextProps){
    this.setState({samples: nextProps.samples});
  }

  render(){
    return (
      <View style={styles.container}>
        <View style={styles.sampleBox}><Text>{this.state.samples[0]}</Text></View>
        <View style={styles.sampleBox}><Text>{this.state.samples[1]}</Text></View>
        <View style={styles.sampleBox}><Text>{this.state.samples[2]}</Text></View>
        <View style={styles.sampleBox}><Text>{this.state.samples[3]}</Text></View>
      </View>
    );
  }
}


let styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  },
  sampleBox: {
    flex: 1,
    backgroundColor: "#d9d9d9",
    borderWidth:1,
    borderColor:'black',
    height: '100%'
  },
  sampleText: {
    textAlign: 'center'
  }
})
