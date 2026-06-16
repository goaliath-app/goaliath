import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native';
import { Appbar, withTheme } from 'react-native-paper'
import { DayContent, Dialog, Header } from '../components'
import { getToday, serializeDate } from '../time'
import { updateLogs } from '../redux'


function todayScreenSelector(state){
  const dayStartHour = state.settings.dayStartHour
  const today = getToday(dayStartHour)

  return {
    dayStartHour,
    today,
  }
}

const TodayScreen = withTheme(({ navigation, theme }) => {
  const dispatch = useDispatch()

  const { t, i18n } = useTranslation()

  const { dayStartHour, today } = useSelector(todayScreenSelector)

  function updateDay(){
    if(serializeDate(date) != serializeDate(today)) {
      setDate(today)
      setDayChangeDialogVisible(true)
    }
  }

  const [ date, setDate ] = useState(today)
  const [ dayChangeDialogVisible, setDayChangeDialogVisible ] = useState(false)

  useEffect(() => {
    setDate(today)
  }, [serializeDate(today)])

  // effect to check every minute if current day has changed
  useEffect(() => {
      const intervalId = setInterval(() => {
        updateDay()
      }, 60000)
      return () => clearInterval(intervalId)  // this function executes before running the effect again
  }, [serializeDate(today), serializeDate(date), dayStartHour])

  useFocusEffect(
    React.useCallback(() => {
      dispatch(updateLogs())
    })
  );

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.todayScreenBackground}}>
      <Header title={t('today.headerTitle')} navigation={navigation}
        buttons={
          <Appbar.Action
            icon='cog'
            onPress={() => navigation.navigate('Settings')}
            color={theme.colors.headerContent}
            style={{ height: 48, width: 48 }}
          />
        }
      />

      <DayContent date={date}/>

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
