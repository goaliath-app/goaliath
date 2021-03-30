import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg
      width={18}
      height={21}
      viewBox="0 0 18 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M17.063 8.898L3.313.773C2.18.11.5.773.5 2.375v16.25c0 1.484 1.563 2.383 2.813 1.64l13.75-8.124a1.9 1.9 0 000-3.243z"
        fill="#000"
      />
    </Svg>
  )
}

export default SvgComponent
