import { DateTime } from 'luxon'
import Duration from 'luxon/src/duration.js'

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
      completed: null, 
      id: activity.id,
      archived: false
    }
  )
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

export function toDateTime(date){
  /* accepts ISO and DateTime as arguments
  returns DateTime */
  return DateTime.fromISO(date)
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
