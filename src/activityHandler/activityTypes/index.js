import doFixedDays from './doFixedDays'
import doNDaysEachWeek from './doNDaysEachWeek'


export const updateEntryThunkIndex = {
  'doFixedDays': doFixedDays.updateEntryThunk 
}

export const todayScreenItemIndex = {
  'doFixedDays': doFixedDays.TodayScreenItem,
  'doNDaysEachWeek': doNDaysEachWeek.TodayScreenItem
}

export const renderSelectWeekliesItemDueIndex = {
  'doNDaysEachWeek': doNDaysEachWeek.renderSelectWeekliesItemDue,
}