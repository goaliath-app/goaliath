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
  
  const pluralUnitStrings = {
    'seconds': t('units.time.seconds'),
    'minutes': t('units.time.minutes'),
    'hours': t('units.time.hours')
  }
  const singularUnitStrings = {
    'seconds': t('units.time.second'),
    'minutes': t('units.time.minute'),
    'hours': t('units.time.hour')
  }
  const localeUnit = value == 1 ? singularUnitStrings[unit] : pluralUnitStrings[unit]

  return {value: value, unit, localeUnit}
}

export function secondsToUnit(seconds, unit){
  const duration = Duration.fromObject({seconds}).shiftTo('hours', 'minutes', 'seconds')
  const value = roundValue(duration.as(unit))
  return value
}

export function newEntry(activityId, placeholder=false){
  // Placeholder = true if this function is used to generate a
  // placeholder entry when there is not an entry for that activity
  // and date
  return(
    {
      intervals: [],
      repetitions: [],
      completed: null,
      id: activityId,
      archived: placeholder,
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

export function toDateTime(date){
  /* accepts ISO and DateTime as arguments
  returns DateTime */
  return DateTime.fromISO(date)
}

export function toISODate(date){
  /* accepts ISO and DateTime as arguments
  returns ISO */
  return DateTime.fromISO(date).toISO()
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

/* 
Returns the first value in an ordered array that is less than or equal to a 
target value

PARAMS:
  - array: array of ascending ordered values
  - value: value to find the previous value for
  - compareFunction: function that compares two values, returns true if
   the first value is less than the second value
*/ 
function getItemPreviousToValue(array, value, isLessThan){
  if(array.length == 0){
    return null
  }
  
  // for each item in the array
  for(let i = 0; i < array.length; i++){
    // if the item is greater than the value
    if(isLessThan(value, array[i])){
      // if the item is the first item in the array, there is no item
      // previous to the value
      if(i == 0){
        return null
      }
      // if it wasn't the first item, return the previous item
      return array[i-1]
    }
  }

  // the value is greater to every item in the array, so return the last element
  return array[array.length-1]
}

export function getPreviousDate(datesArray, date){
  function isLessThan(a, b){
    return DateTime.fromISO(a) < DateTime.fromISO(b)
  }

  return getItemPreviousToValue(datesArray, date, isLessThan)
}

export function getNewestDate(isoDatesList){
  const epoch = DateTime.fromMillis(0)

  const loggedDateTimes = isoDatesList.map((isoDate) => DateTime.fromISO(isoDate))
  
  const newestLogDate = loggedDateTimes.reduce((curr, prev) => {
    return curr>=prev? curr : prev
  }, epoch)

  return newestLogDate
}

// checks if b is between a and c
export function isBetween(a, b, c){
  return a <= b && b <= c
}