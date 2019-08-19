import { 
  OPEN_COMPOSE_VOICE_MODAL, 
  CLOSE_COMPOSE_VOICE_MODAL } from '../actions/Types'

const composeVoiceModalVisibleReducer = (state = false, action) => {
  switch(action.type) {
    case OPEN_COMPOSE_VOICE_MODAL:
      return true
    case CLOSE_COMPOSE_VOICE_MODAL:
      return false
    default:
      return state
  }
}

export default composeVoiceModalVisibleReducer