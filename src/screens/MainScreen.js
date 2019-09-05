import React from 'react'
import { 
  StyleSheet, 
  Text,
  Alert,
  ScrollView,
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
import Post from '../components/Post'
import ComposeVoiceModal from '../components/ComposeVoiceModal'
import * as FileSystem from 'expo-file-system'
import * as Font from 'expo-font'
import * as Permissions from 'expo-permissions'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import * as NetworkUtils from '../utilities/NetworkUtils'
import AudioPlayer from '../utilities/AudioPlayer'
import * as AppDatabase from '../database/AppDatabase'

const dummyTopics = [{
  summary: 'Topic A',
  audio: null,
  soundDuration: '1000',
  comments: [{

  }],
},{
  summary: 'Topic B',
  audio: null,
  soundDuration: '2000'
},{
  summary: 'Topic C',
  audio: null,
  soundDuration: '3000'
},{
  summary: 'Topic D',
  audio: null,
  soundDuration: '4000'
},{
  summary: 'Topic E',
  audio: null,
  soundDuration: '5000'
},{
  summary: 'Topic F',
  audio: null,
  soundDuration: '6000'
},{
  summary: 'Topic G',
  audio: null,
  soundDuration: '7000'
},{
  summary: 'Topic H',
  audio: null,
  soundDuration: '8000'
},{
  summary: 'Topic I',
  audio: null,
  soundDuration: '9000'
},{
  summary: 'Topic J',
  audio: null,
  soundDuration: '10000'
},]

class MainScreen extends React.Component {

  static navigationOptions = {
    title: 'Main',
    header: null,
  };

  constructor(props) {
    super(props);
    this.isModalDrafted = false
    this.state = {
      haveRecordingPermissions: false,
      isModalVisible: false,
      topics: [],
    };

    this.id = 0;

    this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY));

  }

  componentDidMount() {
    this.askForPermissions()
    AppDatabase.createDatabase()
  }

  componentWillMount() {
   this.getTopics()
    
    //this.setState({topics: getAllTopics()})
    /* this.getAudioList() */
    //NetworkUtils.getTopicList()
  }

  getTopics() {
    AppDatabase.getAllTopicComments()
    AppDatabase.getAllTopics().then(
      (topics) => {
        this.setState({topics: topics})
        console.log("topics: "+JSON.stringify(topics))
      }
    )
  }

  async getAudioList() {
    const audioDir = await FileSystem.documentDirectory + 'Audios/'
    const topics = await FileSystem.readDirectoryAsync(audioDir)
    this.setState({topics}, () => {
      console.log(this.state.topics)
    })
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

  onClosePostModal = (isDrafted) => {
    console.log('isModalDrafted: '+isDrafted)
    if (isDrafted) {
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
        onRequestClose={ () => this.onClosePostModal(this.isModalDrafted)}>
          <ComposeVoiceModal
          type = 'topic'
          draftStatus = {(status) => this.isModalDrafted = status}
          onClosePostModal = {this.onClosePostModal}
          onPost = {() => {
            this.getTopics()
          }}/>
      </Modal>
      <View style={styles.aboveContainer}>
        <ScrollView keyboardShouldPersistTaps = {'always'}  scrollEnabled = {true}>
          <Text style = {styles.normalText}>Ant Voices V0.1</Text>
          {
            this.state.topics.map((topic, index) => {
              return(
                <Post
                  key = {index}
                  id = {topic.id}
                  filename = {topic.filename}
                  summary = {topic.summary}
                  duration = {topic.duration}
                  navigation={this.props.navigation}
                />
              )
            })
            
          }
        </ScrollView>
      </View>
        
      {/* <View style={styles.belowContainer}>

      </View> */}
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
    backgroundColor: CommonStyle.backgroundColor,
    justifyContent: 'center',
    padding: 10,
    paddingTop: 30,
    ...CommonStyle.styleForTest,
  },
  aboveContainer: {
    flex: 7,
    backgroundColor: CommonStyle.backgroundColor,
    /* alignItems: 'center', */
    ...CommonStyle.styleForTest,
  },
  belowContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: CommonStyle.backgroundColor,
    ...CommonStyle.styleForTest,
    
  },
  topicContainer: {
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