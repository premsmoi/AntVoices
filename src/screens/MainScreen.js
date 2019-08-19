import React from 'react'
import { 
  StyleSheet, 
  Text,
  BackHandler,
  Alert,
  View, } from 'react-native'
import { Button, Icon, Fab } from 'native-base';
import Modal from "react-native-modal"
import { connect } from 'react-redux'
import * as CommonStyle from '../styles/CommonStyle'
import { 
  openComposeVoiceModal,
  closeComposeVoiceModal,
  grantRecordingPermission } from '../redux/actions'
import { Audio } from 'expo-av'
import Topic from '../components/Topic'
import ComposeVoiceModal from '../components/ComposeVoiceModal'
import * as FileSystem from 'expo-file-system'
import * as Font from 'expo-font'
import * as Permissions from 'expo-permissions'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import { getMMSSFromMillis } from '../utilities/TimeUtils' // To be deleted

class MainScreen extends React.Component {

  constructor(props) {
    super(props);
    this.isModalDrafted = false
    this.state = {
      haveRecordingPermissions: false,
      isModalVisible: false,
      topics: []
    };

    this.id = 0;

    this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY));
  }

  componentDidMount() {
    this.askForPermissions()
  }

  askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (response.status === 'granted') {
      this.props.grantRecordingPermission()
    }
  };

  openVoiceModal = () => {
    this.props.openVoiceModal()
  }

  onRequestCloseModal = () => {
    console.log('isModalDrafted: '+this.isModalDrafted)
    if (this.isModalDrafted) {
      if (this.isModalDrafted) 
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

  render() {
    return (
    <View style={styles.rootContainer}>
      <Modal
        isVisible={this.props.isVoiceModalVisible}
        onRequestClose={this.onRequestCloseModal}>
          <ComposeVoiceModal draftStatus = {(status) => this.isModalDrafted = status}/>
        </Modal>
      <View style={styles.aboveContainer}>
        <Text style = {styles.normalText}>MainScreen is here!!</Text>
        {
          /*this.state.voiceList.map((voice, index) => {
            return(
              <Voice 
                key = {index}
                sound = {voice.sound}
                description = {voice.description}
                soundDuration = {voice.soundDuration}
              />
            )
          }) */
          
        }
      </View>
        
      <View style={styles.belowContainer}>

      </View>
      <Fab
        direction="up"
        style={{ backgroundColor: 'white' }}
        position="bottomRight"
        onPress={this.openVoiceModal}>
        <Icon type="Ionicons" name="add" style = {{color: 'black'}}/>
      </Fab>
    </View>
    );
  }
  
}

const mapStateToProps = state => {
  return {
    isVoiceModalVisible: state.isVoiceModalVisible,
    haveRecordingPermissions: state.recordingPermission,
    voiceSummary: state.voiceSummary,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    openVoiceModal: () => {
      dispatch(openComposeVoiceModal())
    },
    closeVoiceModal: () => {
      dispatch(closeComposeVoiceModal())
    },
    grantRecordingPermission: () => {
      dispatch(grantRecordingPermission())
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
    ...CommonStyle.styleForTest,
  },
  aboveContainer: {
    flex: 4,
    backgroundColor: 'black',
    alignItems: 'center',
    ...CommonStyle.styleForTest,
  },
  belowContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'black',
    ...CommonStyle.styleForTest,
    
  },
  recordDetailContainer: {
    flex: 1,
    ...CommonStyle.styleForTest,
  },
  buttonsGroupContainer: {
    flex: 1,
    ...CommonStyle.styleForTest,
    // justifyContent: 'space-around',
  },
  buttonContainer: {
    margin: 5,
    alignItems: 'center',
    alignSelf: 'center',
    ...CommonStyle.styleForTest,
  },
  normalText: {
    fontSize: 16,
    color: "white",
    padding: 5,
    ...CommonStyle.styleForTest,
  },
  button: {
    color: "black",
    ...CommonStyle.styleForTest,
  },
});