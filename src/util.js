import { useStore } from 'react-redux'
import { DateTime } from 'luxon'
import Duration from 'luxon/src/duration.js'
import { 
  selectEntriesByDay, selectActivityById, selectAllWeekEntriesByActivityId,
  selectActivityEntities, selectGoalById, selectAllActivities, selectGoalEntities,
  findActivityRecord,
} from './redux'

export function hasSomethingToShow(list){
  /* list can be a list of goals, activities, entries and fullLogs */
  for(let item of list){
    if(item.entry?.archived !== undefined && !item.entry.archived){
      return true
    }else if(item.archived !== undefined && !item.archived){
      return true
    }
  }
  return false
}

export function getTodayTime(intervals){
  if(!intervals) {return Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')}
  let todayTime = 0
  for(let interval of intervals){
    if(interval.startDate && interval.endDate){
      const startDate = DateTime.fromISO(interval.startDate)
      const endDate = DateTime.fromISO(interval.endDate)
      todayTime += Math.floor(endDate.diff(startDate, 'seconds').get('seconds'))
    }else if(interval.startDate && !interval.endDate){
      const startDate = DateTime.fromISO(interval.startDate)
      todayTime -= Math.floor(startDate.diffNow("seconds").get('seconds'))  // this returns a negative number
    }
  }
  return Duration.fromObject({seconds: todayTime}).shiftTo('hours', 'minutes', 'seconds')
}

export function isActivityRunning(intervals){
  const lastInterval = intervals.slice(-1)[0]
  if(lastInterval?.startDate && !lastInterval?.endDate){
    return true
  }else{
    return false
  }
}

function getPreferedExpressionUnit(duration){
  if(duration.as('seconds') < 60){
    return 'seconds'
  }
  if (duration.as('minutes') < 60){
    return 'minutes'
  }
  return 'hours'
}

export function roundValue(value){
  return Math.round((value + Number.EPSILON) * 10) / 10
}

export function getPreferedExpression(duration, t){
  if(!Duration.isDuration(duration)){
    duration = Duration.fromObject({seconds: duration}).shiftTo('hours', 'minutes', 'seconds')
  }
  const unit = getPreferedExpressionUnit(duration)
  const value = roundValue(duration.as(unit))
  const unitStrings = {
    'seconds': t('units.time.seconds'),
    'minutes': t('units.time.minutes'),
    'hours': t('units.time.hours')
  }
  return {value: value, unit, localeUnit: unitStrings[unit]}
}

export function newEntry(activity){
  return(
    {
      intervals: [], 
      completed: false, 
      id: activity.id,
      archived: false
    }
  )
}

export function selectAllActiveActivities(state){
  /* returns a list of all activities that:
  - are not disabled or archived
  - belong to goals that are not disabled or archived */
  const allActivities = selectAllActivities(state)
  const goalEntities = selectGoalEntities(state)

  const activeActivities = allActivities.filter(activity => {
    const goal = goalEntities[activity.goalId]
    return(
      activity.active && !activity.archived && goal.active && !goal.archived 
    )
  })

  return activeActivities
}

export function selectActivityByIdAndDate(state, activityId, date){
  const activityRecord = findActivityRecord(state, activityId, date)
  
  if(activityRecord) {
    return activityRecord
  }else{
    return selectActivityById(state, activityId)
  }
}


export function getWeeklyStats(state, day, activityId){
  /* counting all entries of that week up to the day specified
  ignores given and later days. */

  let weeklyTime = Duration.fromMillis(0).shiftTo('hours', 'minutes', 'seconds')
  let daysDoneCount = 0
  let daysDoneList = []
  let repetitionsCount = 0

  const weekLogs = selectAllWeekEntriesByActivityId(state, activityId, day)

  for(let thatDay in weekLogs){
    if(day.weekday-1==thatDay){
      break
    }
    weeklyTime = weeklyTime.plus(getTodayTime(weekLogs[thatDay].intervals))
    if(weekLogs[thatDay].completed){
      daysDoneCount += 1
      daysDoneList.push(parseInt(thatDay)+1)
    }
    repetitionsCount += weekLogs[thatDay].repetitions? weekLogs[thatDay].repetitions : 0
  }

  return {weeklyTime, daysDoneCount, daysDoneList, repetitionsCount}
}

export function extractActivityList(state, day){
  let activityList = [] 
  var entries

  if(day > getToday(state.settings.dayStartHour)){
    entries = predictEntries(state, day)
  }else{
    entries = selectEntriesByDay(state, day)
  }

  for(let entry of entries){
    const activity = selectActivityById(state, entry.id)
    let fullEntry = {entry, activity, date: day}

    if(fullEntry.repeatMode == 'weekly'){
      const { weeklyTime, daysDoneCount } = getWeeklyStats(state, day, fullEntry.id)

      fullEntry = {...fullEntry, weeklyTime, weeklyTimes: daysDoneCount}
    }

    activityList.push(fullEntry)
  }

  return activityList
}

export function isToday(date, dayStartDate){
  /* accepts both ISO and DateTime as arguments */
  if(!date) return false
  date = DateTime.fromISO(date)
  dayStartDate = DateTime.fromISO(dayStartDate)
  const today = getToday(dayStartDate)
  return today.toISO() == date.toISO()
}

export function isFuture(date, dayStartDate){
  /* accepts both ISO and DateTime as arguments */
  if(!date) return false
  date = DateTime.fromISO(date)
  dayStartDate = DateTime.fromISO(dayStartDate)
  const today = getToday(dayStartDate)
  return today.toISO() < date.toISO()
}

export function startOfDay(date, dayStartDate){
  /* accepts both ISO and DateTime as arguments
  returns DateTime */
  const dayStart = DateTime.fromISO(dayStartDate)
  date = DateTime.fromISO(date)
  const naturalStartOfDay = date.startOf('day')
  if( date.hour < dayStart.hour
    || date.hour == dayStart.hour && date.minute < dayStart.minute ){
      return naturalStartOfDay.minus({ days: 1 })
    }else{
      return naturalStartOfDay
    }
}

export function startOfWeek(date, dayStartDate){
  /* accepts both ISO and DateTime as arguments
  returns DateTime */
  const day = startOfDay(date, dayStartDate)
  return day.startOf('week')
}

export function getTodaySelector(state){
  /* returns DateTime */
  const dayStartHour = state.settings.dayStartHour
  return startOfDay(DateTime.now(), dayStartHour)
}

export function getToday(dayStartHour){
  /* accepts both ISO and DateTime as arguments
  returns DateTime */
  return startOfDay(DateTime.now(), dayStartHour)
}

export function dueToday(today, activity, activityGoal){
  if( !isActive(activity, activityGoal) ){
    return false
  }
  if(activity.repeatMode == 'daily'){
    return true
  }
  if(activity.repeatMode == 'select'){
    if(activity.weekDays[today.weekday]){
      return true
    }
  }
  return false
}

export function isActive(activity, activityGoal){
  if(activity.archived || activityGoal.archived){
    return false
  }
  if(!activity.active || !activityGoal.active){
    return false
  }
  return true
}

/**
 * Get the entries of the activities that would be due on a specific day given
 * the current activities and goals.
 * @param  {object}         state The whole redux state
 * @param  {Luxon.DateTime} day   Date to predict (dayStartHour adjustments
 * wont be applied)
 * @return {list of objects}      List of entries predicted for that day            
 */
export function predictEntries(state, day){
  let entries = []

  const activities = selectActivityEntities(state)
  for(let activityId in activities){
    const activity = activities[activityId]
    const goal = selectGoalById(state, activity.goalId)

    if(dueToday(day, activity, goal)){
      entries.push(newEntry(activity))
    }
  }

  return entries
}