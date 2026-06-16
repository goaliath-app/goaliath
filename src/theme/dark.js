export const darkPlacements = {
  // Header
  headerContent: 'onSurfaceVariant',
  headerBackground: 'surfaceVariant',
  statusBarBackground: 'surfaceVariant',

  // Tab bar
  tabBarActiveIcon: 'primary',
  tabBarInactiveIcon: 'onSurfaceVariant',
  tabBarDisabledIcon: 'primary100', 
  tabBarBackground: 'surfaceVariant',

  // TodayScreen
  todayDueIcon: 'onSurface',
  todayCompletedIcon: 'onSurface',

  activityBackground: 'surface',
  runningActivityBackground: 'surfaceVariant',

  progressBarToday: 'accent',
  progressBarWeek: 'accent40',
  progressBarBackground: 'primaryContainer',

  completedWeekliesSelector: 'neutral60',

  infoCardViewBackground: 'surface',

  // SelectWeekliesScreen
    // Checkboxes use values in TodayScreen
  completedCheckbox: 'onSurface', //Same color as todayCompletedIcon
  selectWeekliesActivityBackground: 'surface',
  selectWeekliesChangedText: 'primary',
  selectWeekliesSelectedActivityBackground: 'surfaceVariant',

  // Stats
  barChartSelectorSelectedBackground: 'accent40',
  barChartSelectorBackground: 'surfaceVariant',
  barChartSelectorSelectedText: 'onSurface',
  barChartSelectorText: 'onSurfaceVariant',
  barChartChevron: 'onSurface',
  barChartLabels: 'onSurface',
  barChartBar: 'accent50',
  heatmap1: 'accent80',
  heatmap2: 'accent60',
  heatmap3: 'accent50',
  heatmap4: 'accent30',
  heatmapSkipped: 'primaryContainer',
  heatmapEmptyBackground: 'surface',
  heatmapEmptyBorder: 'neutral20',
  heatmapLabels: 'onSurface',

  // Calendar
  weekDayLabel: 'neutral60',
  weekBackground: 'neutral20',
  dayProgressBar: 'accent40',
  weekProgressBar: 'accent',
  weekProgressBarBackground: 'primaryContainer',
  weekDayNumber: 'onSurface',
  weekPastDayNumber: 'neutral60',
  calendarTodayHighlightBackground: 'primary',
  calendarTodayHighlightText: 'onPrimary',
  calendarSoftTodayHighlightText: 'primary70',
  weekPressedDayBackGround: 'accent70',
  weekFailedDayBackGround: 'primaryContainer',
  weekPressedBackground: 'accent50',
  calendarLongPressBackground: 'accent50',

  //Onboarding
  dots: 'primaryContainer',
  activeDot: 'accent',
  buttons: 'accent',

  // Tutorial
    // Waiting to new tutorial. TODO
  todayItemHighlight: 'primaryContainer',
  tabBarItemHighlight: 'accent60',
  pulsatingHighlight: 'primary',
  speechBubbleBackground: 'primaryContainer',
  speechBubbleText: 'onPrimaryContainer',
  tooltipBackground: 'surfaceVariant',

  // Miscellaneous
  helpIcon: 'accent',
  activityIndicator: 'primary',
  textInputBackground: 'surface',
  divider: 'outline',
  menuBackground: 'surfaceVariant',
  snackbarText: 'onSurface',

  // Info Card
  infoCardContent: 'onPrimaryContainer',
  infoCardBackground: 'primaryContainer',

  // TimeInput
  timeInputRegular: 'onSurface',
  timeInputSelected: 'primary',

  // CalendarWeekViewScreen
  weekViewGoalCircularProgress: 'primary',
  weekViewGoalCircularProgressBackground: 'primaryContainer',

  // SettingsScreen
  settingValueText: 'accent',
  settingsIcons: 'onSurface',

  //AboutUsScreen
  links: 'accent',
  imageBorder: 'accent',

  // ActivityDetailScreen
  activityDetailTimeInputRunning: 'primary',

  // WeekDaySelector
  weekDaySelectorPressedBackground: 'accentContainer',
  weekDaySelectorPressedText: 'onAccentContainer',

  //ActivityFormScreen
  frequencySelectorBorder: 'onSurface',
  frequencySelectorIcons: 'onPrimaryContainer',
  textInputSelected: 'primary',

  // value used by react-native-paper
  text: 'onSurface',
  placeholder: 'neutral80',
  //disabled: 'neutral60',
  //backdrop
  //notification

  // Screen Backgrounds
  todayScreenBackground: 'background',
  dialogBackground: 'surfaceVariant',
  addTasksScreenBackground: 'surface',
  archivedActivitiesScreenBackground: 'surface',
  archivedGoalsScreenBackground: 'surface',
  calendarDayViewScreenBackground: 'surface',
  calendarScreenBackground: 'surface',
  goalWeekViewBackground: 'surface',
  calendarWeekViewScreenBackground: 'surface',
  goalFormScreenBackground: 'surface',
  goalScreenBackground: 'surface',
  goalsScreenBackground: 'surface',
  selectWeeklyActivitiesScreenBackground: 'surface',
  settingsScreenBackground: 'surface',
  statsScreenBackground: 'surface',
  activityDetailsScreenBackground: 'surface',
  activityFormScreenBackground: 'surface',
  aboutUsScreenBackground: 'surface',
  onboardingScreenBackground: 'surface',

  // System
  systemNavigationBar: 'background'
}

export const darkAliases = {
  primary: 'primary80',
  onPrimary: 'primary20',
  primaryContainer: 'neutral30',
  onPrimaryContainer: 'neutral90',
  secondary: 'secondary80',
  onSecondary: '',
  secondaryContainer: '',
  onSecondaryContainer: '',
  accent: 'accent70',
  onAccent: 'neutral20',
  accentContainer: 'accent40',
  onAccentContainer: 'neutral80',

  background: 'neutral5',
  onBackground: 'neutral90',
  
  surface: 'neutral10',
  onSurface: 'neutral90',

  surfaceVariant: 'neutral15',
  onSurfaceVariant: 'neutral90',
  outline: 'neutral50',

  inverseSurface: '',
  inverseOnSurface: '',
  inversePrimary: '',
}