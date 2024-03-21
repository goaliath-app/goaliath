export function hasSomethingToShow(list){
  /* list can be a list of goals, activities, entries and fullLogs */
  for(let item of list){
    if(item.entry?.archived !== undefined && !item.entry.archived){
      return true
    }else if(item.archived !== undefined && !item.archived){
      return true
    }
  }
  return false
}

export function isActivityRunning(intervals){
  const lastInterval = intervals.slice(-1)[0]
  if(lastInterval?.startDate && !lastInterval?.endDate){
    return true
  }else{
    return false
  }
}

export function roundValue(value){
  return Math.round((value + Number.EPSILON) * 10) / 10
}

export function newEntry(activityId, placeholder=false){
  // Placeholder = true if this function is used to generate a
  // placeholder entry when there is not an entry for that activity
  // and date
  return(
    {
      intervals: [],
      repetitions: [],
      completed: null,
      id: activityId,
      archived: placeholder,
    }
  )
}

export function isActive(activity, activityGoal){
  if(activity.archived || activityGoal.archived){
    return false
  }
  if(!activity.active || !activityGoal.active){
    return false
  }
  return true
}

// checks if b is between a and c
export function isBetween(a, b, c){
  return a <= b && b <= c
}