import React from 'react';
import { View, Pressable } from 'react-native'
import { Portal, Button, Dialog, Text } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import  { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'

const HelpIcon = ({
  dialogContent
}) => {
  const [ visible, setVisible ] = React.useState(false)

  return(
    <View>
      <Pressable onPress={() => setVisible(true)} >
        <FontAwesomeIcon icon={faQuestionCircle} size={20} color='blue'/>
      </Pressable>
      <Portal>
        <Dialog 
          visible={visible} 
          onDismiss={() => setVisible(false)} 
        >
          <Dialog.Content>
            {dialogContent}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {setVisible(false)}}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

export default HelpIcon