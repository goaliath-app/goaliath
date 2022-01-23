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

export const lightTheme = populateTheme({
  colors: {
    // key colors
    primaryColor: 'hsla(256, 80%, 57%, 1)',
    secondaryColor: 'hsl(224, 35%, 57%)',
    accentColor: 'hsla(162, 60%, 57%, 1)',//'hsl(224, 100%, 57%)',
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

export const darkTheme = populateTheme({
  colors: {
    primary: palette.blue,
    primaryLightVariant: palette.blueLight,
    primaryDarkVariant: palette.blueDark,
    secondary: palette.amber,
    secondaryLightVariant: palette.amberLight,
    secondaryDarkVariant: palette.amberDark,
    background: palette.grayDark,
    surface: palette.grayDark,
    error: palette.redLight,
    onPrimary: palette.white,
    onSecondary: palette.black,
    onBackground: palette.white,
    onSurface: palette.white,
    onError: palette.black,
    disabled: palette.grayLight,
    placeholder: palette.gray,
  }
})


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

function populateTheme(theme){
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
  
  return theme
}