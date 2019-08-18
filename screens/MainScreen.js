import React from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  Button, 
  TouchableHighlight } from 'react-native'
import ActionButton from 'react-native-action-button'
import Modal from "react-native-modal"
import { connect } from 'react-redux'
import { openComposeVoiceModal } from '../redux/actions'
import { Audio } from 'expo-av'
import Voice from '../components/Voice'
import ComposeVoiceModal from '../components/ComposeVoiceModal'
import * as FileSystem from 'expo-file-system'
import * as Font from 'expo-font'
import * as Permissions from 'expo-permissions'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import { getMMSSFromMillis } from '../utilities/TimeUtils' // To be deleted

const fabActions = [
  {
    text: "Post Topic",
    icon: require("../assets/add.png"),
    name: "bt_post_topic",
    position: 0
  },
]

class MainScreen extends React.Component {

  constructor(props) {
    super(props);
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

  componentDidMount() {
    this._askForPermissions();
  }

  _askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  };

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

  // To be deleted
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

  _openVoiceModal = () => {
   /* this.setState({ isModalVisible: !this.state.isModalVisible })*/
    this.props.openVoiceModal()
  }

  render() {
    return (
    <View style={styles.rootContainer}>
      <Modal isVisible={this.props.isVoiceModalVisible}>
            <ComposeVoiceModal/>
        </Modal>
      <View style={styles.aboveContainer}>
        <Text style = {styles.normalText}>MainScreen is here!!</Text>
        {
          this.state.voiceList.map((voice, index) => {
            return(
              <Voice 
                key = {index}
                sound = {voice.sound}
                description = {voice.description}
                soundDuration = {voice.soundDuration}
              />
            )
          }) 
          
        }
      </View>
        
      <View style={styles.belowContainer}>
        <View style={styles.recordDetailContainer}>
          <Text style = {styles.normalText}>{this._getRecordingTimestamp()}</Text>
          {
            !this.state.isRecording && this.sound != null &&
            <Text style = {styles.normalText}>{this._getPlaybackTimestamp()}</Text>
          }
        </View>
        <View style={styles.buttonsGroupContainer}>
          <View style={styles.buttonContainer}>
            <TouchableHighlight onPress={this._recordingHandler}>
              <FontAwesome name="microphone" size={32} color={this.state.isRecording? 'red': 'white'} />
            </TouchableHighlight>
          </View>
          {
            !this.state.isRecording && this.sound != null &&
            <View style={styles.buttonContainer}>
              <TouchableHighlight onPress={this._onPlayPausePressed}>
                <FontAwesome name={this.state.isPlaying? 'pause': 'play'} size={32} color='white' />
              </TouchableHighlight>
            </View>
          }  
        </View>
      </View>
      <ActionButton 
        buttonColor='white'
        buttonTextStyle={styles.actionButtonText}
        onPress={this._openVoiceModal}/>
    </View>
    );
  }
  
}

const mapStateToProps = state => {
  return {
    isVoiceModalVisible: state.isVoiceModalVisible
  }
}

const mapDispatchToProps = dispatch => {
  return {
    openVoiceModal: () => {
      dispatch(openComposeVoiceModal())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen)

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    padding: 10,
    paddingTop: 30,
  },
  aboveContainer: {
    flex: 4,
    backgroundColor: 'black',
    alignItems: 'center',
    /*justifyContent: 'center',*/
    borderWidth: 1, // For Test
    borderColor: 'white', // For Test
  },
  belowContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'black',
    borderWidth: 1, // For Test
    borderColor: 'white', // For Test
  },
  recordDetailContainer: {
    flex: 1,
    borderWidth: 1, // For Test
    borderColor: 'white', // For Test
  },
  buttonsGroupContainer: {
    flex: 1,
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
  normalText: {
    fontSize: 16,
    color: "white",
    padding: 5,
    borderWidth: 1, // For Test
    borderColor: 'white', // For Test
  },
  button: {
    color: "black",
    borderWidth: 1, // For Test
    borderColor: 'white', // For Test
  },
  actionButtonText: {
    fontSize: 36,
    color: "black",
  },
});