import { DateTime } from 'luxon'
import { 
  deleteEntry,
  startTimer,
  stopTimer,
  sortLog,
  capAllTimers as pureCapAllTimers,
  setWeekliesSelected,
} from './LogSlice'
import { getToday, serializeDate } from './../../time'

export function deleteOneTodaysEntry(entryId){
  return function(dispatch, getState){
    const { dayStartHour } = getState().settings
    const today = getToday(dayStartHour)
    dispatch(deleteEntry({date: today, entryId}))
  }
}

export function startTodayTimer(entryId){
  return function(dispatch, getState){
    const { dayStartHour } = getState().settings
    const today = getToday(dayStartHour)
    dispatch(startTimer({ date: today, id: entryId }))
  }
}

export function stopTodayTimer(entryId){
  return function(dispatch, getState){
    const { dayStartHour } = getState().settings
    const today = getToday(dayStartHour)
    dispatch(stopTimer({ date: today, id: entryId }))
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
      isoDate: serializeDate(date), 
      capIsoDate: serializeDate(capDate) 
    }))
  }
}

export function weekliesSelectedToday(){
  /* sets weekliesSelected of today to true */
  return function(dispatch, getState){
    const state = getState()
    const dayStartHour = state.settings.dayStartHour
    const today = getToday(dayStartHour)
    dispatch(setWeekliesSelected({ 
      date: today, 
      value: true
    }))
  }
}