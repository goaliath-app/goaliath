import { DoFixedDays } from './weeklyTarget'
import { DoNSeconds, DoNTimes } from './dailyTarget'

class ActivityHandler {
  /* This is an utility class used for handling the different activity types */
  
  constructor( { activity, goal, entry, date } ){
    const weeklyTargets = {
      'doFixedDays': DoFixedDays
    }

    const dailyTargets = {
      'doNSeconds': DoNSeconds,
      'doNTimes': DoNTimes,
    }
    
    this.date = date
    this.entry = entry
    this.activity = activity
    this.goal = goal

    this.weeklyTarget = new weeklyTargets[this.activity.weeklyTarget.type]( this )
    if(activity.dailyTarget?.type){
      this.dailyTarget = new dailyTargets[this.activity.dailyTarget.type]( this )
    }
  }

  updateEntryThunk( date ) {
    const self = this

    return function(dispatch, getState){
      dispatch( self.weeklyTarget.updateEntryThunk(date) )
    }
  }

  getActivityListItem(){
    return this.weeklyTarget.getActivityListItem()
  }
}

export default ActivityHandler