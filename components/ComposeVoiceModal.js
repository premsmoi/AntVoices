import React from 'react'
import { 
	StyleSheet, 
	Text, 
	View, 
	Button, 
	TouchableHighlight } from 'react-native'
import { getMMSSFromMillis } from '../utilities/TimeUtils'
import { connect } from 'react-redux'
import { closeComposeVoiceModal } from '../redux/actions'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as Font from 'expo-font'
import * as Permissions from 'expo-permissions'
import { FontAwesome, Ionicons } from '@expo/vector-icons'

class ComposeVoiceModal extends React.Component {

	constructor(props) {
    super(props)
    this.recording = null;
    this.sound = null;
    this.state = {
      isRecording: false,
      isPlaying: false,
      isLoading: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      haveRecordingPermissions: false,
      voiceList: [],
      isModalVisible: false
    };

    this.id = 0;

    this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY));
  }

  _onTextPressed = () => {
  	this.props.closeVoiceModal()
  }

  _startRecording = () => {
    /*alert('Start Recording!');*/
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
      this._stopPlaybackAndBeginRecording();
    }
  }

  async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true,
    });
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
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false,
    });
  }

  async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true,
    });
    try {
      await this.recording.stopAndUnloadAsync();
      /*alert("Recording Done!");*/
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
        isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
      },
      this._updateScreenForSoundStatus
    );
    this.sound = sound;
    this.sound.setVolumeAsync(1);
    let newVoiceRecord = {
        description: this.id++,
        sound: this.sound,
        soundDuration: status.durationMillis,
      }
    let newVoiceList = this.state.voiceList
    newVoiceList.push(newVoiceRecord)
    this.setState({
      isLoading: false,
      voiceList: newVoiceList
    });
  }

  _stopRecording = () => {
    /*alert('Stop Recording!');*/
    this.setState({isRecording: false});
    this._stopRecordingAndEnablePlayback();
  }

  _onPlayPausePressed = () => {
    if (this.sound != null) {
      if (this.state.isPlaying) {
        this.sound.pauseAsync();
      } else {
        this.sound.playAsync();
      }
    }
  };

  _recordingHandler = () => {
    if (this.state.isRecording) {
      this._stopRecording();
    } else {
      this._startRecording();
    }
  }

  _updateScreenForRecordingStatus = status => {
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  _updateScreenForSoundStatus = status => {
    if (status.isLoaded) {
      this.setState({
        soundDuration: status.durationMillis,
        soundPosition: status.positionMillis,
        /*shouldPlay: status.shouldPlay,*/
        isPlaying: status.isPlaying,
        /*rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        shouldCorrectPitch: status.shouldCorrectPitch,
        isPlaybackAllowed: true,*/
      });
    } else {
      this.setState({
        soundDuration: null,
        soundPosition: null,
        /*isPlaybackAllowed: false,*/
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _getPlaybackTimestamp() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return `${getMMSSFromMillis(this.state.soundPosition)}`
    }
    return ''
  }

  _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${getMMSSFromMillis(this.state.recordingDuration)}`
    }
    return `${getMMSSFromMillis(0)}`
  }

	render() {
		return(
			<View style={styles.modalContainer}>
				<View style={styles.recordDetailContainer}>
          <Text style = {styles.modalText}>{this._getRecordingTimestamp()}</Text>
          {
            !this.state.isRecording && this.sound != null &&
            <Text style = {styles.modalText}>{this._getPlaybackTimestamp()}</Text>
          }
        </View>
        <View style={styles.buttonsGroupContainer}>
          <View style={styles.buttonContainer}>
            <TouchableHighlight onPress={this._recordingHandler}>
              <FontAwesome name="microphone" size={32} color={this.state.isRecording? 'red': 'black'} />
            </TouchableHighlight>
          </View>
          {
            !this.state.isRecording && this.sound != null &&
            <View style={styles.buttonContainer}>
              <TouchableHighlight onPress={this._onPlayPausePressed}>
                <FontAwesome name={this.state.isPlaying? 'pause': 'play'} size={32} color='black' />
              </TouchableHighlight>
            </View>
          }  
        </View>
				<TouchableHighlight onPress={this._onTextPressed}>
					<Text>Close</Text>
				</TouchableHighlight>
			</View>
		)
	}

}

const mapStateToProps = state => {
  return {
    isVoiceModalVisible: state.isVoiceModalVisible
  }
}

const mapDispatchToProps = dispatch => {
  return {
    closeVoiceModal: () => {
      dispatch(closeComposeVoiceModal())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ComposeVoiceModal)

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 10,
  },
  modalText: {
    fontSize: 16,
    color: "black",
    padding: 5,
    borderWidth: 1, // For Test
    borderColor: '#fff', // For Test
  },
  recordDetailContainer: {
    borderWidth: 1, // For Test
    borderColor: 'white', // For Test
  },
  buttonsGroupContainer: {
    borderWidth: 1, // For Test
    borderColor: 'white', // For Test
    // justifyContent: 'space-around',
  },
  buttonContainer: {
    margin: 5,
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1, // For Test
    borderColor: 'white', // For Test
  },
});