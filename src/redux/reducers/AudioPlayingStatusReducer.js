import { 
  SET_PLAYING_AUDIO_NAME,
  PAUSE_AUDIO, 
  PLAY_AUDIO,
  UPDATE_SOUND_POSITION } from '../actions/Types'
  
export const audioPlayingStatusReducer = (state = false, action) => {
  switch(action.type) {
    case PAUSE_AUDIO:
      return false
    case PLAY_AUDIO:
      return true
    default:
      return state
  }
}

export const audioPlayingNameReducer = (state = null, action) => {
  switch(action.type) {
    case SET_PLAYING_AUDIO_NAME:
      return action.payload
    default:
      return state
  }
}

export const playingSoundPositionReducer = (state = 0, action) => {
  switch(action.type) {
    case UPDATE_SOUND_POSITION:
      return action.payload
    default:
      return state
  }
}


