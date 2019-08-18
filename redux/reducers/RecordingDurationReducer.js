import { UPDATE_RECORDING_DURATION } from '../actions/Types'

const recordingDurationReducer = (state = 0, action) => {
  switch(action.type) {
    case UPDATE_RECORDING_DURATION:
      return action.payload
    default:
      return state
  }
}

export default recordingDurationReducer