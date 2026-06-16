import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, IconButton, Text, Portal, Dialog, Divider, withTheme } from 'react-native-paper'
import * as Progress from 'react-native-progress';
import { isActivityRunning } from '../util'
import { getTodayTime } from '../time';
import { selectAllActivities } from '../redux'
import { useTranslation } from 'react-i18next'
import MaterialCommunityIcons  from 'react-native-vector-icons/MaterialCommunityIcons'
import { usesSelectWeekliesScreen, getFreeActivitiesWeekCompletionRatio } from '../activityHandler'
import { TodayPannelModal } from '../screens/ActivityDetailScreen/TodayPannel';
import { DeleteGoalDialog, useTooltip } from '.';
import { TooltipChildrenContext } from 'react-native-walkthrough-tooltip';


export const ActivityListItemLeftTooltip = withTheme(({ content, theme, children, name='ActivityListItemLeftIcon', tooltipKey }) => {
  const LeftIconTooltip = useTooltip(name, tooltipKey)

  return(
    <LeftIconTooltip displayInsets={{left: 4, right: 0, top: 0, bottom: 0}} content={content}>
      <TooltipChildrenContext.Consumer>
      {({ tooltipDuplicate }) => (
        <View style={ tooltipDuplicate ? {backgroundColor: theme.colors.activityBackground, borderRadius: 90} : {}}>
          {children}
        </View>
      )}
      </TooltipChildrenContext.Consumer>
    </LeftIconTooltip>
  )
})

export const ActivityListItem = withTheme(({ 
  theme, activity, goal, entry, date, left, description, bottom, style,
  leftTooltipText, leftTooltipName, leftTooltipKey,
}) => {
  const { t, i18n } = useTranslation()

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)
  const [ isTodayPannelVisible, setTodayPannelVisible ] = React.useState(false)

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
          setTodayPannelVisible(true)
        }}
        bottom={bottom}
        leftTooltipName={leftTooltipName}
        leftTooltipText={leftTooltipText}
        leftTooltipKey={leftTooltipKey}
      />

      {/* ActivityDetail modal */}
      <TodayPannelModal 
        date={date}
        entry={entry}
        activity={activity}
        goal={goal}
        visible={isTodayPannelVisible}
        onDismiss={()=>setTodayPannelVisible(false)}
      />

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible} 
          onDismiss={() => {setLongPressDialogVisible(false)}}
          style={{backgroundColor: theme.colors.dialogBackground}}>
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

// This logic is implemented as a separate selector to avoid unnecesary re-renders
// caused by reference comparison of diferent useSelector results
function selectNumberOfWeeklyActivities(state){
  const activities = selectAllActivities(state)
  const weekActivities = activities.filter( activity => usesSelectWeekliesScreen(state, activity.id) )
  return weekActivities.length
}

export const SelectWeekliesListItem = withTheme(({ theme, date, checked, navigation, disabled=false, style}) => {
  const { t, i18n } = useTranslation()

  const Tooltip = useTooltip('selectWeekliesListItem', 'selectWeekliesListItem')

  // selectors
  const weekActivitiesNumber = useSelector(selectNumberOfWeeklyActivities)
  const weekProgress = useSelector(state => getFreeActivitiesWeekCompletionRatio(state, date))

  return(
    <Tooltip
      content={<Text style={{fontSize: 16}}>{t('tooltips.selectWeekliesListItem')}</Text>}
      displayInsets={{top: 0, bottom: 0, left: 50, right: 50}}
      placement="bottom"
      childrenWrapperStyle={{width: '100%'}}
    >
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
    </Tooltip>
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
  leftTooltipText="",
  leftTooltipName="stylishListItemLeftTooltip",
  leftTooltipKey="",
}) => {
  if(leftTooltipText && left){
    const leftElement = left()
    left = () => (
      <ActivityListItemLeftTooltip name={leftTooltipName} content={<Text style={{fontSize: 16}}>{leftTooltipText}</Text>} tooltipKey={leftTooltipKey}>
        {leftElement}
      </ActivityListItemLeftTooltip>
    )
  }

  return(
    <View style={[{ 
      width: '100%',
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
