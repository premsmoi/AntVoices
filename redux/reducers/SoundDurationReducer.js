import { UPDATE_SOUND_DURATION } from '../actions/Types'

const soundDurationReducer = (state = 0, action) => {
  switch(action.type) {
    case UPDATE_SOUND_DURATION:
      return action.payload
    default:
      return state
  }
}

export default soundDurationReducer