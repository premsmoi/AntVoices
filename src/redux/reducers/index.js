import { combineReducers } from 'redux'
import recordingPermissionReducer from './RecordingPermissionReducer'
import composeVoiceModalVisibleReducer from './VoiceModalReducer'

export default combineReducers({
  recordingPermission: recordingPermissionReducer,
  isVoiceModalVisible: composeVoiceModalVisibleReducer,
})