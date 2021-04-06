import { useStore } from 'react-redux'
import { DateTime } from 'luxon'
import Duration from 'luxon/src/duration.js'
import { selectEntriesByDay, selectActivityById, selectAllWeekEntriesByActivityId } from './redux'

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

export function getPreferedExpression(duration){
  if(!Duration.isDuration(duration)){
    duration = Duration.fromObject({seconds: duration}).shiftTo('hours', 'minutes', 'seconds')
  }
  const unit = getPreferedExpressionUnit(duration)
  const value = roundValue(duration.as(unit))
  return {value: value, unit: unit}
}


export function extractActivityLists(state, day){
  let dayActivities = [] 
  let weekActivities = []

  const logs = selectEntriesByDay(state, day)

  for(let log of logs){
    const activity = selectActivityById(state, log.id)
    const fullLog = {...activity, ...log, date: day}

    if(!(fullLog.repeatMode == 'weekly')){
      dayActivities.push(fullLog)
    }else{
      // we have to calculate and inyect weeklyTime and weeklyTimes
      let weeklyTime = Duration.fromMillis(0).shiftTo('hours', 'minutes', 'seconds')
      let weeklyTimes = 0

      const weekLogs = selectAllWeekEntriesByActivityId(state, fullLog.id, day)

      for(let day in weekLogs){
        weeklyTime = weeklyTime.plus(getTodayTime(weekLogs[day].intervals))
        weeklyTimes += weekLogs[day].completed?1:0
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
export function frequency(activity){
  let frequency 
    switch(activity.repeatMode){
      case 'weekly':
        if(activity.goal=='check'){
          frequency = `${activity.timesPerWeek} days per week.`
        }else{
          const expression = getPreferedExpression(activity.timeGoal)
          frequency = `${expression.value} ${expression.unit} per week.`
        }
        break
      case 'select':
        let days = ''
        const labels = {1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun'}
        for (let day in activity.weekDays){
          if (activity.weekDays[day]){
            days = `${days} ${labels[day]}`
          }
        }
        if(activity.goal=='check'){
          frequency = `Do on ${days}`
        }else{
          const expression = getPreferedExpression(activity.timeGoal)
          frequency = `${expression.value} ${expression.unit} on ${days}`
        }
        break
      case 'daily':
        if(activity.goal=='check'){
          frequency = "Every day."
        }else{
          const expression = getPreferedExpression(activity.timeGoal)
          frequency = `${expression.value} ${expression.unit} every day.`
        }
        break
      default:
        frequency = 'ERROR'
    }
  return (frequency)
}