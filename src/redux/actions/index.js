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