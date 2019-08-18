import { SET_RECORDING_PERMISSION } from '../actions/Types'

const recordingPermissionReducer = (state = false, action) => {
  switch(action.type) {
    case SET_RECORDING_PERMISSION:
      return true
    default:
      return state
  }
}

export default recordingPermissionReducer