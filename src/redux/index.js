export { default as store } from './store'

export { 
    createGoal, toggleGoal, updateGoal, archiveGoal,
    selectAllGoals, selectGoalById, 
} from './GoalsSlice'

export { 
    createActivity, updateActivity, toggleActivity, archiveActivity, 
    selectAllActivities, selectActivityById, selectActivityEntities,
} from './ActivitySlice' 

// TODO: refactor
export { 
    addEntry, // rename to addActivityInstance
    toggleCompleted,
    upsertEntry, // rename to updateActivityInstance
    deleteEntry, // rename to deleteActivityInstance
    startTodayTimer, 
    stopTodayTimer, 
    weekliesSelectedToday,
    selectEntriesByDay, // rename to selectActivityInstancesByDay
    areWeekliesSelectedToday, 
    selectAllWeekEntriesByActivityId, // rename to selectAllWeekInstancesByActivityId 
    selectEntryByActivityIdAndDate, // rename to selectInstanceByActivityIdAndDate
} from './LogSlice'  // rename to activityInstancesSlice

export { 
    addTodayTask, toggleTask, areTasksAddedToday, deleteTodayTask, getTodayTasks, tasksAddedToday 
} from './TasksSlice'

export { 
    generateDummyData, updateLogs, importState, archiveOrDeleteEntry, createOrUnarchiveEntry
} from './Thunks'

export { setDayStartHour, finishOnboarding, setLanguage } from './SettingsSlice'

export { 
    selectActivityByIdAndDate, selectAllActiveActivities, getWeeklyStats,
    getTodaySelector, extractActivityList,
} from './selectors'
