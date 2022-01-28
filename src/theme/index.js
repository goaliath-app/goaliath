import Color from 'color'

import { lightPlacements, lightAliases } from './light'
import { darkPlacements, darkAliases } from './dark'

export const lightTheme = populateTheme(
  // key colors, to generate tonal palettes
  {
    primary: '#386cc7',
    secondary: 'hsl(224, 35%, 57%)',
    accent: 'hsla(162, 60%, 57%, 1)',
    neutral: '#000000',
  },

  // raw colors
  {
    error: '#CE0A24',
    onError: '#ffffff',
    transparent: 'transparent',
  },

  // aliases
  lightAliases,

  // placements
  lightPlacements
)

// export const darkTheme = populateTheme(
//   // key colors, to generate tonal palettes
//   {
//     primary: 'hsla(256, 80%, 57%, 1)',
//     secondary: 'hsl(224, 35%, 57%)',
//     accent: 'hsla(162, 60%, 57%, 1)',
//     neutral: '#000000',
//   },

//   // raw colors
//   {
//     error: '#CE0A24',
//     onError: '#ffffff',
//   },

//   // aliases
//   darkAliases,

//   // placements
//   darkPlacements
// )

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
  aliases, 

  /* aliases: object 
  key: name of the place the color will be used
  value: string referencing a color name of any color (tonal palettes, raw
    colors and aliases).
    
  Keys with the color placement will be added to the theme.colors with the
  corresponding colors. */ 
  placements,

  /* Some tips for building a theme:
  - Only use keys from placements in the actual code.
  - Use the aliases to define specific roles for colors.
  - As value for placements, use as many colors as possible from the aliases,
   and not directly from the color palettes */
){
  const theme = { colors: {} }

  Object.keys(colors).forEach( colorName => {
    const palette = generateTonalPalette(colors[colorName], colorName)
    Object.assign(theme.colors, palette)
  })

  Object.assign(theme.colors, rawColors)

  Object.keys(aliases).forEach( alias => {
    theme.colors[alias] = theme.colors[aliases[alias]]
  })

  Object.keys(placements).forEach( placement => {
    theme.colors[placement] = theme.colors[placements[placement]]
  })

  return theme
}