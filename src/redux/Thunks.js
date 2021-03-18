// TODO: implement thunks and replace exports of index.js with them

function myExampleDispatchableThunkAction(message){
    return function(dispatch, getState){
      console.log(`dispacheado ${message}`)
      console.log(getState())
    }
  }

function toggleGoal(goalId){
  return function(dispatch, getState){
    // toggle the goal
    // update the daily log
  }
}

function toggleActivity(activityId){
  return function(dispatch, getState){
    // toggle the activity
    // update the daily log
  }
}

function createActivity(activity){
  return function(dispatch, getState){
    // create the new activity
    // update the daily log
  }
}

function updateActivity(activity){
  return function(dispatch, getState){
    // update the activity
    // update the daily log
  }
}

