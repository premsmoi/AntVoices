import React from 'react'
import {
    Alert,
    View,
    Text,
    ScrollView,
    StyleSheet,
    BackHandler,
} from 'react-native'
import { Button, Icon, Fab } from 'native-base';
import * as CommonStyle from '../styles/CommonStyle'
import Post from '../components/Post'
import { 
    openComposeVoiceModal,
    closeComposeVoiceModal} from '../redux/actions'
import { connect } from 'react-redux'
import Modal from "react-native-modal"
import ComposeVoiceModal from '../components/ComposeVoiceModal'
import * as AppDatabase from '../database/AppDatabase'

const dummyComments = [
    {
        summary: 'comment A',
        audio: 'audio_comment_a',
        soundDuration: 1000,
    },
    {
        summary: 'comment B',
        audio: 'audio_comment_b',
        soundDuration: 2000,
    },
    {
        summary: 'comment C',
        audio: 'audio_comment_c',
        soundDuration: 3000,
    },
]

class TopicScreen extends React.Component {

    static navigationOptions = {
        title: 'Topic',
        header: null,
      };

    constructor(props) {
        super(props)
        this.topic = this.props.navigation.getParam('audio', '')
        this.state = {
            /* comments: dummyComments, */
            comments: [],
        }
    }

    componentWillMount() {
        this.getComments(this.topic.id)
    }

    getComments = (topicId) => {
        AppDatabase.getComments(topicId).then(
            (comments) => {
                this.setState({comments: comments})
            }
        )
    }

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
        return(
            <View style={styles.rootContainer}>
                <Modal
                    isVisible={this.props.isVoiceModalVisible}
                    onRequestClose={ () => this.onClosePostModal(this.isModalDrafted)}>
                    <ComposeVoiceModal
                        type = 'comment'
                        topicId = {this.topic.id}
                        draftStatus = {(status) => this.isModalDrafted = status}
                        onClosePostModal = {this.onClosePostModal}
                        onPost = {() => {
                            /* this.getTopics() */
                            this.getComments(this.topic.id)
                        }}/>
                </Modal>
                <ScrollView keyboardShouldPersistTaps = {'always'}  scrollEnabled = {true}>
                    <Post
                        id = {this.topic.id}
                        filename = {this.topic.filename}
                        summary = {this.topic.summary}
                        duration = {this.topic.duration}/>
                        {
                            this.state.comments.map((comment, index) => {
                                return(
                                <Post 
                                key = {index}
                                id = {comment.id}
                                filename = {comment.filename}
                                summary = {comment.summary}
                                duration = {comment.duration}
                                />
                                )
                            })
                        }
                    </ScrollView>
                <Fab
                    direction="up"
                    style={{ backgroundColor: 'white' }}
                    position="bottomRight"
                    onPress={this.openVoiceModal}>
                    <Icon type="Ionicons" name="add" style = {{color: 'black'}}/>
                </Fab>
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
      openVoiceModal: () => {
        dispatch(openComposeVoiceModal())
      },
      closeVoiceModal: () => {
        dispatch(closeComposeVoiceModal())
      },
    }
  }
  
export default connect(mapStateToProps,mapDispatchToProps)(TopicScreen)

const styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
      backgroundColor: 'black',
      padding: 10,
      paddingTop: 30,
      ...CommonStyle.styleForTest,
    },
})