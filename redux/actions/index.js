import * as Type from './Types';

export const startRecording = () => {
  return {
    type: Type.START_RECORDING
  }
}

export const stopRecording = () => {
  return {
    type: Type.START_RECORDING
  }	
}

export const startPlaying = () => {
  return {
    type: Type.START_PLAYING
  }
}

export const stopPlaying = () => {
  return {
    type: Type.STOP_PLAYING
  }	
}

export const startLoading = () => {
  return {
    type: Type.START_LOADING
  }
}

export const stopLoading = () => {
  return {
    type: Type.STOP_LOADING
  }	
}

export const updateSoundDuration = (newSoundDuration) => {
  return {
    type: Type.UPDATE_SOUND_DURATION,
    payload: newDuration
  }
}

export const updateSoundPosition = (newSoundPosition) => {
  return {
    type: Type.UPDATE_SOUND_POSITION,
    payload: newSoundPositionD
  }	
}

export const updateRecordingDuration = (newRecordingDuration) => {
  return {
    type: Type.UPDATE_RECORDING_DURATION,
    payload: newRecordingDuration
  }
}

export const setRecordingPermission = () => {
  return {
    type: Type.SET_RECORDING_PERMISSION
  }
}

export const openComposeVoiceModal = () => {
  return {
    type: Type.OPEN_COMPOSE_VOICE_MODAL
  }
}

export const closeComposeVoiceModal = () => {
  return {
    type: Type.CLOSE_COMPOSE_VOICE_MODAL
  }
}