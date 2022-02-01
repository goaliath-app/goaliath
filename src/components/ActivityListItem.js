import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, IconButton, Text, Portal, Dialog, Divider, withTheme } from 'react-native-paper'
import * as Progress from 'react-native-progress';
import { getTodayTime, isActivityRunning, getPreferedExpression, roundValue } from '../util'
import { toggleCompleted, startTodayTimer, stopTodayTimer, selectAllActivities } from '../redux'
import PlayFilledIcon from '../../assets/play-filled'
import PlayOutlinedIcon from '../../assets/play-outlined'
import PauseFilledIcon from '../../assets/pause-filled'
import PauseOutlinedIcon from '../../assets/pause-outlined'
import { useTranslation } from 'react-i18next'
import MaterialCommunityIcons  from 'react-native-vector-icons/MaterialCommunityIcons'
import Checkbox from './Checkbox'
import { useSelector } from 'react-redux';
import { usesSelectWeekliesScreen, getFreeActivitiesWeekCompletionRatio } from '../activityHandler'


export const ActivityListItem = withTheme(({ 
  theme, activity, entry, date, left, description, bottom, style
}) => {
  const { t, i18n } = useTranslation()

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)

  function update(){
    const currentTime = getTodayTime(entry.intervals)
    setTodayTime(currentTime)
  }

  React.useEffect(() => {
    update()
    if (isActivityRunning(entry.intervals)) {
      const intervalId = setInterval(() => {
        update()
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [entry.intervals])

  const navigation = useNavigation()
  const [todayTime, setTodayTime] = React.useState(getTodayTime(entry.intervals))

  return(
    entry.archived?
    null :
    <>
      <StylishListItem
        style={[isActivityRunning(entry.intervals)?{backgroundColor: theme.colors.runningActivityBackground} : {}, style]}
        left={left}
        right={() => ( 
          todayTime.as('seconds') > 0?
          <Text style={styles.timeLabel}>{todayTime.toFormat('hh:mm:ss')}</Text> 
          : null
        )}
        title={activity.name}
        description={description}
        onLongPress={()=>setLongPressDialogVisible(true)}
        onPress={() => {
          navigation.navigate('ActivityDetail', {activityId: activity.id, date: date.toISO()})
        }}
        bottom={bottom}
      />

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible} onDismiss={() => {setLongPressDialogVisible(false)}}>
          <Dialog.Title>{activity.name}</Dialog.Title>
            <Dialog.Content>
              <Divider />
              <List.Item title={t("activityListItem.longPressMenu.edit")} onPress={() => {
                setLongPressDialogVisible(false)
                navigation.navigate('ActivityForm', { activityId: activity.id } )
              }} />
              <Divider />
              <List.Item title={t("activityListItem.longPressMenu.viewGoal")} onPress={() => {
                setLongPressDialogVisible(false)
                navigation.navigate('Goal', { goalId: activity.goalId } )
              }} />
              <Divider />
            </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  )
})

const legacy_ActivityListItem = ({ 
  timeGoal,    // number of seconds of the time goal for this activity or null if it is not a timed activity
  name,        // name of the activity
  repeatMode,      // 'daily' or 'weekly'
  weeklyTime,    // time spent this week, not counting today (just used in 'weekly' repeatMode activities)
  completed,   // boolean value
  timesPerWeek, // number of days that the activity should be completed each week
  weeklyTimes, // number of times that the activity has been done this week (counting today)
  intervals, 
  archived,
  id,
  toggleCompleted,
  startTodayTimer,
  stopTodayTimer,
  disabled,
  date
}) => {
  function update(){
    const currentTime = getTodayTime(intervals)
    setTodayTime(currentTime)
    const totalTime = weeklyTime?currentTime.plus(weeklyTime):currentTime
    if(timeGoal && totalTime.as('seconds') >= timeGoal && !completed){
      toggleCompleted({date: date, id: id})
    }
  }

  const { t, i18n } = useTranslation()

  React.useEffect(() => {
    update()
    if (isActivityRunning(intervals)) {
      const intervalId = setInterval(() => {
        update()
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [intervals, completed, timeGoal])

  function onPressPlay(){
    if(disabled) return
    startTodayTimer(id)
  }

  function onPressPause(){
    if(disabled) return
    stopTodayTimer(id)
  }

  const current = isActivityRunning(intervals)
  const [todayTime, setTodayTime] = React.useState(getTodayTime(intervals))
  
  const totalTime = weeklyTime?todayTime.plus(weeklyTime):todayTime
  const totalTimes = weeklyTimes?(weeklyTimes+(completed?1:0)):(completed?1:0)

  let leftSlot, rightSlot, description;

  if((!timeGoal && completed)){
    leftSlot = (
      <Checkbox 
        color='black'
        status='checked'
        onPress={() => {
          if(disabled) return
          toggleCompleted({date: date, id: id})
      }}/>
    )
  }else if(weeklyTimes?(totalTimes >= timesPerWeek):false){
    leftSlot = (
      <Checkbox 
        color='gray'
        status='checked'
        onPress={() => {
          return
      }}/>
    )
  }else if(!timeGoal && !completed){
    leftSlot = (
      <Checkbox 
        color='black'
        uncheckedColor='black'
        status='unchecked' 
        onPress={() => {
          if(disabled) return
          toggleCompleted({date: date, id: id})
      }}  />
    )
  }else if(timeGoal && current && !completed){
    leftSlot = <IconButton icon={() => <PauseOutlinedIcon />} onPress={onPressPause} />
  }else if(timeGoal && current && completed){
    leftSlot = <IconButton icon={() => <PauseFilledIcon />} onPress={onPressPause} />
  }else if(timeGoal && completed){
    leftSlot = (
      <IconButton 
        icon={() => <PlayFilledIcon />} 
        onPress={onPressPlay}  
      />)
  }else{
    leftSlot = <IconButton icon={() => <PlayOutlinedIcon />} onPress={onPressPlay} />
  }

  if((repeatMode == 'daily' || repeatMode == 'select') && timeGoal){
    const expression = getPreferedExpression(timeGoal, t)
    description = t('activityListItem.description.todayTimeGoal', { expressionValue: expression.value, expressionUnit: expression.localeUnit })
  }else if(repeatMode=='weekly' && timeGoal){
    const expression = getPreferedExpression(timeGoal, t)
    const weeklyTimeNumber = roundValue(totalTime.as(expression.unit))
    description = t('activityListItem.description.weekTimeGoal', {weeklyTimeNumber, expressionValue: expression.value, expressionUnit: expression.localeUnit})
  }

  if(todayTime.as('seconds') > 0){
    rightSlot = <Text style={styles.timeLabel}>{todayTime.toFormat('hh:mm:ss')}</Text>
  }

  const navigation = useNavigation();

  const progress = Math.min(totalTime.as('seconds') / timeGoal, 1)
  const weeklyProgress = weeklyTime?
    Math.min(weeklyTime.as('seconds') / timeGoal, 1) : 0

  return (
    archived? <></> : 
    <View style={{ backgroundColor: current? ActivityListItemColors.currentActivityBackground : ActivityListItemColors.listItemBackground }}>
      <List.Item
        left={() => leftSlot}
        title={name}
        description={description}
        right={() => rightSlot}
        onPress={() => {
          navigation.navigate('ActivityDetail', {activityId: id, date: date.toISO()})
        }}
      />
      {current?
        <DoubleProgressBar 
          height={4}
          firstColor={ActivityListItemColors.progressBarFirstColor} 
          secondColor={ActivityListItemColors.progressBarSecondColor} 
          backgroundColor={ActivityListItemColors.progressBarBackground} 
          firstProgress={weeklyProgress} 
          secondProgress={progress} />
      : <></> }
    </View>
  );
}

export const SelectWeekliesListItem = withTheme(({ theme, date, checked, navigation, disabled=false, style}) => {
  const { t, i18n } = useTranslation()

  const state = useSelector((state) => state)
  const activities = selectAllActivities(state)
  const weekActivities = activities.filter( activity => usesSelectWeekliesScreen(state, activity.id) )

  const weekActivitiesNumber = weekActivities.length
  const weekProgress = getFreeActivitiesWeekCompletionRatio(state, date)

  return(
    <StylishListItem
      left={() => <IconButton icon={() => checked? 
        <MaterialCommunityIcons color={theme.colors.todayCompletedIcon} name={"plus-box"} style={{ alignSelf: 'center'}} size={25} />
        : <MaterialCommunityIcons color={theme.colors.todayDueIcon} name={"plus-box-outline"} style={{ alignSelf: 'center'}} size={25} />
        } />
      }
      title={t('today.selectWeekliesTitle')}
      description={t('today.selectWeekliesDescription', {weekActivitiesNumber: weekActivitiesNumber, weekProgress: Math.round(weekProgress * 100)})}
      onPress={() => {disabled ? ()=>{} : navigation.navigate('SelectWeeklyActivities')}}
      style={style}
    />
  )
})

export const SelectTasksListItem = withTheme(({theme, checked, onPress, style}) => {
  const { t, i18n } = useTranslation()

  return(
    <StylishListItem
        left={() => <IconButton icon={() => checked? 
          <MaterialCommunityIcons color={theme.colors.todayCompletedIcon} name={"plus-box"} style={{ alignSelf: 'center'}} size={25} />
          : <MaterialCommunityIcons color={theme.colors.todayDueIcon} name={"plus-box-outline"} style={{ alignSelf: 'center'}} size={25} />
          } />}
        title={t('today.selectTasksTitle')}
        // description={t('today.selectTasksDescription')}
        onPress={onPress}
        style={style}
    />
  )
})

export const DoubleProgressBar = ({firstColor, secondColor, backgroundColor, firstProgress, secondProgress, height}) => (
  <View >
    <Progress.Bar progress={secondProgress} width={null} height={height} unfilledColor={backgroundColor} borderRadius={0} borderWidth={0} color={secondColor} />
    <Progress.Bar style={{position: 'absolute'}} progress={firstProgress} height={height} color={firstColor} unfilledColor={'transparent'} borderWidth={0} width={useWindowDimensions().width} borderRadius={0} />
  </View>
)

const styles = StyleSheet.create({
  iconButton: {
    margin: 0,
  },
  timeLabel: {
    alignSelf: 'center',
    marginRight: 12,
    fontSize: 15,
  },
})

export const StylishListItem = withTheme(({
  left,
  title,
  onPress,
  onLongPress,
  description,
  style,
  right,
  theme,
  bottom,
}) => {
  return(
    <View style={[{ 
      backgroundColor: theme.colors.activityBackground, 
      borderRadius: 15, 
      marginHorizontal: 1, 
      marginTop: 2,
      overflow: 'hidden',
      height: 67,
      justifyContent: 'center',
    }, style]}>
      <List.Item
        left={left}
        title={title}
        titleNumberOfLines={2}
        description={description}
        onPress={onPress}
        onLongPress={onLongPress}
        right={right}
      />
      <View style={{ 
        position: 'absolute', bottom: 0, left: 0, right: 0
      }}>
        {bottom ? bottom() : null}
      </View>
      
    </View>
  )
})
