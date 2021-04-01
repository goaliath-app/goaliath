import React from 'react';
import { View } from 'react-native'
import { List, Divider } from 'react-native-paper';
import { getPreferedExpression } from '../../util'

const BasicActivityInfo = ({ activity, goal }) => {
    let frequency 
    switch(activity.repeatMode){
      case 'weekly':
        if(activity.goal=='check'){
          frequency = `${activity.timesPerWeek} days per week.`
        }else{
          const expression = getPreferedExpression(activity.timeGoal)
          frequency = `${expression.value} ${expression.unit} per week.`
        }
        break
      case 'select':
        let days = ''
        const labels = {1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun'}
        for (let day in activity.weekDays){
          if (activity.weekDays[day]){
            days = `${days} ${labels[day]}`
          }
        }
        if(activity.goal=='check'){
          frequency = `Do on ${days}`
        }else{
          const expression = getPreferedExpression(activity.timeGoal)
          frequency = `${expression.value} ${expression.unit} on ${days}`
        }
        break
      case 'daily':
        if(activity.goal=='check'){
          frequency = "Every day."
        }else{
          const expression = getPreferedExpression(activity.timeGoal)
          frequency = `${expression.value} ${expression.unit} every day.`
        }
        break
      default:
        frequency = 'ERROR'
    }
  
    return (
      <View>
        <List.Item
          title={'Goal: ' + goal.name}
        />
        <List.Item
          title={'Frequency: ' + frequency}
        />
        <Divider />
      </View>
    )
  }

  export default BasicActivityInfo