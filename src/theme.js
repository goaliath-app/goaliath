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

const defaultLightPlacements = {
  // Header
  headerContent: 'onPrimary',
  headerBackground: 'primary',
  statusBarBackground: 'primary30',

  // Tab bar
  tabBarActiveIcon: 'primary',
  tabBarInactiveIcon: 'neutral80',
  tabBarBackground: 'surface',

  // TodayScreen
  todayDueIcon: 'onBackground',
  todayCompletedIcon: 'onBackground',

  activityBackground: 'surface',
  runningActivityBackground: 'accentContainer',

  progressBarToday: 'accent',
  progressBarWeek: 'accent30',
  progressBarBackground: 'accent80',

  completedWeekliesSelector: 'neutral60',

  // SelectWeekliesScreen
    // Checkboxes use values in TodayScreen
  completedCheckbox: 'neutral60',
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
  weekDayLabel: 'neutral60',
  weekBackground: 'secondary95',
  dayProgressBar: 'accent70',
  weekProgressBar: 'accent',
  weekProgressBarBackground: 'secondary90',
  weekDayNumber: 'text',
  weekPastDayNumber: 'neutral60',
  calendarTodayHighlightBackground: 'primary60',
  calendarTodayHighlightText: 'onAccent',
  calendarSoftTodayHighlightText: 'primary30',
  weekPressedDayBackGround: 'accent',
  weekFailedDayBackGround: 'neutral80',
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

  // value used by react-native-paper
  text: 'onSurface',

}

const defaultLightAliases = {
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

}

const darkPlacements = {
  headerBackground: 'surface',
  headerContent: 'onSurface',
  statusBarBackground: 'background',

}

const darkAliases = {
  primary: 'primary20',
  onPrimary: 'primary0',
  primaryContainer: 'primary10',
  onPrimaryContainer: 'primary90',
  secondary: 'secondary20',
  // onSecondary: 'secondary100',
  // secondaryContainer: 'secondary90',
  // onSecondaryContainer: 'secondary10',
  accent: 'accent20',
  // onAccent: 'accent100',
  // accentContainer: 'accent90',
  // onAccentContainer: 'accent10',

  background: 'secondary10',
  onBackground: 'neutral100',
  surface: 'neutral20',
  onSurface: 'neutral100',
  // surfaceVariant: 'neutral90',
  // onSurfaceVariant: 'neutral30',
  // outline: 'neutral50',

  // inverseSurface: 'neutral20',
  // inverseOnSurface: 'neutral95',
  // inversePrimary: 'primary80',

  // // value used by react-native-paper
  // text: 'primary10',
}

export const lightTheme = populateTheme(
  
  // key colors, to generate tonal palettes
  {
    primary: 'hsla(256, 80%, 57%, 1)',
    secondary: 'hsl(224, 35%, 57%)',
    accent: 'hsla(162, 60%, 57%, 1)',
    neutral: '#000000',
  },

  // raw colors
  {
    error: palette.red,
    onError: palette.white,
  },

  // aliases override
  darkAliases,

  // placements override
  darkPlacements
)

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

function populateTheme(
  /* colors: object 
  key: name of the color
  value: color as string
  These colors won't be added to the theme.colors as they are. They will be used
  to generate tonal palletes, and that tones will be added instead.
  The name of the added colos will be "colornameXX" where XX is the value of
  the tone luminosity. Available values are
  00, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100 */
  colors,
  
  // colors that will be added to the theme.colors as they are
  rawColors,

  /* aliases: object
  key: name of the color to be added to the theme
  value: string referencing a key name of one of the colors added from the
  tonal palette of the colors argument, or the raw colors in rawColors.
  
  Keys with the alias name will be added to the final theme.colors, with the corresponding
  color as value. */
  aliases={}, 

  /* aliases: object 
  key: name of the place the color will be used
  value: string referencing a color name of any color (tonal palettes, raw
    colors and aliases).
    
  Keys with the color placement will be added to the theme.colors with the
  corresponding colors. */ 
  placements={},
){
  const theme = { colors: {} }

  Object.keys(colors).forEach( colorName => {
    const palette = generateTonalPalette(colors[colorName], colorName)
    Object.assign(theme.colors, palette)
  })

  Object.assign(theme.colors, rawColors)

  const aliasesWithDefaults = { ...defaultLightAliases, ...aliases }
  Object.keys(aliasesWithDefaults).forEach( alias => {
    theme.colors[alias] = theme.colors[aliasesWithDefaults[alias]]
  })

  const placementsWithDefaults = { ...defaultLightPlacements, ...placements }
  Object.keys(placementsWithDefaults).forEach( placement => {
    theme.colors[placement] = theme.colors[placementsWithDefaults[placement]]
  })

  console.log(theme)

  return theme
}