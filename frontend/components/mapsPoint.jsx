import * as React from "react"
import Svg, { Path } from "react-native-svg"

const PoinSVG = ({ size = 30, color = "#2B4C7E", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={size * (15/19)}
    height={size}
    fill="none"
    {...props}
  >
    <Path
      fill={color}
      fillRule="evenodd"
      d="M7.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
      clipRule="evenodd"
    />
    <Path
      fill={color}
      fillRule="evenodd"
      d="M0 7.623C0 11.866 4.382 19 7.5 19c3.118 0 7.5-7.134 7.5-11.377C15 3.417 11.646 0 7.5 0S0 3.417 0 7.623Zm13 0C13 10.903 9.255 17 7.5 17S2 10.903 2 7.623C2 4.513 4.467 2 7.5 2S13 4.513 13 7.623Z"
      clipRule="evenodd"
    />
  </Svg>
)

export default PoinSVG