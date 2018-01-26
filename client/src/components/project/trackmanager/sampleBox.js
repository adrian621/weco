import React, {Component} from "React";
import {
    StyleSheet,
    View,
    PanResponder,
    Animated,
} from 'react-native';

export default class SampleBox extends Component {

constructor(){
    super();

    this.state = {
        pan: new Animated.ValueXY()
    };
}

componentWillMount(){
    // Add a listener for the delta value change
    this._val = { x:0, y:0 }
    this.state.pan.addListener((value) => this._val = value);

    // Initialize PanResponder with move handling
    this.panResponder = PanResponder.create({
        onMoveShouldSetResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,

        onPanResponderGrant: (e, gestureState) => {
            this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
            this.state.pan.setValue({ x:0, y:0})
        },

        /*
        onStartShouldSetPanResponder: (e, gesture) => true,
        */
        //pre
        onPanResponderMove: Animated.event([
        null, { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),
      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset();
        }
      // adjusting delta value
      //this.state.pan.setValue({ x:0, y:0})
    });
}
    render(){
        const panStyle = {
            transform: this.state.pan.getTranslateTransform()
        }
        return (
          <Animated.View
          {...this.panResponder.panHandlers}
          style={[panStyle, styles.sampleBox]}
          ><Animated.Text>oi</Animated.Text>
          </Animated.View>

        );

        }
    }


let styles = StyleSheet.create({
    sampleBox: {
        backgroundColor: "skyblue",
        width: '15%',
        height: '10%'
    }
})
