import { selectActivityById } from "../redux"
import { updateEntryThunkIndex, renderTodayScreenItemIndex } from './activityTypes'

export function updateEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    const state = getState()
    const activity = selectActivityById( state, activityId )
  
    const thunk = updateEntryThunkIndex[ activity.type ]

    console.log('thunk', thunk)
    console.log('activity.type', activity.type)
    console.log('activity', activity)
  
    dispatch(thunk(activityId, date))
  }
}

export function renderTodayScreenItem( activity, date ){
  return renderTodayScreenItemIndex[ activity.type ]( activity, date )
}
