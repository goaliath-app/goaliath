const palette = {
  blue: '#7BA6ED',
  blueLight: '#9EC3FF',
  blueDark: '#4367A1',
  blueSoft: '#F0F8FF',
  green: '#9BE9A8',
  amber: '#EDC87B',
  amberLight: '#FFE09E',
  amberDark: '#A18343',
  white: '#ffffff',
  black: '#000000',
  red: '#CE0A24',
  redLight: '#CF6679',
  gray: '#808080',
  grayLight: '#C0C0C0',
  grayDark: '#121212',
}

export const theme = {
  colors: {
    //MaterialDesign
    primary: palette.blue,
    primaryLightVariant: palette.blueLight,
    primaryDarkVariant: palette.blueDark,
    accent: palette.green,
    secondary: palette.amber,
    secondaryLightVariant: palette.amberLight,
    secondaryDarkVariant: palette.amberDark,
    background: palette.white,
    surface: palette.white,
    error: palette.red,
    onPrimary: palette.black,
    onSecondary: palette.black,
    onBackground: palette.black,
    onSurface: palette.black,
    onError: palette.white,
    /*ReactNativePaper
    text: '',
    disabled: '',
    placeholder: '',
    backdrop: '',
    notification: '',*/
    //Custom
    gray: palette.gray,
    grayLight: palette.grayLight,
    grayDark: palette.grayDark

  }
}

export const darkTheme = {
  colors: {
    //MaterialDesign
    primary: palette.blue,
    primaryLightVariant: palette.blueLight,
    primaryDarkVariant: palette.blueDark,
    accent: palette.green,
    secondary: palette.amber,
    secondaryLightVariant: palette.amberLight,
    secondaryDarkVariant: palette.amberDark,
    background: palette.grayDark,
    surface: palette.grayDark,
    error: palette.redLight,
    onPrimary: palette.black,
    onSecondary: palette.black,
    onBackground: palette.white,
    onSurface: palette.white,
    onError: palette.black,
  }
}