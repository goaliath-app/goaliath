import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { AssetsColor } from "../src/styles/Colors"


/* Icon from https://materialdesignicons.com/ */
function SvgComponent(props) {
  return (
    <Svg
      style={{
        width: 24,
        height: 24
      }}
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill={AssetsColor.fill}
        stroke={AssetsColor.stroke}
        d="M20 16V4H8v12h12m2 0a2 2 0 01-2 2H8a2 2 0 01-2-2V4c0-1.11.89-2 2-2h12a2 2 0 012 2v12m-6 4v2H4a2 2 0 01-2-2V7h2v13h12z"
      />
    </Svg>
  )
}

export default SvgComponent
