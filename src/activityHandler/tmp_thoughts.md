# Activity Format
```
{
  name: string

  goalId: id of its goal

  type: string

  params: {
    ...
  }
}
```

# Activity Types
## doFixedDays

```
{
  type: "doFixedDays"
  params: {
    daysOfWeek: { 0: bool, 1: bool, ..., 6: bool }
    dailyGoal: {
      type: str,
      params: {
        ...
      }
    }
  }
}
```

The activity will appear the selected days of the week, and
to complete it its dailyGoal should be completed.
## doNDaysEachWeek
```
{
  type: "doNDaysEachWeek"
  params: {
      days: int
      dailyGoal: {
          type: str,
          params: {
              ...
          }
      }
  }
}
```
The activity will appear in the selectWeekliesScreen. To complete
it any certain week, it should be completed N days. To complete
it any certain day, the daily goal has to be completed.
## doNTimesEachWeek
```
{
  type: "doNTimesEachWeek"
  params: {
      repetitions: int
  }

  type: "doNSecondsEachWeek"
  params: {
      seconds: int
  }
}
```

# Daily Goals

## doOneTime
```
{
  type: "doOneTime"
  params: { }
}
```
Just a simple check activity

## doNTimes
```
{
  type: "doNTimes"
  params: {
      repetitions: int
  }
}
```

To complete the activity any given day, it should be done N times
## doNSeconds
```
{
  type: "doNSeconds"
  params: {
      seconds: int
  }
}

```
To complete the activity any given day, N seconds should be dedicated to it