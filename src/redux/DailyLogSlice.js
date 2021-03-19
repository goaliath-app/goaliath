import { createSlice, createEntityAdapter} from '@reduxjs/toolkit'
import { DateTime } from 'luxon'

const dailyLogAdapter = createEntityAdapter();
const entryAdapter = createEntityAdapter();

const initialState = dailyLogAdapter.getInitialState();

/*
each dailyLog is 
  {id: Date, 
    entries: {  // the entries are managed via entryAdapter
      ids: array of ids of all entries
      entities: {
        eachEntryId: {
          id: id matching with the activity this log comes from,
          intervals: [{start_date: Date, end_date: Date}],
          completed: bool,
          goal: "check" / "time",
          timeGoal: seconds,
        }
      }
    }
  }
*/

const dailyLogSlice = createSlice({
  name: 'dailyLogs',
  initialState,
  reducers: {
    createDailyLog(state, action){
      /* create empty daily log for today
      action.payload: 
        date: a luxon DateTime from the day you want to get the logs from
      */
      const dailyLog= {
        id: action.payload.date.startOf('day').toISO(),
        entries: entryAdapter.getInitialState()
      }
      dailyLogAdapter.addOne(state, dailyLog)
    },
    addEntry(state, action){
      /* add a single entry to a daily log
      action.payload:
        date: a luxon date of the day to add a log to
        entry: the entry object to add
      */
      const { date, entry } = action.payload
      const selectedDay = state.entities[date.startOf('day').toISO()]
      entryAdapter.addOne(selectedDay.entries, entry)
    },
    upsertTodaysEntry(state, action){
      /* upsert a single entry to todays daily log
      action.payload: a entry object to be upserted*/
      const entry = action.payload
      const today = DateTime.now().startOf('day').toISO()
      const todaysLog = state.entities[today].entries
      entryAdapter.upsertOne(todaysLog, entry)
    },
    deleteOneTodaysEntry(state, action){
      /* action.payload: id of the entry to delete */
      const today = DateTime.now().startOf('day').toISO()
      const todaysLog = state.entities[today].entries
      entryAdapter.removeOne(todaysLog, action.payload)
    }
  }
})

export const { createDailyLog, addEntry, upsertTodaysEntry, deleteOneTodaysEntry } = dailyLogSlice.actions

export const { 
  selectAll: selectAllLogs, selectById: selectDailyLogById
} = dailyLogAdapter.getSelectors(state => state.dailyLogs)

export function selectTodayLogs(state){
  const entriesEntitiesObject = state.dailyLogs.entities[DateTime.now().startOf('day').toISO()]?.entries.entities
  if(entriesEntitiesObject){
    return Object.values(entriesEntitiesObject)
  }else{
    return []
  }
}

export function selectTodayLogByActivityId(state, activityId){
  const todayLog = state.dailyLogs.entities[DateTime.now().startOf('day').toISO()]
  return todayLog?.entries.entities[activityId]
}

export default dailyLogSlice.reducer