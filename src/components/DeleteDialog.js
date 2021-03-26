import React from 'react';
import { Paragraph, Portal, Dialog, Button } from 'react-native-paper';

const DeleteDialog = ({visible, setVisible, onDelete, title, body}) => {
    return (
      <Portal>
        <Dialog visible={visible} onDismiss={() => {setVisible(false)}}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{body}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onDelete}>Delete</Button>
            <Button onPress={() => {setVisible(false)}}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }

export default DeleteDialog