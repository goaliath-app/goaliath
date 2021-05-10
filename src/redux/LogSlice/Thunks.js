import { DateTime } from 'luxon'
import { 
  deleteEntry,
  startTimer as pureStartTimer,
  stopTimer as pureStopTimer,
  sortLog,
  capAllTimers as pureCapAllTimers,
} from './LogSlice'
import { getToday } from './../../util'

export function deleteOneTodaysEntry(entryId){
  return function(dispatch, getState){
    const { dayStartHour } = getState().settings
    const today = getToday(dayStartHour)
    dispatch(deleteEntry({date: today, entryId}))
  }
}

export function startTimer(entryId){
  return function(dispatch, getState){
    const { dayStartHour } = getState().settings
    const today = getToday(dayStartHour)
    dispatch(pureStartTimer({ date: today, id: entryId }))
  }
}

export function stopTimer(entryId){
  return function(dispatch, getState){
    const { dayStartHour } = getState().settings
    const today = getToday(dayStartHour)
    dispatch(pureStopTimer({ date: today, id: entryId }))
  }
}

export function sortTodayLog(){
  return function(dispatch, getState){
    const { dayStartHour } = getState().settings
    const today = getToday(dayStartHour)
    dispatch(sortLog({ date: today }))
  }
}

export function capAllTimers({ date }){
  return function(dispatch, getState){
    const state = getState()
    const dayStartHour = state.settings.dayStartHour
    const capDate = date.plus({ days: 1, hours: dayStartHour.hours, minutes: dayStartHour.minutes })
    dispatch(pureCapAllTimers({ 
      isoDate: date.toISO(), 
      capIsoDate: capDate.toISO() 
    }))
  }
}