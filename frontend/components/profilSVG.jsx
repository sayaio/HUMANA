import * as React from "react"
import Svg, { Path } from "react-native-svg"

// Menggunakan PascalCase (ProfilSVG) agar terbaca sebagai komponen
const ProfilSVG = ({ size = 24, color = "#484C52", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24" // Menambahkan viewBox sesuai ukuran asli
    {...props}
  >
    <Path
      stroke={color} // Menggunakan variabel color
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM20.59 22c0-3.87-3.85-7-8.59-7s-8.59 3.13-8.59 7"
    />
  </Svg>
)

export default ProfilSVG