import { DateTime } from 'luxon'
import Duration from 'luxon/src/duration.js'

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