import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentOverlay: null
};

/* This slice is used to save which parts of the user guide have been already
shown to the user. 

This is simply a key-value store that will be populated by the corresponding
components.

The only value is currentOverlay: a token that is used to determine if there
is an user guide overlay already being shown, in order to prevent multiple
overlays from being shown at the same time. Null means there is no overlay
being shown. Otherwise it contains the name of the overlay that is being shown.

Components composing the user guide check and set keys themselves. If a key
does not exist, it assumes that it's part of the user guide has not yet been
shown */
const activitySlice = createSlice({
  name: 'guide',
  initialState,
  reducers: {
    setValue(state, action){
      const { key, value } = action.payload
      state[key] = value
    },

    setState(state, action){
      const { newState } = action.payload
      return newState
    }
  }
})

export default activitySlice.reducer

export const {
  setState,
} = activitySlice.actions

const { setValue } = activitySlice.actions

// Thunks
export function setCurrentOverlay(overlayName){
  return function(dispatch, getState){
    if(selectCurrentOverlay(getState()) == undefined){
      dispatch(setValue({ key: 'currentOverlay', value: overlayName }))
      return true
    }
    return false
  }
}

export function releaseCurrentOverlay(){
  return function(dispatch, getState){
    dispatch(setValue({ key: 'currentOverlay', value: null }))
  }
}

export function setGuideValue(key, value){
  return function(dispatch, getState){
    dispatch(setValue({ key, value }))
  }
}

// Selectors
export function selectCurrentOverlay(state){
  return state.guide.currentOverlay
}

export function selectGuideValue(state, key){
  return state.guide[key]
}

