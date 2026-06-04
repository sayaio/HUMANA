import * as React from "react"
import Svg, { Circle, Path } from "react-native-svg"

// 1. Pastikan nama komponen diawali huruf kapital (PesanSVG)
const PesanSVG = ({ size = 20, color = "#FFF", ...props }) => {
  // Karena rasio asli Anda adalah 24:42 (sangat tinggi), 
  // kita hitung height secara proporsional agar tidak gepeng.
  const aspectRatio = 42 / 24;
  const calculatedHeight = size * aspectRatio;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}           // Mengikuti prop size
      height={calculatedHeight} // Mengikuti prop size secara proporsional
      fill="none"
      viewBox="0 0 24 42"    // PENTING: Bingkai koordinat asli SVG Anda
      {...props}
    >
      <Circle cx={3.575} cy={3.575} r={3.575} fill={color} />
      <Circle cx={20.188} cy={3.575} r={3.575} fill={color} />
      <Path
        fill={color}
        d="M23.763 24.015c0 3.142-4.84 6.934-7.043 6.934V42h7.043V24.015Z"
      />
      <Path
        fill={color}
        d="M7.15 8.703H0v9.86c0 15.78 23.763 15.78 23.763 0v-9.86H16.72v9.86c0 7.547-9.57 7.511-9.57 0v-9.86Z"
      />
      <Path
        fill={color}
        d="M0 24.015c0 3.142 4.948 6.934 7.15 6.934V42H0V24.015Z"
      />
    </Svg>
  )
}

export default PesanSVG;