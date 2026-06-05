import * as React from "react";
import Svg, { Path } from "react-native-svg";

const EditIconSvg = ({ size = 11, color = "#007AFF", ...props }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 11 11"
    fill="none"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.147 2.696h-.549A1.098 1.098 0 0 0 .5 3.794v4.941a1.098 1.098 0 0 0 1.098 1.099h4.941a1.098 1.098 0 0 0 1.098-1.099v-.549"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m7.089 1.598 1.647 1.647m.76-.777a1.153 1.153 0 0 0-1.63-1.63L3.245 5.44v1.647h1.646l4.604-4.62Z"
    />
  </Svg>
);

export default EditIconSvg;