import React from 'react';
import { Paragraph, Portal, Dialog as PaperDialog, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next'


const Dialog = ({visible, setVisible, title, body, onConfirm=()=>{}, confirmLabel='OK'}) => {
  const { t, i18n } = useTranslation()

    return (
      <Portal>
        <PaperDialog visible={visible} onDismiss={() => {setVisible(false)}}>
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
  }

export default Dialog