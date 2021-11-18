import React from 'react';
import { useDispatch } from 'react-redux';
import { Paragraph, Portal, Dialog, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { archiveGoal } from '../redux'
import { useNavigation } from '@react-navigation/native';

export const DeleteGoalDialog = ({ visible, onDismiss, goalId, onDelete=()=>{} }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigation = useNavigation()

  return (
    <DeleteDialog 
      visible={visible} 
      onDismiss={onDismiss} 
      onDelete={()=>{
        dispatch(archiveGoal(goalId))
        onDismiss()
        onDelete()
      }}
      title={t('goal.deleteDialog.title')}
      body={t('goal.deleteDialog.body')}
    />
  )
}

const DeleteDialog = ({visible, onDismiss, onDelete, title, body}) => {
  const { t, i18n } = useTranslation()

    return (
      <Portal>
        <Dialog visible={visible} onDismiss={onDismiss}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{body}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onDelete}>{t('deleteDialog.delete')}</Button>
            <Button onPress={() => {onDismiss()}}>{t('deleteDialog.cancel')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }

export default DeleteDialog