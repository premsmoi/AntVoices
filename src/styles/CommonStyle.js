import { StyleSheet } from 'react-native'

export const backgroundColor = '#333333'
export const borderColor = 'red'

export const styleForTest = {
  borderWidth: 1, // For Test
  borderColor: borderColor, // For Test
}

export const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: backgroundColor,
    justifyContent: 'center',
    padding: 10,
    paddingTop: 30,
  },
  buttonContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 5,
    margin: 2,
    borderWidth: 5,
    borderColor: 'black',
    borderRadius: 10,
    /* ...styleForTest, */
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    ...styleForTest,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 46/2,
    backgroundColor: '#c4c4c4',
    alignSelf: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  outerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 56/2,
    backgroundColor: '#f6eeee',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    borderRadius: 10,
    backgroundColor: '#f6eeee',
    justifyContent: 'center',
  },
  durationContainer: {
    borderRadius: 10,
    //backgroundColor: '#c4c4c4',
    alignSelf: 'center',
  },
  soundStatusContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    /* borderWidth: 5,
    borderColor: '#f6eeee', */
    backgroundColor: '#c4c4c4',
  },

  /* iconContainer: {
    backgroundColor: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
    ...styleForTest,
  }, */
  normalText: {
    fontSize: 16,
    color: "white",
    padding: 5,
    borderWidth: 1, // For Test
    borderColor: borderColor, // For Test
  },
});