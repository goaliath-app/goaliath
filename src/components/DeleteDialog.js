import React from 'react';
import { useDispatch } from 'react-redux';
import { Paragraph, Portal, Dialog, Button, withTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { archiveGoal, archiveActivity } from '../redux'

export const DeleteGoalDialog = ({ visible, onDismiss, goalId, onDelete=()=>{} }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

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

export const DeleteActivityDialog = ({ visible, onDismiss, activityId, onDelete=()=>{} }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  return (
    <DeleteDialog 
      visible={visible} 
      onDismiss={onDismiss} 
      onDelete={()=>{
        dispatch(archiveActivity(activityId))
        onDismiss()
        onDelete()
      }}
      title={t('activityDetail.deleteDialog.title')}
      body={t('activityDetail.deleteDialog.body')}
    />
  )
}

const DeleteDialog = withTheme(({visible, onDismiss, onDelete, title, body, theme}) => {
  const { t, i18n } = useTranslation()

    return (
      <Portal>
        <Dialog visible={visible} onDismiss={onDismiss} style={{backgroundColor: theme.colors.dialogBackground}}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{body}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {onDismiss()}}>{t('deleteDialog.cancel')}</Button>
            <Button onPress={onDelete}>{t('deleteDialog.delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  })

export default DeleteDialog