import { AppRegistry } from 'react-native'
import React from 'react'
import { name as appName } from './app.json'
import { Provider } from 'react-redux'
import Store from './src/redux/Store'
import AppNavigator from './src/AppNavigator'

export default class App extends React.Component {
  
  render() {
    return(
      <Provider store = { Store }>
        <AppNavigator/> 
      </Provider>
    )
  }
}

AppRegistry.registerComponent(appName, () => RNRedux)
