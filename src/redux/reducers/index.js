import { combineReducers } from 'redux'
import recordingPermissionReducer from './RecordingPermissionReducer'
import composeVoiceModalVisibleReducer from './VoiceModalReducer'
import { 
  audioPlayingStatusReducer, 
  audioPlayingNameReducer, 
  playingSoundPositionReducer } from './AudioPlayingStatusReducer'

export default combineReducers({
  recordingPermission: recordingPermissionReducer,
  isVoiceModalVisible: composeVoiceModalVisibleReducer,
  isAudioPlaying: audioPlayingStatusReducer,
  playingAudioName: audioPlayingNameReducer,
  playingSoundPosition: playingSoundPositionReducer,
})