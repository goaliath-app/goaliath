// We can't modify values of tutorialStates, because users already have
// its current saved value
const tutorialStates = {
    NewUser: 0,
    TodayScreenIntroduction: 1,
    GoalsScreenIntroduction: 2,
    FirstGoalCreation: 3,
    GoalScreenIntroduction: 4,
    SampleActivityCreated: 5,
    AddNewActivityHighlight: 6,
    ActivitiesInTodayScreen: 7,
    ChooseWeekliesIntroduction: 8,
    OneTimeTasksIntroduction: 9,
    TutorialEnding: 10,
    Finished: 11,
}

export default tutorialStates