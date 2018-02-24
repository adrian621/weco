import React from 'react';
import {StyleSheet,
        Text,
        View,
        PanResponder,
        Animated,
        FlatList,
        TouchableHighlight} from 'react-native';
import SocketIOClient from 'socket.io-client';

/* THIS IS A WORKING BUILD OF weco NOT ANYTHING SPECIAL! */

export default class App extends React.Component {
  constructor(){
      super();

      this.state = {
          socket: SocketIOClient('http://10.0.2.2:3000')
      };
  }

  goToNextScreen(key){
    alert(key);
  }

  render() {

    return (
      <View style={styles.container}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{'Weco! :)'}</Text>
        </View>
        <View style={styles.listContainer}>
          <FlatList
            data={[
              {key: 'Project 1'},
              {key: 'Project 2'},
              {key: 'Project 3'},
              {key: 'Project 4'},
              {key: 'Project 5'},
              {key: 'Project 6'},
              {key: 'Project 7'},
            ]}
            renderItem={({item}) => {
                return(
                  <TouchableHighlight onPress={() => this.goToNextScreen(item.key)}>
                    <View style={styles.itemContainer}>
                       <Text>{item.key}</Text>
                    </View>
                  </TouchableHighlight>
                )
              }
            }
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(216, 231, 255)',
  },

  listContainer: {
    width: '80%',
    height: '75%',
    borderColor: 'black',
    borderWidth: 1,
    alignSelf: 'center',
    backgroundColor: 'white'
  },

  itemContainer: {
    borderColor: 'black',
    borderWidth: 1,
    height: 100,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  logo: {
    width: '100%',
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
