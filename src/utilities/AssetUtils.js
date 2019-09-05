import { pause } from 'expo/build/AR';

var antIcon, playIcon, pauseIcon

export default class AssetUtils {

    static instance = AssetUtils.instance == null ? this.createInstance() : this.instance
    
    static createInstance() {
        var object = new AssetUtils();
        this.loadAssets()
        return object;
    }

    static loadAssets() {
        antIcon = require('../../assets/hormiga_perfil.png')
        playIcon = require('../../assets/play.png')
        pauseIcon = require('../../assets/pause.png')
    }
    
    getAsset(name) {
        switch(name) {
            case 'ant':
                return antIcon
            case 'play':
                return playIcon
            case 'pause':
                return pauseIcon
            default:
                return null
        }
    }
}