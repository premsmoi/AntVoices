import React from 'react'
import { 
	StyleSheet, 
	Text,
  TextInput,
	View,
  BackHandler,
	TouchableWithoutFeedback } from 'react-native'
import { Icon, Row } from 'native-base';
import * as CommonStyle from '../styles/CommonStyle'
import { getMMSSFromMillis } from '../utilities/TimeUtils'
import { connect } from 'react-redux'
import { closeComposeVoiceModal } from '../redux/actions'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as NetworkUtils from '../utilities/NetworkUtils'
import * as AppDatabase from '../database/AppDatabase'

class ComposeVoiceModal extends React.Component {

	constructor(props) {
    super(props)
    this.recording = null;
    this.sound = null;
    this.base64Sound = null
    this.id = 0;
    this.isDrafted = false
    this.uri = null
    this.filename = null

    this.state = {
      summary: '',
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

  closeThisModal = () => {
    console.log('isModalDrafted: '+this.isModalDrafted)
    if (this.isModalDrafted) {
      Alert.alert(
        'Your post is being composed',
        'What would you like to do?',
        [
          {text: 'STAY', onPress: () => {}},
          {text: 'LEAVE', onPress: () => {
            this.props.closeVoiceModal()
            
          }},
        ]
      )
    } else {
      this.props.closeVoiceModal()
    } 
  }


  onPostVoice = async () => {
   /*  const response = NetworkUtils.uploadAudio(this.base64Sound)
    console.log('response: '+JSON.stringify(response)) */
    await FileSystem.writeAsStringAsync(this.uri, this.base64Sound, {
      encoding: FileSystem.EncodingType.Base64})

    AppDatabase.addPost(this.state.summary, this.filename, this.state.soundDuration)
      .then((postId) => {
        if (this.props.type == 'topic') {
          AppDatabase.addTopicComment(postId, null)
          console.log('Post Topic!')
        } else {
          AppDatabase.addTopicComment(this.props.topicId, postId)
          console.log('Post comment!')
        }
        this.props.onPost()
        this.props.closeVoiceModal()
      })
    
    

    /* await AppDatabase.addTopicComment(TopicId, null) */

    /* const newVoiceObject = {
      summary: this.state.summary,
      audio: this.base64Sound,
      soundDuration: this.state.soundDuration
    }*/
    
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

  async playSoundTest() {
    const soundString = await FileSystem.readAsStringAsync(this.recording.getURI(), {
      encoding: FileSystem.EncodingType.Base64,
      length: 1})
    const soundDirectory = await FileSystem.documentDirectory + 'test.m4a'
    FileSystem.writeAsStringAsync(soundDirectory, soundString)
    console.log('soundDirectory: '+soundDirectory)
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(soundDirectory);
      //await soundObject.playAsync();
      // Your sound is playing!
    } catch (error) {
      // An error occurred!
    }
    this.sound = soundObject
  }

  async stopRecordingAndEnablePlayback() {
    console.log('Stop Recording and Start Playback')
    this.setState({isLoading: true})
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
    
    // This soundBase64 will be submitted to the server.
    const base64Sound = await FileSystem.readAsStringAsync(this.recording.getURI(), {
      encoding: FileSystem.EncodingType.Base64})
    this.base64Sound = base64Sound
    const info = await FileSystem.getInfoAsync(this.recording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);
    
    // FileSystem.documentDirectory returns below URI
    // file:///data/user/0/host.exp.exponent/files/ExperienceData/%2540premsmoi%252FAntVoices/ 

    const appDir = await FileSystem.documentDirectory
    const audioDir = appDir+'Audios/'
    const audioList = await FileSystem.readDirectoryAsync(audioDir)
    console.log('audiosDir: '+audioDir)    
    console.log('audioList: '+audioList) 
    
    const filename = 'audio_'+audioList.length+'.m4a'
    this.filename = filename
    const soundDirectory = audioDir + filename
    this.uri = soundDirectory
    const soundString = (base64Sound)
    /* await FileSystem.writeAsStringAsync(soundDirectory, base64Sound, {
      encoding: FileSystem.EncodingType.Base64}) */
    console.log('soundDirectory: '+soundDirectory)
    /* const soundString2 = await FileSystem.readAsStringAsync(soundDirectory, {
      encoding: FileSystem.EncodingType.Base64}) */

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
      },
      this.updateScreenForSoundStatus
    );
      /* const { sound, status } = await Audio.Sound.createAsync(
        {uri:soundDirectory},
        {isLooping: true},
        this.updateScreenForSoundStatus
      ); */
    
    this.sound = sound;
    this.sound.setVolumeAsync(1);
    this.setState({isLoading: false})
    this.props.draftStatus(true)
    this.isDrafted = true
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
      /* this.playSoundTest() */
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
    /* console.log('updateScreenForSoundStatus') */
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
      onChangeText={(summary) => {
        this.setState({summary})
        if (summary != '') {
          this.props.draftStatus(true)
          this.isDrafted = true
        }
      }}
      value={this.state.summary}
      multiline = {true}
      numberOfLines = {2}
      maxLength = {45}
      placeholder = {'Enter Your Summary..'}
    />
  )

  _renderRecordingComponent = () => (
    <View style={styles.recordingContainer}>
      <Text style = {styles.timerText}>{this.getRecordingTimestamp()}</Text>
      <View style={CommonStyle.styles.buttonContainer}>
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
        <View style={CommonStyle.styles.buttonContainer}>
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
    let canPost = this.state.summary != '' && this.sound != null
		return(
			<View style={styles.modalContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{'TBD'}</Text>
          <View style={{flex:2}}/>
          <View style={CommonStyle.styles.buttonContainer}>
            <TouchableWithoutFeedback onPress={() => this.props.onClosePostModal(this.isDrafted)}>
              <Icon type="FontAwesome" 
                name={'times'} 
                style={{
                  fontSize: 24, 
                  color: 'white'
                }} />
            </TouchableWithoutFeedback>
          </View>
        </View>
        { this._renderSummaryInput() }
				{ this._renderRecordingComponent() }
        { /* this._renderPlaybackComponent() */ }
        {
          <View style={{
            flexDirection:'row',
            ...CommonStyle.styleForTest,
          }}>
            <View style={{flex:4}}/>
            <View style = {CommonStyle.styles.buttonContainer}>
              <TouchableWithoutFeedback
                onPress={canPost? this.onPostVoice:null}>
                <Text style = {CommonStyle.styles.buttonText}>{canPost? 'POST':''}</Text>
              </TouchableWithoutFeedback>
            </View>
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
  headerContainer: {
    flexDirection: 'row',
    padding: 5,
    ...CommonStyle.styleForTest,
  },
  headerText: {
    fontSize: 16,
    alignSelf: 'center',
    justifyContent: 'center',
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
  textInput: {
    padding: 10,
    color: "white",
    textAlignVertical: "top",
    ...CommonStyle.styleForTest,
  }
});