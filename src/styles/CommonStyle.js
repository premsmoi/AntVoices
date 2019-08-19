import { StyleSheet } from 'react-native'

export const backgroundColor = 'black'
export const borderColor = 'red'

export const styleForTest = {
  borderWidth: 1, // For Test
  borderColor: borderColor, // For Test
}

export const commonStyles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: backgroundColor,
    justifyContent: 'center',
    padding: 10,
    paddingTop: 30,
  },
  buttonContainer: {
    margin: 5,
    alignItems: 'center',
    alignSelf: 'center',
    ...styleForTest,
    /*borderWidth: 1, // For Test
    borderColor: borderColor, // For Test*/
  },
  button: {
    color: "black",
    ...styleForTest,
    /*borderWidth: 1, // For Test
    borderColor: borderColor, // For Test*/
  },
  normalText: {
    fontSize: 16,
    color: "white",
    padding: 5,
    borderWidth: 1, // For Test
    borderColor: borderColor, // For Test
  },
});