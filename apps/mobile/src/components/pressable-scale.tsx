import { useState, type ReactNode } from "react"
import { Animated, Easing, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native"

const PRESS_SCALE = 0.97
const PRESS_MS = 120

/** Press feedback is our own scale on press-down (DESIGN.md motion); the Android ripple stays off. */
export function PressableScale({
  children,
  style,
  outerStyle,
  ...rest
}: Omit<PressableProps, "style" | "children"> & {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  /** Layout style of the touch target itself, e.g. `flex: 1` in a row. */
  outerStyle?: StyleProp<ViewStyle>
}) {
  const [scale] = useState(() => new Animated.Value(1))
  const to = (value: number) =>
    Animated.timing(scale, {
      toValue: value,
      duration: PRESS_MS,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start()

  return (
    <Pressable
      {...rest}
      style={outerStyle}
      onPressIn={(e) => {
        to(PRESS_SCALE)
        rest.onPressIn?.(e)
      }}
      onPressOut={(e) => {
        to(1)
        rest.onPressOut?.(e)
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  )
}
