import { useStore } from 'react-redux'
import { DateTime } from 'luxon'
import Duration from 'luxon/src/duration.js'

import { selectActivityById } from './ActivitySlice'
import { findActivityRecord } from './ActivityRecordsSlice'

/* This file defines selectors that use data from more than one slice */

export function selectActivityByIdAndDate(state, activityId, date){
  let activityRecord

  if(date){
    activityRecord = findActivityRecord(state, activityId, date)
  } 

  if(activityRecord) {
    return activityRecord
  }else{
    return selectActivityById(state, activityId)
  }
}