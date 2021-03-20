export { default as store } from './store'

export { 
    createGoal, toggleGoal, updateGoal, selectAllGoals, selectGoalById, selectGoalEntities 
} from './GoalsSlice'

export { 
    createActivity, updateActivity, toggleActivity, selectAllActivities, selectActivityById 
} from './ActivitySlice' 

export { 
    createLog, addEntry, upsertTodaysEntry, deleteOneTodaysEntry, toggleCompleted,
    startTimer, stopTimer,
    selectAllLogs, selectLogById, selectTodayEntries, selectTodayEntryByActivityId, 
    selectThisWeekEntriesByActivityId,
} from './LogSlice'

export { 
    generateDummyData, updateLogs
} from './Thunks'