import * as React from "react"
import Svg, { Path } from "react-native-svg"

const ChatSVG = ({ size = 29, color = "#484C52", ...props }) => {
  // Menghitung tinggi proporsional (Rasio asli 29:30)
  const calculatedHeight = (size * 30) / 29;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={calculatedHeight}
      fill="none"
      viewBox="0 0 29 30" // Menambahkan viewBox sesuai ukuran asli
      {...props}
    >
      <Path
        stroke={color} // Menggunakan variabel color
        strokeWidth={1.5}
        d="M4.833 14.613c0-.618 0-.928.016-1.19a9 9 0 0 1 8.461-8.46c.262-.016.571-.016 1.19-.016s.928 0 1.19.015a9 9 0 0 1 8.461 8.462c.016.261.016.57.016 1.19v6.605c0 1.419 0 2.128-.344 2.636-.143.211-.325.393-.535.535-.508.344-1.218.344-2.637.344h-5.924c-.83 0-1.245 0-1.595-.027a9 9 0 0 1-8.271-8.272c-.027-.35-.027-.765-.027-1.594v-.228Z"
      />
      <Path
        stroke={color} // Menggunakan variabel color
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.875 13.604h7.25M14.5 18.55h3.625"
      />
    </Svg>
  );
}

export default ChatSVG