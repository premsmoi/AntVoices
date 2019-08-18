import { UPDATE_SOUND_POSITION } from '../actions/Types'

const soundPositionReducer = (state = 0, action) => {
  switch(action.type) {
    case UPDATE_SOUND_POSITION:
      return action.payload
    default:
      return state
  }
}

export default soundPositionReducer