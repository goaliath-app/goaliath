import Color from 'color'

const palette = {
  blue: '#4D75C5',
  blueLight: '#E3EEFF',
  blueDark: '#4365AB',
  amber: '#FFC34A',
  amberLight: '#FFCB63',
  amberDark: '#B38222',
  white: '#ffffff',
  black: '#000000',
  red: '#CE0A24',
  redLight: '#CF6679',
  gray: '#808080',
  grayLight: '#C0C0C0',
  grayDark: '#121212',
}

const defaultLightColorPlacements = {
  // Header
  headerContent: 'onPrimary',
  statusBarBackground: 'primary30',

  // Tab bar
  tabBarActiveIcon: 'primary',
  tabBarInactiveIcon: 'neutral80',
  tabBarBackground: 'primary99',

  // TodayScreen
  todayDueCheckbox: 'onBackground',
  todayCompletedCheckbox: 'onBackground',

  activityBackground: 'surface',
  runningActivityBackground: 'accentContainer',

  progressBarToday: 'accent',
  progressBarWeek: 'accent30',
  progressBarBackground: 'accent80',

  completedWeekliesSelector: 'placeholder',

  // SelectWeekliesScreen
    // Checkboxes use values in TodayScreen
  completedCheckbox: 'placeholder',
  selectWeekliesActivityBackground: 'surface',
  selectWeekliesChangedText: 'primary',
  selectWeekliesSelectedActivityBackground: 'accentContainer',

  // Stats
  barChartSelectorSelectedBackground: 'accent50',
  barChartSelectorSelectedText: 'text',
  barChartBar: 'accent',
  heatmap1: 'accent80',
  heatmap2: 'accent60',
  heatmap3: 'accent50',
  heatmap4: 'accent30',
  heatmapSkipped: 'secondary95',
  heatmapEmptyBackground: 'transparent',
  heatmapEmptyBorder: 'secondary90',

  // Calendar
  weekDayLabel: 'disabled',
  weekBackground: 'secondary95',
  dayProgressBar: 'accent70',
  weekProgressBar: 'accent',
  weekProgressBarBackground: 'secondary90',
  weekDayNumber: 'text',
  weekPastDayNumber: 'placeholder',
  calendarTodayHighlightBackground: 'primary60',
  calendarTodayHighlightText: 'onAccent',
  calendarSoftTodayHighlightText: 'primaryDarkVariant',
  weekPressedDayBackGround: 'accent',
  weekFailedDayBackGround: 'disabled',
  weekPressedBackground: 'accent90',
  calendarLongPressBackground: 'accent60',

  // Tutorial
  todayItemHighlight: 'primaryContainer',
  pulsatingHighlight: 'primary',
  speechBubbleBackground: 'primaryContainer',

  // Miscellaneous
  helpIcon: 'primary',
  activityIndicator: 'primary',

  // Info Card
  infoCardContent: 'onPrimaryContainer',
  infoCardBackground: 'primary95',

  // TimeInput
  timeInputRegular: 'onSurface',
  timeInputSelected: 'primary',

  // CalendarWeekViewScreen
  weekViewGoalCircularProgress: 'primary',
  weekViewGoalCircularProgressBackground: 'primaryContainer',

  // SettingsScreen
  settingValueText: 'accent30',

  // TodayScreen
  todayScreenBackground: 'background',

  // ActivityDetailScreen
  activityDetailTimeInputRunning: 'primary',

  // WeekDaySelector
  weekDaySelectorPressedBackground: 'accent',
  weekDaySelectorPressedText: 'onAccent',
}

export const lightTheme = populateTheme({
  colors: {
    // key colors
    primaryColor: 'hsla(256, 80%, 57%, 1)',
    secondaryColor: 'hsl(224, 35%, 57%)',
    accentColor: 'hsla(162, 60%, 57%, 1)',
    neutralColor: '#000000',

    // aliases
    primary: 'primary40',
    onPrimary: 'primary100',
    primaryContainer: 'primary90',
    onPrimaryContainer: 'primary10',
    secondary: 'secondary40',
    onSecondary: 'secondary100',
    secondaryContainer: 'secondary90',
    onSecondaryContainer: 'secondary10',
    accent: 'accent40',
    onAccent: 'accent100',
    accentContainer: 'accent90',
    onAccentContainer: 'accent10',

    background: 'secondary95',
    onBackground: 'neutral10',
    surface: 'secondary99',
    onSurface: 'neutral10',
    surfaceVariant: 'neutral90',
    onSurfaceVariant: 'neutral30',
    outline: 'neutral50',

    inverseSurface: 'neutral20',
    inverseOnSurface: 'neutral95',
    inversePrimary: 'primary80',
    
    // extra colors
    primaryDarkVariant: 'primary30',
    error: palette.red,
    onError: palette.white,
    disabled: palette.grayLight,
    placeholder: palette.gray,
  }
})

// export const darkTheme = populateTheme({
//   colors: {
//     primary: palette.blue,
//     primaryLightVariant: palette.blueLight,
//     primaryDarkVariant: palette.blueDark,
//     secondary: palette.amber,
//     secondaryLightVariant: palette.amberLight,
//     secondaryDarkVariant: palette.amberDark,
//     background: palette.grayDark,
//     surface: palette.grayDark,
//     error: palette.redLight,
//     onPrimary: palette.white,
//     onSecondary: palette.black,
//     onBackground: palette.white,
//     onSurface: palette.white,
//     onError: palette.black,
//     disabled: palette.grayLight,
//     placeholder: palette.gray,
//   }
// })


function setLuminosity(color, luminosity){
  const [ hue, saturation, oldLuminosity ] = Color(color).hsl().array()
  return Color.hsl(hue, saturation, luminosity).hex()
}

function generateTonalPalette(color, name){
  const luminosityValues = [ 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100 ]
  const tonalPalette = {}
  luminosityValues.forEach( luminosity => {
    tonalPalette[name + luminosity] = setLuminosity(color, luminosity)
  })
  return tonalPalette
}

function populateTheme(theme, placements=defaultLightColorPlacements){
  // add paper text color key
  theme.colors.text = theme.colors.onSurface

  // add tonal palette colors for primary and secondary colors
  theme.colors = { 
    ...theme.colors, 
    ...generateTonalPalette(theme.colors.primaryColor, 'primary'),
    ...generateTonalPalette(theme.colors.secondaryColor, 'secondary'), 
    ...generateTonalPalette(theme.colors.accentColor, 'accent'),
    ...generateTonalPalette(theme.colors.neutralColor, 'neutral'), 
  }

  // resolve keys referencing other keys 
  // (you can set primaryLightVariant to primary30) and this will resolve it 
  // for you
  Object.keys(theme.colors).forEach( key => {
    if( theme.colors[theme.colors[key]] != undefined ){
      theme.colors[key] = theme.colors[theme.colors[key]]
    }
  })

  const colorPlacements = { ...placements }
  Object.keys(colorPlacements).forEach( key => {
    if( theme.colors[colorPlacements[key]] != undefined ){
      theme.colors[key] = theme.colors[colorPlacements[key]]
    }else{
      theme.colors[key] = colorPlacements[key]
    }
  })

  return theme
}