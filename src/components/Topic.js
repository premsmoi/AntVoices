import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { getMMSSFromMillis } from '../utilities/TimeUtils'

export default class Topic extends React.Component {

  constructor(props) {
    super(props);
    this.sound = null;
    this.description = props.description;
    this.soundDuration = props.soundDuration;
    this.state = {
      soundPosition: null,
    };
    
  }

  render() {
    return(
      <View style={styles.recordContainer}>
        <Text style={styles.recordText}>{this.description}</Text>
        <Text style={styles.recordText}>{getMMSSFromMillis(this.soundDuration)}</Text>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  recordContainer: {
    flexDirection: 'row',
    backgroundColor: '#000',
    justifyContent: 'center',
    padding: 10,
  },
  recordText: {
    fontSize: 16,
    color: "#fff",
    padding: 5,
    borderWidth: 1, // For Test
    borderColor: '#fff', // For Test
  },
});