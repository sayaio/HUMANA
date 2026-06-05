import * as React from "react"
import Svg, { Path } from "react-native-svg"
const mapsSVG = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={21}
    fill="none"
    {...props}
  >
    <Path
      stroke="#313B72"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20.75 8.75v-.783c0-1.94 0-2.909-.586-3.512-.586-.602-1.528-.602-3.414-.602h-2.079c-.917 0-.925-.002-1.75-.415L9.59 1.771C8.199 1.075 7.503.727 6.762.751c-.741.024-1.412.417-2.759 1.203l-1.227.716c-.989.577-1.483.866-1.754 1.346C.75 4.496.75 5.08.75 6.25v8.217c0 1.535 0 2.303.342 2.73.228.285.547.476.9.54.53.095 1.18-.284 2.478-1.042.882-.515 1.73-1.05 2.785-.905.884.122 1.705.68 2.495 1.075"
    />
    <Path
      stroke="#313B72"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6.75.75v15"
    />
    <Path
      stroke="#313B72"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.75 3.75v4"
    />
    <Path
      stroke="#313B72"
      strokeWidth={1.5}
      d="M16.25 10.25c2.435 0 4.5 2.017 4.5 4.463 0 2.485-2.098 4.23-4.036 5.415a.94.94 0 0 1-.927 0c-1.935-1.197-4.037-2.921-4.037-5.415 0-2.447 2.065-4.463 4.5-4.463Z"
    />
    <Path
      stroke="#313B72"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16.375 14.75h-.125m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Z"
    />
  </Svg>
)
export default mapsSVG
