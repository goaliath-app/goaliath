import React from 'react';
import { Paragraph, Portal, Dialog, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next'


const DeleteDialog = ({visible, setVisible, onDelete, title, body}) => {
  const { t, i18n } = useTranslation()

    return (
      <Portal>
        <Dialog visible={visible} onDismiss={() => {setVisible(false)}}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{body}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onDelete}>{t('deleteDialog.delete')}</Button>
            <Button onPress={() => {setVisible(false)}}>{t('deleteDialog.cancel')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }

export default DeleteDialog