import { createSlice, createEntityAdapter} from '@reduxjs/toolkit'
import { toggleGoal } from './GoalsSlice'

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
          done: bool,
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
      const dailyLog= {
        id: action.payload.date,
        entries: entryAdapter.getInitialState()
      }
      dailyLogAdapter.addOne(state, dailyLog)
    },
    addEntry(state, action){
      const { date, entry } = action.payload
      console.log(`date: ${date}`)
      const selectedDay = state.entities[date]
      entryAdapter.addOne(selectedDay.entries, entry)
    }
  }
})

export const { createDailyLog, addEntry } = dailyLogSlice.actions

export const { 
  selectAll: selectAllLogs, selectById: selectDailyLogById
} = dailyLogAdapter.getSelectors(state => state.dailyLogs)

export default dailyLogSlice.reducer