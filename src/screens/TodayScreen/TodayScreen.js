import React from 'react';
import { ActivityList } from '../../components'

const data = [
  {title: 'Anki', completed: true, current: false, period: 'daily'},
  {title: 'Cure Dolly', timeGoal: 20, completed: false, current: true, period: 'daily', todayTime: 10},
  {title: 'Genki', completed: false, current: false, period: 'daily'},
  {title: 'Genki', timeGoal: 10, completed: true, current: false, period: 'daily', todayTime: 20},
  {title: 'Genki', timeGoal: 5, completed: false, current: false, period: 'daily', todayTime: 0},
  {title: 'Genki', timeGoal: 5, completed: true, current: true, period: 'daily', todayTime: 0},
 ]

const HomeScreen = () => {
  return (
    <ActivityList data={data} />
  );
}

export default HomeScreen;