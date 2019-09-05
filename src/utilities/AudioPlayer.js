import * as FileSystem from 'expo-file-system'
import { Audio } from 'expo-av'
import { 
  playAudio, 
  pauseAudio, 
  setPlayingAudioName, 
  updatePlayingSoundPosition } from '../redux/actions'
import Store from '../redux/Store'

var currentAudio, currentStatus

export default class AudioPlayer {
  static instance = AudioPlayer.instance == null ? this.createInstance() : this.instance
    
  static createInstance() {
      var object = new AudioPlayer();
      currentAudio = null
      currentStatus = null
      return object;
  }

  static async loadAudio(audioName) {
    if (currentAudio !== null) {
      await currentAudio.unloadAsync()
      currentAudio.setOnPlaybackStatusUpdate(null)
      currentAudio = null
    }
    const audioDir = await FileSystem.documentDirectory+'Audios/'
    const soundDirectory = audioDir + audioName

    console.log(audioName + ' is loading..')
    const { sound, status } = await Audio.Sound.createAsync(
      {uri:soundDirectory},
      {},
      AudioPlayer.updateAudioStatus
    );
    currentAudio = sound
    currentStatus = status

    Store.dispatch(setPlayingAudioName(audioName))
  }

  static async onPlayPressed(audioName) {
      console.log('onPlayPressed')
      if (Store.getState().playingAudioName != audioName && audioName != null) {
        await AudioPlayer.loadAudio(audioName)
      }
      await currentAudio.playAsync();
      Store.dispatch(playAudio())
  }

  static async onPausePressed() {
    console.log('onPausePressed')
    await currentAudio.pauseAsync();
    Store.dispatch(pauseAudio())
  }

  static async updateAudioStatus(status) {
    const isPlaying = Store.getState().isAudioPlaying
    if (status.positionMillis != null) {
      const position = Store.dispatch(updatePlayingSoundPosition(status.positionMillis))
      /* console.log("Sound Position: "+Store.getState().playingSoundPosition) */
    }
    
    //console.log(Store.getState().playingAudioName + ' isPlaying')
    if (status.didJustFinish) {
      console.log('Audio Completion!')
      Store.dispatch(pauseAudio())
      if (currentAudio != null) {
        await currentAudio.unloadAsync()
        currentAudio.setOnPlaybackStatusUpdate(null)
        currentAudio = null
        Store.dispatch(setPlayingAudioName(null))
      }
    }
  }
}