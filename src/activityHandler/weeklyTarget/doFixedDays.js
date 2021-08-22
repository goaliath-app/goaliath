import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry } from '../../redux'
import { isActive } from '../../util'

import WeeklyTarget from './weeklyTarget'


class DoFixedDays extends WeeklyTarget {
  constructor( activityHandler ){
    super( activityHandler )

    this.activity = activityHandler.activity
    this.goal = activityHandler.goal
    this.state = activityHandler.state
    this.daysOfWeek = this.activity.weeklyTarget.params.daysOfWeek
    this.dispatch = activityHandler.dispatch
  }

  updateEntryThunk( date ){
    console.log('en el body del updateentrythunk del target')
    const self = this

    return function(dispatch, getState){
      console.log('se esta ejecutando el updateentrythunk del target')
      const state = getState()
      const oldEntry = selectEntryByActivityIdAndDate(state, self.activity.id, date)
        
      // if activity is active and this day is one of the selected days of the week
      if(isActive(self.activity, self.goal) && self.daysOfWeek[date.weekday] ){
        console.log('createorunarchive!')
        dispatch( createOrUnarchiveEntry(date, self.activity.id) )
      }else{
        console.log('archiveordelete!')
        dispatch( archiveOrDeleteEntry(date, self.activity.id) )
      }
    }
  }

  getActivityListItem(){
    return this.activityHandler.dailyTarget.getActivityListItem()
  }

}

export default DoFixedDays