import * as Type from './Types';

export const grantRecordingPermission = () => {
  return {
    type: Type.GRANT_RECORDING_PERMISSION
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

export const pauseAudio = () => {
  console.log('action pause audio')
  return {
    type: Type.PAUSE_AUDIO
  }
}

export const playAudio = () => {
  console.log('action play audio')
  return {
    type: Type.PLAY_AUDIO
  }
}

export const setPlayingAudioName = (name) => {
  console.log('set audio name: '+name)
  return {
    type: Type.SET_PLAYING_AUDIO_NAME,
    payload: name,
  }
}

export const updatePlayingSoundPosition = (soundPosition) => {
  return {
    type: Type.UPDATE_SOUND_POSITION,
    payload: soundPosition,
  }
}