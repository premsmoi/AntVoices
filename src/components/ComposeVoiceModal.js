import React from 'react'
import { 
	StyleSheet, 
	Text,
  TextInput,
	View,
  BackHandler,
	TouchableWithoutFeedback } from 'react-native'
import { Icon } from 'native-base';
import * as CommonStyle from '../styles/CommonStyle'
import { getMMSSFromMillis } from '../utilities/TimeUtils'
import { connect } from 'react-redux'
import { closeComposeVoiceModal } from '../redux/actions'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as Font from 'expo-font'
import * as Permissions from 'expo-permissions'
/*import { FontAwesome, Ionicons } from '@expo/vector-icons'*/

class ComposeVoiceModal extends React.Component {

	constructor(props) {
    super(props)
    this.recording = null;
    this.sound = null;
    this.id = 0;

    this.state = {
      text: '',
      isRecording: false,
      isPlaying: false,
      isLoading: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
    }

    this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY))
  }

  componentWillUnmount() {
    this.props.draftStatus(false)
    this.clearRecord()
  }

  onPostVoice = () => {
  	this.props.closeVoiceModal()
    /* this.clearAllStates() */
  }

  async clearRecord() {
    try {
      await this.sound.unloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
  }

  async stopPlaybackAndBeginRecording() {
    console.log('Stop Playback and Start Recording')
    this.setState({isLoading: true})
    if (this.sound !== null) {
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this.updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this.updateScreenForRecordingStatus to update the screen.
    this.setState({isLoading: false})
  }

  async stopRecordingAndEnablePlayback() {
    console.log('Stop Recording and Start Playback')
    this.setState({isLoading: true})
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
    const info = await FileSystem.getInfoAsync(this.recording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const { sound, status } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: true,
        /*isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,*/
      },
      this.updateScreenForSoundStatus
    );
    this.sound = sound;
    this.sound.setVolumeAsync(1);
    let newVoiceRecord = {
        description: this.id++,
        sound: this.sound,
        soundDuration: status.durationMillis,
      }
    this.setState({isLoading: false})
    this.props.draftStatus(true)
  }

  onPlayPausePressed = () => {
    if (this.sound != null) {
      if (this.state.isPlaying) {
        this.sound.pauseAsync();
      } else {
        this.sound.playAsync();
      }
    }
  };

  recordingHandler = () => {
    if (this.state.isRecording) {
      this.setState({isRecording: false})
      this.stopRecordingAndEnablePlayback();
    } else {
      this.stopPlaybackAndBeginRecording();
    }
  }

  updateScreenForRecordingStatus = (status) => {
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
      })
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      })
      if (!this.state.isLoading) {
        this.stopRecordingAndEnablePlayback();
      }
    }
  };

  updateScreenForSoundStatus = (status) => {
    console.log('updateScreenForSoundStatus')
    if (this.props.isVoiceModalVisible) {
      if (status.isLoaded) {
        this.setState({
          soundDuration: status.durationMillis,
          soundPosition: status.positionMillis,
        })
        if (status.isPlaying) {
          this.setState({isPlaying: true})
        } else {
          this.setState({isPlaying: false})
        }
      } else {
        this.setState({
          soundDuration: null,
          soundPosition: null,
        })
        if (status.error) {
          console.log(`FATAL PLAYER ERROR: ${status.error}`);
        }
      }
    }
  };

  getPlaybackTimestamp() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return `${getMMSSFromMillis(this.state.soundPosition)}`
    }
    return ''
  }

  getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${getMMSSFromMillis(this.state.recordingDuration)}`
    }
    return `${getMMSSFromMillis(0)}`
  }

  _renderSummaryInput = () => (
    <TextInput
      style={styles.textInput}
      onChangeText={(text) => {
        this.setState({text})
        if (text != '') {
          this.props.draftStatus(true)
        }
      }}
      value={this.state.text}
      multiline = {true}
      numberOfLines = {2}
      maxLength = {45}
      placeholder = {'Enter Your Summary..'}
    />
  )

  _renderRecordingComponent = () => (
    <View style={styles.recordingContainer}>
      <Text style = {styles.timerText}>{this.getRecordingTimestamp()}</Text>
      <View style={styles.buttonContainer}>
        <TouchableWithoutFeedback onPress={this.recordingHandler}>
          <Icon type="FontAwesome" 
            name="microphone" 
            style={{
              fontSize: 36, 
              color: this.state.isRecording? 'red': 'white'
            }} />
        </TouchableWithoutFeedback>
      </View>
      {
        this._renderPlaybackComponent()
      }
    </View>
  )

  _renderPlaybackComponent = () => (
    <View style={styles.playbackContainer}>
      {
        !this.state.isRecording && this.sound != null &&
        <Text style = {styles.timerText}>{this.getPlaybackTimestamp()}</Text>
      } 
      {  
        !this.state.isRecording && this.sound != null &&
        <View style={styles.buttonContainer}>
          <TouchableWithoutFeedback onPress={this.onPlayPausePressed}>
            <Icon type="FontAwesome" 
              name={this.state.isPlaying? 'pause': 'play'} 
              style={{
                fontSize: 36, 
                color: 'white'
              }} />
          </TouchableWithoutFeedback>
        </View>
      }  
    </View>
  )

	render() {
    let canPost = this.state.text != '' && this.sound != null
		return(
			<View style={styles.modalContainer}>
        <View style={styles.headerContaioner}>
          <Text style={styles.modalText}>HEADER</Text>
        </View>
        { this._renderSummaryInput() }
				{ this._renderRecordingComponent() }
        { /* this._renderPlaybackComponent() */ }
        {
          <View style = {styles.buttonContainer}>
            <TouchableWithoutFeedback
              onPress={canPost? this.onPostVoice:null}>
              <Text style = {styles.modalText}>{canPost? 'POST':''}</Text>
            </TouchableWithoutFeedback>
          </View>
        }
				
			</View>
		)
	}

}

const mapStateToProps = state => {
  return {
    isVoiceModalVisible: state.isVoiceModalVisible,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    closeVoiceModal: () => {
      dispatch(closeComposeVoiceModal())
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ComposeVoiceModal)

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: CommonStyle.backgroundColor,
    justifyContent: 'center',
    padding: 10,
  },
  headerContaioner: {
    padding: 5,
    alignItems: 'flex-start',
    ...CommonStyle.styleForTest,
  },
  modalText: {
    fontSize: 16,
    color: "white",
    ...CommonStyle.styleForTest,
  },
  timerText: {
    fontSize: 36,
    color: "white",
    ...CommonStyle.styleForTest,
  },
  recordingContainer: {
    flexDirection: 'row',
    ...CommonStyle.styleForTest,
  },
  playbackContainer: {
    flexDirection: 'row',
    ...CommonStyle.styleForTest,
  },
  buttonContainer: {
    padding: 5,
    alignItems: 'flex-end',
    ...CommonStyle.styleForTest,
  },
  textInput: {
    padding: 10,
    color: "white",
    textAlignVertical: "top",
    ...CommonStyle.styleForTest,
  }
});