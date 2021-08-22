## Activity Format
```
{
    name: string

    goalId: id of its goal

    dailyGoal: {
        type: none  /  "doNTimes"  /  "doNSeconds" 
        params: {
            // corresponding to its type
        }
    }

    weeklyGoal: {
        type: "doFixedDays"  /  "doNDaysEachWeek"  /  "doNTimesEachWeek"  /  "doNSecondsEachWeek"
        params: {
            // corresponding to its type
        }
    }
}
```

## Goal Types

### Daily Goals
```
type: "doNTimes"
params: {
    repetitions: int
}

To complete the activity any given day, it should be done N times

type: "doNSeconds"
params: {
    seconds: int
}

To complete the activity any given day, N seconds should be dedicated to it
```
### Weekly Target
```
type: "doFixedDays"
params: {
    daysOfWeek: { 0: bool, 1: bool, ..., 6: bool }
}

The activity will appear the selected days of the week, and
to complete it its dailyGoal should be completed.

type: "doNDaysEachWeek"
params: {
    days: int
}

The activity will appear in the selectWeekliesScreen. To complete
it any certain week, it should be completed N days. To complete
it any certain day, the daily goal has to be completed.

type: "doNTimesEachWeek"
params: {
    repetitions: int
}

type: "doNSecondsEachWeek"
params: {
    seconds: int
}
```

## What I did so far
* created a activityHandler and a doDaily weeklyTarget
* doDaily can handle the updateEntries for their entries.
* But the entries are not created well, because we don't know yet how they should be. We should modify the newEntry function to reflect what we decide
* To decide that we also have to think about how the lobs will be embalmed with this new "architexture".