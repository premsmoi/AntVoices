import { AppRegistry } from 'react-native'
import React from 'react'
import MainScreen from './screens/MainScreen'
import { name as appName } from './app.json'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './redux/reducers'

const store = createStore(rootReducer)

export default class App extends React.Component {
  
  render() {
    return(
      <Provider store = { store }>
        <MainScreen />
      </Provider>
    )
  }
}

AppRegistry.registerComponent(appName, () => RNRedux)
