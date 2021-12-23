import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { DayContent, Dialog, Header, SpeechBubble } from '../components'
import { getToday } from '../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';
import { useFocusEffect } from '@react-navigation/native';
import { Appbar } from 'react-native-paper'
import { updateLogs } from '../redux'
import { Context } from '../../App'

const TodayScreen = ({ navigation }) => {
  const dispatch = useDispatch()

  function updateDay(){
    const today = getToday(dayStartHour)
    if(date.toISO() != today.toISO()) {
      setDate(today)
      setDayChangeDialogVisible(true)
    }
  }

  const { t, i18n } = useTranslation()

  const { showTutorial, tutorialState } = React.useContext(Context);


  // selectors
  const dayStartHour = useSelector(state => state.settings.dayStartHour)
  const today = getToday(dayStartHour)

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
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('today.headerTitle')} navigation={navigation} buttons={
        <Appbar.Action icon='cog' onPress={() => {navigation.navigate('Settings')}} color="white" />
      }/>
      {tutorialState=='TodayScreenIntroduction'?
        <SpeechBubble
          speeches={[
            {id: 0, text: t('tutorial.TodayScreenIntroduction.1')},
            {id: 1, text: t('tutorial.TodayScreenIntroduction.2')},
            {id: 2, text: t('tutorial.TodayScreenIntroduction.3')},
            {id: 3, text: t('tutorial.TodayScreenIntroduction.4'), onTextEnd: () => showTutorial('GoalsScreenIntroduction')},
          ]}
          bubbleStyle={{height: 80}}
        />
        : null}
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
}

export default TodayScreen
