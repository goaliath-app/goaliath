import { createSlice, createEntityAdapter} from '@reduxjs/toolkit'
import { DateTime } from 'luxon';
import { getTodaySelector } from './selectors'
import { serializeDate } from '../time';

/* SLICE DESCRIPTION

The slice is:
  {
    ids: array of all daily entries (which are dates),
    entities: { [entryId]: entry }
  }

Each daily entry is:
  {
    id: Date,
    tasksAdded: boolean, true if the user tapped the add tasks button (even if they added 0 tasks),
    tasks: { 
      nextId: next id to be used for a new task (autoincremented)
      ids: array of all task ids,
      entities: { [taskId]: task }
    }
  }

A task is:
  {
    id: id for this entry,
    name: name of the task,
    completed: bool,
  }

*/

const entityAdapter = createEntityAdapter();
const initialState = entityAdapter.getInitialState();

function getOrCreateDay(state, date){
  const existingDateEntry = state.entities[serializeDate(date)]
  if(existingDateEntry){
    return existingDateEntry
  }
  const dateEntry = {
    id: serializeDate(date),
    tasksAdded: false,
    tasks: entityAdapter.getInitialState({nextId: 0}),
  }
  state = entityAdapter.addOne(state, dateEntry)
  return dateEntry
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasksAdded(state, action){
      const { date, value } = action.payload
      const selectedDay = getOrCreateDay(state, serializeDate(date))
      selectedDay.tasksAdded = value
    },
    addTask(state, action){
      const { date, task } = action.payload
      const selectedDay = getOrCreateDay(state, serializeDate(date))
      selectedDay.tasks = entityAdapter.addOne(selectedDay.tasks, {...task, id: selectedDay.tasks.nextId})
      selectedDay.tasks.nextId += 1
    },
    toggleTask(state, action){
      const { date, id } = action.payload
      const selectedDay = getOrCreateDay(state, serializeDate(date))
      const task = selectedDay.tasks.entities[id]
      const completed = task.completed? null : serializeDate(DateTime.now())
      selectedDay.tasks = entityAdapter.updateOne(selectedDay.tasks, {id: task.id, changes: { completed }})
    },
    deleteTask(state, action){
      const { date, id } = action.payload
      const selectedDay = getOrCreateDay(state, serializeDate(date))
      selectedDay.tasks = entityAdapter.removeOne(selectedDay.tasks, id)
    },
    setState(state, action){
      const { newState } = action.payload
      return newState
    }
  }
})

export const { setState } = tasksSlice.actions

export default tasksSlice.reducer


const { 
  addTask, setTasksAdded, toggleTask: toggleTaskAction, deleteTask: deleteTaskAction,
} = tasksSlice.actions

const { 
  selectById: selectEntryById
} = entityAdapter.getSelectors(state => state.tasks)


/* SELECTORS */
export function areTasksAdded(state, date){
  const isoDate = serializeDate(date)
  const entry = selectEntryById(state, isoDate)
  return entry?.tasksAdded? entry.tasksAdded : false
}

export function selectAllTasksByDate(state, date){
  const isoDate = serializeDate(date)
  
  const tasks = state.tasks.entities[isoDate]?.tasks
  if(!tasks) return []

  const { selectAll: selectAllTasks } = entityAdapter.getSelectors()
  const taskList = selectAllTasks(tasks)
  if(!taskList) return []

  return taskList
}

/* THUNKS */
export function addTodayTask(name){
  return function(dispatch, getState){
    const state = getState()
    const today = getTodaySelector(state)
    const task = { name, completed: null }
    dispatch(addTask({ date: today, task }))
  }
}

export function deleteTask(date, id){
  return function(dispatch, getState){
    dispatch(deleteTaskAction({ date, id }))
  }
}

export function tasksAddedToday(){
  /* sets tasksAdded of today to true */
  return function(dispatch, getState){
    const state = getState()
    const today = getTodaySelector(state)
    dispatch(setTasksAdded({ 
      date: today, 
      value: true
    }))
  }
}

export function toggleTask(date, id){
  return function(dispatch, getState){
    dispatch(toggleTaskAction({ date, id }))
  }
}