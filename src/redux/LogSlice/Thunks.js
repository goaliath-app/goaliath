import { DateTime } from 'luxon'
import { 
  deleteEntry,
  startTimer,
  stopTimer,
  sortLog,
  capAllTimers as pureCapAllTimers,
  setWeekliesSelected,
  addTask,
  setTasksAdded,
  deleteTask,
} from './LogSlice'
import { getToday } from './../../util'

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
      isoDate: date.toISO(), 
      capIsoDate: capDate.toISO() 
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

export function tasksAddedToday(){
  /* sets tasksAdded of today to true */
  return function(dispatch, getState){
    const state = getState()
    const dayStartHour = state.settings.dayStartHour
    const today = getToday(dayStartHour)
    dispatch(setTasksAdded({ 
      date: today, 
      value: true
    }))
  }
}

export function addTodayTask(name){
  return function(dispatch, getState){
    const state = getState()
    const dayStartHour = state.settings.dayStartHour
    const today = getToday(dayStartHour)
    const task = { name, completed: false }
    dispatch(addTask({ date: today, task }))
  }
}

export function deleteTodayTask(id){
  return function(dispatch, getState){
    const state = getState()
    const dayStartHour = state.settings.dayStartHour
    const today = getToday(dayStartHour)
    dispatch(deleteTask({ date: today, id }))
  }
}