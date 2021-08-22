class WeeklyTarget {
  constructor( activityHandler ){
    this.activityHandler = activityHandler
  }

  updateEntryThunk( date ){
    throw 'abstract method not implemented'
  }

  getActivityListItem(){
    throw 'abstract method not implemented'
  }
}

export default WeeklyTarget