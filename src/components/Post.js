import React from 'react'
import { 
  StyleSheet, 
  Text, 
  View,
  Image,
  TouchableWithoutFeedback, 
  Button } from 'react-native'
import { getMMSSFromMillis } from '../utilities/TimeUtils'
import * as CommonStyle from '../styles/CommonStyle'
import { Icon } from 'native-base'
import AssetUtils from '../utilities/AssetUtils'
import { connect } from 'react-redux'
import Audio from '../utilities/AudioPlayer'

var antIcon, playIcon, pauseIcon

class Post extends React.Component {

  constructor(props) {
    super(props);
    this.filename = this.props.filename;
    this.summary = this.props.summary;
    this.soundDuration = this.props.duration;
    this.buttonUri = playIcon
    console.log('id: '+this.props.id)
  }

  /* componentWillMount() {
    antIcon = require('../../assets/ant.png')
    playIcon = require('../../assets/play.png')
    pauseIcon = require('../../assets/pause.png')
  } */

  /* createSoundFromBase64() {
    const soundDirectory = await FileSystem.documentDirectory + 'test.m4a'
    await FileSystem.writeAsStringAsync(soundDirectory, soundBase64, {
      encoding: FileSystem.EncodingType.Base64})
    
      const { sound, status } = await Audio.Sound.createAsync(
        {uri:soundDirectory},
        {isLooping: true},
        this.updateScreenForSoundStatus
      );
  } */

  onPlayPausePressed = () => {
    if (this.filename==this.props.playingAudioName) {
      if (this.props.isPlaying) {
        Audio.onPausePressed()
      } else {
        Audio.onPlayPressed(this.filename)
      }
    } else {
      Audio.onPlayPressed(this.filename)
    }
  }

  navigateToTopicScreen = () => {
    if (this.props.navigation == null)
      return
    const navParam = {
      audio: {
        id: this.props.id,
        filename: this.filename,
        summary: this.summary,
        duration: this.soundDuration
      }
    }
    this.props.navigation.navigate('Topic', navParam)
  }

  render() {
    return(
      <View style={styles.topicContainer}>
        <View style={CommonStyle.styles.outerIconContainer}>
          <View style={CommonStyle.styles.iconContainer}>
            <TouchableWithoutFeedback onPress={() => this.navigateToTopicScreen()}>
              <Image source={AssetUtils.instance.getAsset('ant')} 
                style = {{
                  width: 44,
                  height: 21,
                }}/>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View style={styles.detailContainer}>
          <View style={CommonStyle.styles.summaryContainer}>
            <Text style={styles.summaryText}>{this.summary}</Text>
          </View>
          <View style={CommonStyle.styles.soundStatusContainer}>
            <View style={CommonStyle.styles.buttonContainer}>
            <TouchableWithoutFeedback onPress={this.onPlayPausePressed}>
              <Image source={AssetUtils.instance.getAsset(
                (this.filename==this.props.playingAudioName && this.props.isPlaying) ?'pause':'play')}
                style = {{
                  width: 16,
                  height: 16,
                }}/>
            </TouchableWithoutFeedback>
          </View>
            <View style={CommonStyle.styles.durationContainer}>
              <Text style={styles.durationText}>
                {(this.filename==this.props.playingAudioName? getMMSSFromMillis(this.props.soundPosition) : getMMSSFromMillis(0))
                + '/'+getMMSSFromMillis(this.soundDuration)}
              </Text>
            </View>
          </View>
        </View>
        {/* <View style={CommonStyle.styles.buttonContainer}>
          <TouchableWithoutFeedback onPress={this.onPlayPausePressed}>
            <Image source={AssetUtils.instance.getAsset(
              (this.filename==this.props.playingAudioName && this.props.isPlaying) ?'pause':'play')}
              style = {{
                width: 48,
                height: 48,
              }}/>
          </TouchableWithoutFeedback>
        </View> */}
      </View>
    )
  }

}

const mapStateToProps = state => {
  return {
    isPlaying: state.isAudioPlaying,
    playingAudioName: state.playingAudioName,
    soundPosition: state.playingSoundPosition,
  }
}

export default connect(mapStateToProps)(Post)

const styles = StyleSheet.create({
  topicContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    ...CommonStyle.styleForTest,
  },
  detailContainer: {
    flex: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    ...CommonStyle.styleForTest,
  },
  summaryText: {
    fontSize: 16,
    color: "black",
    padding: 5,
    ...CommonStyle.styleForTest,
  },
  durationText: {
    fontSize: 12,
    color: "black",
    padding: 5,
    ...CommonStyle.styleForTest,
  },
});