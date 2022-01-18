import React from 'react';
import { View, Pressable } from 'react-native'
import { Portal, Button, Dialog, Text, withTheme } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import  { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
import { useTranslation } from 'react-i18next'

const HelpIcon = withTheme(({
  theme,
  dialogContent
}) => {
  const [ visible, setVisible ] = React.useState(false)

  const { t, i18n } = useTranslation()

  return(
    <View>
      <Pressable onPress={() => setVisible(true)} >
        <FontAwesomeIcon icon={faQuestionCircle} size={20} color={theme.colors.primary} />
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
            <Button onPress={() => {setVisible(false)}}>{t('helpIcon.closeButton')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
})

export default HelpIcon;