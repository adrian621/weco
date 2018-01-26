import React, {Component} from "React";
import {
    StyleSheet,
    View,
    PanResponder,
    Animated,
    TouchableWithoutFeedback
} from 'react-native';

export default class SampleBox extends Component {

  constructor(){
      super();
  }

  componentWillMount(){
  }

  onPressButton = () => {
    this.props.onMove(this.props.name);
  }

  render(){
    return (
      <TouchableWithoutFeedback onPressIn={this.onPressButton}>
        <View style={[styles.sampleBox]}>
          <Animated.Text style={styles.sampleText}>{this.props.name}</Animated.Text>
        </View>
      </TouchableWithoutFeedback>
    );

  }
}


let styles = StyleSheet.create({
  sampleBox: {
    backgroundColor: "skyblue",
    height: 20,
    borderRadius: 1,
    borderWidth:1,
    borderColor: 'black',
    marginBottom: 10
  },
  sampleText: {
    textAlign: 'center'
  }
})
