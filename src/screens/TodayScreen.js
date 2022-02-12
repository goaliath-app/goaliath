import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { DayContent, Dialog, Header, InfoCard, SpeechBubble } from '../components'
import { getToday, isBetween } from '../util'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native';
import { Appbar, withTheme, Paragraph, Text } from 'react-native-paper'
import { 
  updateLogs, setTutorialState, selectTutorialState, selectAllActivities,
  selectEntriesByDay, getTodaySelector, selectAllActiveActivities,
} from '../redux'
import tutorialStates from '../tutorialStates'
import { areTherePendingWeeklyActivities } from '../activityHandler'
import { faTrophy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'


function selectTodayScreenState(state) {
  const today = getTodaySelector(state)
  
  if( selectAllActivities(state).length == 0) {
    return 'no-activities'
  }
  
  if( selectAllActiveActivities(state).length == 0 ){
    return 'no-active-activities'
  }

  if( selectEntriesByDay(state, today).length == 0 ) {
    if( areTherePendingWeeklyActivities(state, today) ) {
      return 'only-weekly-activities'
    }
    return 'nothing-for-today'
  }

  return 'normal'
}

const TodayScreen = withTheme(({ navigation, theme }) => {
  const dispatch = useDispatch()

  function updateDay(){
    const today = getToday(dayStartHour)
    if(date.toISO() != today.toISO()) {
      setDate(today)
      setDayChangeDialogVisible(true)
    }
  }

  const { t, i18n } = useTranslation()

  // selectors
  const tutorialState = useSelector(selectTutorialState)
  const dayStartHour = useSelector(state => state.settings.dayStartHour)
  const today = getToday(dayStartHour)
  const todayScreenState = useSelector(selectTodayScreenState)

  const [ date, setDate ] = useState(today)
  const [ dayChangeDialogVisible, setDayChangeDialogVisible ] = useState(false)
  
  useEffect(() => {
    setDate(today)
  }, [today.toISO()])

  // effect to check every minute if current day has changed
  useEffect(() => {
      const intervalId = setInterval(() => {
        updateDay()
      }, 60000)
      return () => clearInterval(intervalId)  // this function executes before running the effect again
  }, [today.toISO(), date.toISO(), dayStartHour])

  useFocusEffect(
    React.useCallback(() => {
      dispatch(updateLogs())
    })
  );

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.todayScreenBackground}}>
      <Header title={t('today.headerTitle')} navigation={navigation} buttons={
        tutorialState == tutorialStates.Finished ? 
          <Appbar.Action icon='cog' onPress={() => {navigation.navigate('Settings')}} color={theme.colors.headerContent} style={{ height: 48, width: 48 }} />
          :
          <Appbar.Action icon='cog' color={theme.colors.headerContent} style={{opacity: 0.5, height: 48, width: 48}} />
      }/>
      { isBetween(tutorialStates.TodayScreenIntroduction, tutorialState, tutorialStates.GoalsScreenIntroduction) ?
        <SpeechBubble
          speeches={[
            {id: 0, text: t('tutorial.TodayScreenIntroduction.1')},
            {id: 1, text: t('tutorial.TodayScreenIntroduction.2'),
              onTextEnd: () => dispatch(setTutorialState(tutorialStates.GoalsScreenIntroduction))},
          ]}
          bubbleStyle={{height: 80}}
        />
        : null
      }
      { isBetween(tutorialStates.FirstGoalCreation, tutorialState, tutorialStates.AddNewActivityHighlight) ?
        <SpeechBubble
          speeches={[
            {id: 0, text: t('tutorial.ReturnToGoalsScreen')},
          ]}
          bubbleStyle={{height: 80}}
        /> : null 
      }
      { isBetween(tutorialStates.ActivitiesInTodayScreen, tutorialState, tutorialStates.TutorialEnding) ?
        <SpeechBubble
          speeches={[
            {id: 0, text: t('tutorial.ActivitiesInTodayScreen.2')},
            {id: 1, text: t('tutorial.ActivitiesInTodayScreen.3')},
            {id: 2, text: t('tutorial.ActivitiesInTodayScreen.4')},
            {id: 3, text: t('tutorial.ChooseWeekliesIntroduction.1'), 
              onTextEnd: () => {
                dispatch(setTutorialState(tutorialStates.ChooseWeekliesIntroduction))
              }
            },
            {id: 4, text: t('tutorial.ChooseWeekliesIntroduction.2')},
            //TODO: show OneTimeTasks component when the text starts, no when the previous text ends
            {id: 5, text: t('tutorial.OneTimeTasksIntroduction.1'),
              onTextEnd: () => {
                dispatch(setTutorialState(tutorialStates.OneTimeTasksIntroduction))
              }
            }, 
            {id: 6, text: t('tutorial.TutorialEnding.1'),
              onTextEnd: () => dispatch(setTutorialState(tutorialStates.TutorialEnding))
            },
            {id: 7, text: t('tutorial.TutorialEnding.2')},
            {id: 8, text: t('tutorial.TutorialEnding.3')},
            {id: 9, text: t('tutorial.TutorialEnding.4')},
            {id: 10, text: t('tutorial.TutorialEnding.5')},
            {id: 11, text: t('tutorial.TutorialEnding.6'), onNextPress: () => {
              dispatch(setTutorialState(tutorialStates.Finished))
            }},
          ]}
          bubbleStyle={{height: 80}}
        />
        : null
      }
      
      { todayScreenState=='no-activities' && tutorialState==tutorialStates.Finished ?
        <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
          <InfoCard title={t('today.noActivitiesInfoCard.title')} 
            // paragraph={t('today.noActivitiesInfoCard.content')}
            extraContent={
              <Paragraph style={{overflow: 'visible'}}>
                <Text>{t('today.noActivitiesInfoCard.contentBeforeIcon')}</Text>
                {/* If you know a better way of properly aligning the icon to 
                the text, PLEASE let me know (already tried all the obviuous
                ways I knew) */}
                <View style={{width: 20, alignItems: 'center'}}>
                  <View style={{position: 'absolute', top: -13}}>
                    <FontAwesomeIcon icon={faTrophy} size={16} color={theme.colors.onSurface} />
                  </View>
                </View>
                <Text>{t('today.noActivitiesInfoCard.contentAfterIcon')}</Text>
              </Paragraph>}
            // extraContent={<Paragraph style={{overflow: 'visible'}}>Go to the Goals <FontAwesomeIcon icon={faTrophy} size={16} color={theme.colors.onSurface} /> section to plan your daily actions</Paragraph>}
          />
        </View> 
        : null 
      }

      { todayScreenState=='no-active-activities' && tutorialState==tutorialStates.Finished ?
        <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
          <InfoCard title={t('today.noActiveActivitiesInfoCard.title')} 
            paragraph={t('today.noActiveActivitiesInfoCard.content')} /> 
        </View> 
        : null 
      }
      {/* { todayScreenState=='only-weekly-activities' && tutorialState==tutorialStates.Finished ?
        <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
          <InfoCard title={t('today.onlyWeeklyActivities.title')} 
            paragraph={t('today.onlyWeeklyActivities.content')} /> 
        </View> 
        : null 
      } */}
      { todayScreenState=='nothing-for-today' && tutorialState==tutorialStates.Finished ?
        <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
          <InfoCard title={t('today.nothingForToday.title')} 
            paragraph={t('today.nothingForToday.content')} /> 
        </View>
        : null 
      }

      <DayContent date={date} />

      <Dialog 
        visible={dayChangeDialogVisible} 
        setVisible={setDayChangeDialogVisible}
        title={t("today.dayChangeDialogTitle")}
        body={t("today.dayChangeDialogBody", {date: date.toFormat("dd-MM-yyyy")})}
        confirmLabel={t("today.dayChangeDialogConfirmLabel")}
      />
    </View>
  );
})

export default TodayScreen;
