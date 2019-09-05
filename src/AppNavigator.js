import {createStackNavigator, createAppContainer} from 'react-navigation';
import MainScreen from './screens/MainScreen';
import TopicScreen from './screens/TopicScreen';

const MainNavigator = createStackNavigator({
  Main: MainScreen,
  Topic: TopicScreen,
});

const AppNavigator = createAppContainer(MainNavigator);

export default AppNavigator;