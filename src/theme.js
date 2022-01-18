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

export const lightTheme = adaptToPaperTheme({
  colors: {
    primary: palette.blue,
    primaryLightVariant: palette.blueLight,
    primaryDarkVariant: palette.blueDark,
    accent: palette.amberLight,
    accentLightVariant: palette.amberLight,
    accentDarkVariant: palette.amberDark,
    background: palette.white,
    surface: palette.white,
    error: palette.red,
    onPrimary: palette.white,
    onSecondary: palette.black,
    onBackground: palette.black,
    onSurface: palette.black,
    onError: palette.white,
    disabled: palette.grayLight,
    placeholder: palette.gray,
  }
})

export const darkTheme = adaptToPaperTheme({
  colors: {
    primary: palette.blue,
    primaryLightVariant: palette.blueLight,
    primaryDarkVariant: palette.blueDark,
    accent: palette.amber,
    accentLightVariant: palette.amberLight,
    accentDarkVariant: palette.amberDark,
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

/* This function adds extra keys that paper theme needs to work properly,
with duplicate values of the theme.
At the moment it adds the text color. Other colors that are not added:
- backdrop
- notification*/
function adaptToPaperTheme(theme){
  return {
    ...theme,
    colors: {
      ...theme.colors,
      text: theme.colors.onSurface
    }
  }
}