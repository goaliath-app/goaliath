import * as Notifications from 'expo-notifications'

export function completeScheduleNotification(activity, activityId, secondsRemaining, t){
  Notifications.scheduleNotificationAsync({
    identifier: 'complete' + activityId,
    content: {
      title: t('notifications.complete.title'),
      body: t('notifications.complete.body', {activityName: activity.name})
    },
    trigger: {
      seconds: secondsRemaining
    }
  })
}

export function timerNotification(activity, t){
  Notifications.scheduleNotificationAsync({
    identifier: 'timer' ,
    content: {
      title: t('notifications.timer.title'),
      body: t('notifications.timer.body', {activityName: activity.name}),
      priority: 'max',
      sticky: true
    },
    trigger: null,
  });
}