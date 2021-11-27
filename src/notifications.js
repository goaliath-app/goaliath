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

export default { initNotifications, timerStarted, timerStoped}