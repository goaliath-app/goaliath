import { DateTime } from 'luxon'
import { roundValue } from './util'
import Duration from 'luxon/src/duration.js'

/**
 * Given a list of time intervals of the form {startDate, endDate}
 * Return a Luxon Duration object with the total time between all the
 * intervals.
 */
export function getTodayTime(intervals){
  if(!intervals) {return Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')}
  let todayTime = 0
  for(let interval of intervals){
    if(interval.startDate && interval.endDate){
      const startDate = deserializeDate(interval.startDate)
      const endDate = deserializeDate(interval.endDate)
      todayTime += Math.floor(endDate.diff(startDate, 'seconds').get('seconds'))
    }else if(interval.startDate && !interval.endDate){
      const startDate = deserializeDate(interval.startDate)
      todayTime -= Math.floor(startDate.diffNow("seconds").get('seconds'))  // this returns a negative number
    }
  }
  return Duration.fromObject({seconds: todayTime}).shiftTo('hours', 'minutes', 'seconds')
}

export function isToday(date, dayStartDate){
  /* accepts both ISO and DateTime as arguments */
  if(!date) return false
  date = deserializeDate(date)
  dayStartDate = deserializeDate(dayStartDate)
  const today = getToday(dayStartDate)
  return serializeDate(today) == serializeDate(date)
}

export function isFuture(date, dayStartDate){
  /* accepts both ISO and DateTime as arguments */
  if(!date) return false
  date = deserializeDate(date)
  dayStartDate = deserializeDate(dayStartDate)
  const today = getToday(dayStartDate)
  return serializeDate(today) < serializeDate(date)
}

/**
 * If the HH:MM of date is later than that of
 * dayStartDate, returns date with the hour set to 00:00.
 * Else, returns date minus one day set to 00:00.
 */
export function startOfDay(date, dayStartDate){
  /* accepts both ISO and DateTime as arguments
  returns DateTime */
  const dayStart = deserializeDate(dayStartDate)
  date = deserializeDate(date)
  const naturalStartOfDay = date.startOf('day')
  if( date.hour < dayStart.hour
    || date.hour == dayStart.hour && date.minute < dayStart.minute ){
      return naturalStartOfDay.minus({ days: 1 })
    }else{
      return naturalStartOfDay
    }
}

/**
 * Returns the date of the week start with HH:MM set to 00:00
 * having dayStartDate into account (check startOfDay function)
 */
export function startOfWeek(date, dayStartDate){
  /* accepts both ISO and DateTime as arguments
  returns DateTime */
  const day = startOfDay(date, dayStartDate)
  return day.startOf('week')
}

/**
 * Returns today's date with HH:MM set to 00:00 having
 * dayStartDate into account (check startOfDay function).
 */
export function getToday(dayStartHour){
  /* accepts both ISO and DateTime as arguments
  returns DateTime */
  return startOfDay(DateTime.now(), dayStartHour)
}

/**
 * Serializes a luxon datetime into a string DATE (without hour or timezone)
 * @param {DateTime} date Luxon DateTime
 * @returns A string of the form "YYYY-MM-DD"
 */
export function serializeDate(date){
  /* accepts ISO and DateTime as arguments
  returns ISO */
  return DateTime.fromISO(date).toISO()
}

/**
 * @param {string} value A string of the form "YYYY-MM-DD"
 * @returns A luxon datetime of that date, time 00:00 in the local timezone
 */
export function deserializeDate(value){
  return DateTime.fromISO(value)
}

/**
 * UNUSED
 * @param {DateTime} date Luxon DateTime
 * @returns A string representing the exact time without time zone information
 */
export function serializeTimestamp(date){
  /* accepts ISO and DateTime as arguments
  returns ISO */
  return DateTime.fromISO(date).toISO()
}

/**
 * UNUSED
 * @param {String} date A string representing the exact time without time zone information
 * @returns A luxon datetime of that moment in the local timezone
 */
export function deserializeTimestamp(value){
  return DateTime.fromISO(value)
}

/**
 * UNUSED
 * @param {DateTime} date Luxon DateTime
 * @returns A HH:MM:SS string representing the hour of the DateTime in the DateTime timezone
 */
export function serializeHour(date){
  /* accepts ISO and DateTime as arguments
  returns ISO */
  return DateTime.fromISO(date).toISO()
}

/**
 * UNUSED
 * @param {String} date A HH:MM:SS string
 * @returns A luxon datetime of the current day with that HH:MM:SS in the local timezone
 */
export function deserializeHour(value){
  return DateTime.fromISO(value)
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

/**
 * Given datesArray (a list of dates) and a date, returns the
 * latest date in datesArray that is previous to date.
 * If there is none, returns the epoch date.
 */
export function getPreviousDate(datesArray, date){
  function isLessThan(a, b){
    return deserializeDate(a) < deserializeDate(b)
  }

  return getItemPreviousToValue(datesArray, date, isLessThan)
}

/**
 * Given an list of ISO dates, returns the latest date.
 */
export function getNewestDate(isoDatesList){
  const epoch = DateTime.fromMillis(0)

  const loggedDateTimes = isoDatesList.map((isoDate) => deserializeDate(isoDate))

  const newestLogDate = loggedDateTimes.reduce((curr, prev) => {
    return curr>=prev? curr : prev
  }, epoch)

  return newestLogDate
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