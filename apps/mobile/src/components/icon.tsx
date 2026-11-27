import Svg, { Circle, Path, Rect } from "react-native-svg"
import { colors } from "../lib/theme"

// 24px-grid line icons, round caps and joins, drawn in the given colour (DESIGN.md "Shapes").
const PATHS = {
  back: <Path d="M20 12H5M11 5l-7 7 7 7" />,
  right: <Path d="M9 5l7 7-7 7" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M20 20l-3.5-3.5" />
    </>
  ),
  home: <Path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z" />,
  grid: (
    <>
      <Rect x="4" y="4" width="7" height="7" rx="1.5" />
      <Rect x="13" y="4" width="7" height="7" rx="1.5" />
      <Rect x="4" y="13" width="7" height="7" rx="1.5" />
      <Rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  spark: <Path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />,
  bag: (
    <>
      <Path d="M6 8h12l-1 11a1 1 0 01-1 1H8a1 1 0 01-1-1z" />
      <Path d="M9 8V7a3 3 0 016 0v1" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
      <Circle cx="12" cy="10" r="2.5" />
    </>
  ),
  share: <Path d="M12 15V4M8 7.5L12 4l4 3.5M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" />,
  truck: (
    <>
      <Path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
      <Circle cx="7.5" cy="17.5" r="1.8" />
      <Circle cx="17.5" cy="17.5" r="1.8" />
    </>
  ),
  undo: <Path d="M4 9h10a5 5 0 010 10H8M4 9l4-4M4 9l4 4" />,
  lock: (
    <>
      <Rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <Path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </>
  ),
  expand: <Path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  sort: <Path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />,
  filter: <Path d="M4 6h16M7 12h10M10 18h4" />,
  info: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 11v5M12 8v.1" />
    </>
  ),
  check: <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  star: <Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
} as const

export type IconName = keyof typeof PATHS

export function Icon({
  name,
  size = 20,
  color = colors.text,
  strokeWidth = 2,
  filled = false,
}: {
  name: IconName
  size?: 16 | 18 | 20 | 22 | 24 | 12 | 14
  color?: string
  strokeWidth?: number
  filled?: boolean
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={filled ? "none" : color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      {PATHS[name]}
    </Svg>
  )
}
