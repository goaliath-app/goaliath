import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { AssetsColor } from "../src/styles/Colors"
import { withTheme } from 'react-native-paper'


const SvgComponent =  withTheme((props) => {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M6.5 15.625a.875.875 0 01-.875.875h-3.75A.852.852 0 011 15.625V1.875C1 1.398 1.386 1 1.875 1h3.75c.463 0 .875.412.875.875v13.75zm10-13.75v13.75a.875.875 0 01-.875.875h-3.75a.852.852 0 01-.875-.875V1.875c0-.477.386-.875.875-.875h3.75c.463 0 .875.412.875.875z"
        fill={props.theme.colors.todayCompletedIcon}
        stroke={props.theme.colors.todayCompletedIcon}
        strokeWidth={2}
      />
    </Svg>
  )
})

export default SvgComponent
