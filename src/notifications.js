import * as Notifications from 'expo-notifications'

export function initNotifications(){
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
}

export function reminderScheduleNotification( dateTime, t){
  Notifications.scheduleNotificationAsync({
    identifier: 'reminder',
    content: {
      title: t('notifications.reminder.title'),
      body: t('notifications.reminder.body')
    },
    trigger: {
      hour: dateTime.hour,
      minute: dateTime.minute,
      repeats: true
    },
  })
}

function completeScheduleNotification(activity, activityId, secondsRemaining, t){
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

function timerNotification(activity, t){
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

export function timerStarted(activity, entry, secondsRemaining, t){
  //Send timer notification
  timerNotification(activity, t)
  //Schedule complete notification
  if(!entry.completed){
    completeScheduleNotification(activity, activity.id, secondsRemaining, t)
  }
}

export function timerStoped(activityId){
  Notifications.dismissNotificationAsync('timer')
  Notifications.cancelScheduledNotificationAsync('complete' + activityId)
}

export default { initNotifications, reminderScheduleNotification, timerStarted, timerStoped}