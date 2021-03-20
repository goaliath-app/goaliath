import { DateTime } from 'luxon'

export function getTodayTime(intervals){
  if(!intervals) {return -1}
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
  return todayTime
}