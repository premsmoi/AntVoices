import { combineReducers } from 'redux'
import loadingStatusReducer from './LoadingStatusReducer'
import playingStatusReducer from './PlayingStatusReducer'
import recordingDurationReducer from './RecordingDurationReducer'
import recordingPermissionReducer from './RecordingPermissionReducer'
import recordingStatusReducer from './RecordingStatusReducer'
import soundDurationReducer from './SoundDurationReducer'
import soundPositionReducer from './SoundPositionReducer'
import composeVoiceModalVisibleReducer from './VoiceModalReducer'

export default combineReducers({
  isLoading: loadingStatusReducer,
  isPlaying: playingStatusReducer,
  recordingDuration: recordingDurationReducer,
  recordingPermission: recordingPermissionReducer,
  isRecording: recordingStatusReducer,
  soundDuration: soundDurationReducer,
  soundPosition: soundPositionReducer,
  isVoiceModalVisible: composeVoiceModalVisibleReducer
})