import React from 'react';
import { Paragraph, Portal, Dialog as PaperDialog, Button, withTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next'


const Dialog = withTheme(({visible, setVisible, title, body, onConfirm=()=>{}, confirmLabel='OK', theme}) => {
  const { t, i18n } = useTranslation()

    return (
      <Portal>
        <PaperDialog visible={visible} 
          onDismiss={() => {setVisible(false)}}
          style={{backgroundColor: theme.colors.dialogBackground}}>
          <PaperDialog.Title>{title}</PaperDialog.Title>
          <PaperDialog.Content>
            <Paragraph>{body}</Paragraph>
          </PaperDialog.Content>
          <PaperDialog.Actions>
            <Button onPress={() => {
              onConfirm()
              setVisible(false)
            }}>{confirmLabel}</Button>
          </PaperDialog.Actions>
        </PaperDialog>
      </Portal>
    )
  })

export default Dialog