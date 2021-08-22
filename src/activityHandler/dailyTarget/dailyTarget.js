class DailyTarget {
  constructor( activityHandler ){
    this.activityHandler = activityHandler
    this.activity = activityHandler.activity
  }

  getActivityListItem(){
    throw 'abstract method not implemented'
  }
}

export default DailyTarget