import React from 'react';
import { ScrollView, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { Paragraph, Portal, Dialog as PaperDialog, Button, Snackbar, withTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { selectAllGoals, changeActivityGoal, selectActivityById, selectGoalById } from '../redux'

const Dialog = withTheme(({ theme, visible, setVisible, activityId }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  const [ snackbarVisible, setSnackBarVisible ] = React.useState(false)

  const activity = useSelector(state => selectActivityById(state, activityId))
  const currentGoal = useSelector(state => selectGoalById(state, activity.goalId))

  let goals = useSelector(selectAllGoals)
  goals = goals.filter(goal => goal.archived == false && goal.id != activity.goalId)

  return (
    <Portal>
      <PaperDialog visible={visible} onDismiss={() => {setVisible(false)}}>
        <PaperDialog.Title>{t("activityDetail.changeGoalDialogTitle")}</PaperDialog.Title>
          <View style={{marginHorizontal: 24}}>
            <Paragraph>{t("activityDetail.changeGoalDialogBody", {currentGoal: currentGoal.name})}</Paragraph>
            <View style={{height: 16}} />
            <ScrollView style={{maxHeight: "80%", backgroundColor: theme.colors.dialogBackground}}>
            {
              goals.map(goal => {
                return (
                  <Button key={goal.id} mode="outlined" onPress={() => {
                    setVisible(false)
                    setSnackBarVisible(true)
                    dispatch(changeActivityGoal(activityId, goal.id))
                  }}>
                    {goal.name}
                  </Button>
                )
              })
            }
            </ScrollView>
          </View>
        <PaperDialog.Actions>
          <Button onPress={() => {
            setVisible(false)
          }}>{t("activityDetail.changeGoalDialogCancel")}</Button>
        </PaperDialog.Actions>
      </PaperDialog>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={()=>setSnackBarVisible(false)}
        duration={5000}
      >
        {t("activityDetail.changeGoalSnackbar")}
      </Snackbar>

    </Portal>
  )
  })

export default Dialog;