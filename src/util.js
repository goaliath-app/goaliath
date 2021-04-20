import { useStore } from 'react-redux'
import { DateTime } from 'luxon'
import Duration from 'luxon/src/duration.js'
import { selectEntriesByDay, selectActivityById, selectAllWeekEntriesByActivityId } from './redux'

export function hasSomethingToShow(activityList){
  /* also works for lists of goals and entries */
  for(let activity of activityList){
    if(!activity.archived){
      return true
    }
  }
  return false
}

export function getTodayTime(intervals){
  if(!intervals) {return 0}
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

export function extractActivityLists(state, day, predictedEntries){
  let dayActivities = [] 
  let weekActivities = []
  var logs
  if(predictedEntries){
    logs = predictedEntries
  }else{
    logs = selectEntriesByDay(state, day)
  }
  // const logs = (
  //   predictedEntries !== null?
  //     predictedEntries
  //     :
  //     selectEntriesByDay(state, day)
  // )
  //const logs = selectEntriesByDay(state, day)

  for(let log of logs){
    const activity = selectActivityById(state, log.id)
    const fullLog = {...activity, ...log, date: day}

    if(!(fullLog.repeatMode == 'weekly')){
      dayActivities.push(fullLog)
    }else{
      // we have to calculate and inyect weeklyTime and weeklyTimes (not counting today or future days)
      let weeklyTime = Duration.fromMillis(0).shiftTo('hours', 'minutes', 'seconds')
      let weeklyTimes = 0

      const weekLogs = selectAllWeekEntriesByActivityId(state, fullLog.id, day)

      for(let thatDay in weekLogs){
        if(day.weekday-1==thatDay){
          break
        }
        weeklyTime = weeklyTime.plus(getTodayTime(weekLogs[thatDay].intervals))
        weeklyTimes += weekLogs[thatDay].completed?1:0
      }
      weekActivities.push({ ...fullLog, weeklyTime, weeklyTimes })
    }
  }

  return { dayActivities, weekActivities }
}

export function isToday(date, dayStartDate){
  /* accepts both ISO and DateTime as arguments */
  if(!date) return false
  date = DateTime.fromISO(date)
  dayStartDate = DateTime.fromISO(dayStartDate)
  const today = getToday(dayStartDate)
  return today.toISO() == date.toISO()
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
export function frequency(activity, t){
  let frequency 
    switch(activity.repeatMode){
      case 'weekly':
        if(activity.goal=='check'){
          frequency = t('util.frequency.weekly.check', { activityTimesPerWeek: activity.timesPerWeek })
        }else{
          const expression = getPreferedExpression(activity.timeGoal, t)
          frequency = t('util.frequency.weekly.time', { expressionValue: expression.value, expressionUnit: expression.localeUnit })
        }
        break
      case 'select':
        let days = ''
        const labels = {
          1: t('units.dayNamesShort2.monday'), 
          2: t('units.dayNamesShort2.tuesday'), 
          3: t('units.dayNamesShort2.wednesday'), 
          4: t('units.dayNamesShort2.thursday'), 
          5: t('units.dayNamesShort2.friday'), 
          6: t('units.dayNamesShort2.saturday'), 
          7: t('units.dayNamesShort2.sunday')
        }
        for (let day in activity.weekDays){
          if (activity.weekDays[day]){
            days = `${days} ${labels[day]}`
          }
        }
        if(activity.goal=='check'){
          frequency = t('util.frequency.select.check', { days })
        }else{
          const expression = getPreferedExpression(activity.timeGoal, t)
          frequency = t('util.frequency.select.time', { expressionValue: expression.value, expressionUnit: expression.localeUnit, days })
        }
        break
      case 'daily':
        if(activity.goal=='check'){
          frequency = t('util.frequency.daily.check')
        }else{
          const expression = getPreferedExpression(activity.timeGoal, t)
          frequency = t('util.frequency.daily.time', { expressionValue: expression.value, expressionUnit: expression.localeUnit })
        }
        break
      default:
        frequency = t('util.frequency.error')
    }
  return (frequency)
}

export function dueToday(today, activity, activityGoal){
  if(activity.archived || activityGoal.archived){
    return false
  }
  if(!activity.active || !activityGoal.active){
    return false
  }
  if(activity.repeatMode == 'daily'){
    return true
  }
  if(activity.repeatMode == 'weekly'){
    return true
  }
  if(activity.repeatMode == 'select'){
    if(activity.weekDays[today.weekday]){
      return true
    }
  }
  return false
}