import { createSlice, createEntityAdapter} from '@reduxjs/toolkit'
import { serializeDate, getPreviousDate, getNewestDate, deserializeDate } from '../time'
import { getTodaySelector } from './selectors'

// TODO: This slice is essentially a copy of ActivitySlice
// The logic for the slice of entities with change log should be generalized
// (It may even be published)
// This will also be useful when we make the logic for generating the actual
// change log for both activities and goals.

/* SLICE DESCRIPTION

The slice is:
  {
    ids: array of all goal ids,
    entities: { [goalId]: goalRecord }
  }

Each goal record is:
  {
    id: id of the goal it relates to,
    entries: { 
      ids: array of all entry ids (dates),
      entities: { [entryId]: entry } 
    }
  }

An entry is:
  {
    id: date of the entry, when an entry is selected it will be replaced by the goalId
    name: str, 
    motivation: str, 
    active: bool, 
    id: str,
    archived: bool, is marked true when the goal is "deleeted"
  }

An entry is created for a goal whenever it is created, with the current
date as the id.

Whenever a goal is modified, activated, deactivated or archived, another
entry is created with the current date as the id.

If a goal suffers multiple changes in a day, each change replaces
the existing entry for that day. This way, each day's entry holds the goal
state at the end of the day.

When you select a goal, you get the latest entry.

When you select and goal at a given date, you get the entry for that date,
of, if it does not exist, the latest entry previous to that date. If there is no
entry previous to that date you'll get null, meaning that the goal did not exist
at that date.

*/


const entityAdapter = createEntityAdapter();
const initialState = entityAdapter.getInitialState({nextId: 0});

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setGoal(state, action){
      const { goal, date } = action.payload

      // if is a new goal, set id and create its initial state
      if(goal.id == null || !state.entities[goal.id]){
        goal.id = state.nextId
        goal.archived = false
        goal.active = true

        state.nextId += 1

        entityAdapter.addOne(state, {
            id: goal.id,
            entries: entityAdapter.getInitialState()
        })

      }

      // insert the goal data into the given date
      // ( using custom function because goalAdapter's one wont work
      //   with state created in the same action dispatch )
      setOne(state.entities[goal.id].entries, {...goal, id: serializeDate(date)})

      return state
    },
    
    deleteGoalRecordsByDate(state, action){
      const { date } = action.payload

      state.ids.forEach(id => {
        entityAdapter.removeOne(state.entities[id].entries, serializeDate(date))
      })
    },

    setState(state, action){
      const { newState } = action.payload
      return newState
    }
  }
})

const { 
  setGoal: setGoalAction,
} = goalsSlice.actions

export const {
  deleteGoalRecordsByDate,
  setState,
} = goalsSlice.actions

export default goalsSlice.reducer

// THUNKS
export function setGoal(goal){
  return function(dispatch, getState){
    const today = getTodaySelector(getState())
    dispatch(setGoalAction({goal, date: today}))
  }
}

export function toggleGoal(goalId){
  return function(dispatch, getState){
    const goal = selectGoalById(getState(), goalId)
    const toggledGoal = {...goal, active: !goal.active}
    dispatch(setGoal(toggledGoal))
  }
}

export function archiveGoal(goalId){
  return function(dispatch, getState){
    const goal = selectGoalById(getState(), goalId)
    const archivedGoal = {...goal, archived: true}
    dispatch(setGoal(archivedGoal))
  }
}

export function restoreGoal(goalId){
  return function(dispatch, getState){
    const goal = selectGoalById(getState(), goalId)
    const restoredGoal = {...goal, archived: false}
    dispatch(setGoal(restoredGoal))
  }
}

// function that moves all records from the given date to the previous day,
// used when there is a day regresion caused by a dayStartHour change.
export function moveAllGoalRecordsOneDayBack(date){
  return function(dispatch, getState){
    const state = getState()

    const dateEntries = selectAllEntriesByDate(state, date)

    const previousDay = date.minus({ days: 1 })

    dateEntries.forEach(entry => {
      dispatch(setGoal(entry, previousDay))
      setGoalAction({goal: entry, date: previousDay})
    })

    dispatch(deleteGoalRecordsByDate({ date }))

  }
}


// SELECTORS
export function selectGoalByIdAndDate(state, goalId, date){
  const goalState = state.goals.entities[goalId]
  if(!goalState) return null

  const correspondingEntryDate = getPreviousDate(goalState.entries.ids, date)
  if(!correspondingEntryDate) return null

  const entry = goalState.entries.entities[serializeDate(correspondingEntryDate)]
  return { ...entry, id: goalId }
}

export function selectGoalById(state, goalId){
  const today = getTodaySelector(state)
  return selectGoalByIdAndDate(state, goalId, today)
}

// return a array of all goals for the given date, including disabled
// and archived ones
export function selectAllGoalsByDate(state, date){
  const goalList = []

  state.goals.ids.forEach(id => {
    const goal = selectGoalByIdAndDate(state, id, date)
    if(goal) goalList.push(goal)
  })

  return goalList
}

export function selectAllActiveGoalsByDate(state, date){
  return selectAllGoalsByDate(state, date).filter(goal => goal.active && !goal.archived)
}

export function selectAllGoals(state){
  const today = getTodaySelector(state)
  return selectAllGoalsByDate(state, today)
}

// selects all entries saved on a given date. Does not search in other days
export function selectAllEntriesByDate(state, date){
  const entries = []

  state.goals.ids.forEach(id => {
    const entry = state.goals.entities[id].entries.entities[serializeDate(date)]
    if(entry) entries.push({ ...entry, id: id })
  })

  return entries
}

// returns the Luxon DateTime of the latest entry. If there are no entries,
// returns the epoch DateTime
export function selectLatestGoalEntryDate(state){
  let latestDates = []

  state.goals.ids.forEach(id => {
    const goal = state.goals.entities[id]
    const entryDates = goal.entries.ids
    latestDates.push( getNewestDate(entryDates) )
  })

  return deserializeDate(getNewestDate(latestDates))
}


/* UTILITY FUNCTIONS */

/* 
Adds one entity to a normalized state if it does noot exist, replaces it
otherwise. This function is needed instead of the entityAdapter CRUD operations
if you want to create a new state and perform an operation to it in the same 
redux action. entityAdapter operations do no take any effect in this case.
*/ 
function setOne(state, entity){
  if(!state.entities[entity.id]){
    state.ids.push(entity.id)
  }
  
  state.entities[entity.id] = entity
}