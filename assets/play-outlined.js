import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { AssetsColor } from "../src/styles/Colors"


function SvgComponent(props) {
  return (
    <Svg
      width={18}
      height={20}
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M2.4 18.867l-.001.001C1.75 19.241 1 18.778 1 18.095V1.855c0-.387.187-.621.45-.75.299-.146.672-.14.952.019h.001L16.56 9.239a.87.87 0 010 1.514L2.4 18.867z"
        stroke={AssetsColor.stroke}
        strokeWidth={2}
      />
    </Svg>
  )
}

export default SvgComponent
