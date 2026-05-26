// components/BackIconSvg.jsx
import * as React from "react";
import Svg, { Path } from "react-native-svg";

// Diubah menggunakan properti dinamis (size dan color) agar mudah dikontrol
const BackIconSvg = ({ size = 20, color = "#FFF", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={(size * 18) / 11} // Menjaga rasio aspek asli Figma (11x18)
    viewBox="0 0 11 18"
    fill="none"
    {...props}
  >
    <Path
      fill={color}
      fillRule="evenodd"
      d="M9.987.5a1.68 1.68 0 0 1 0 2.416L4.225 8.542l5.762 5.625a1.68 1.68 0 0 1 0 2.416 1.78 1.78 0 0 1-2.474 0l-7-6.833a1.68 1.68 0 0 1 0-2.416l7-6.834a1.78 1.78 0 0 1 2.474 0Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default BackIconSvg;