import { Pressable, Text } from "react-native"
import { colors, font, spacing } from "../lib/theme"

// The text is shorter than a finger, so the touch area is extended to the 44pt minimum.
const SLOP = { top: 12, bottom: 12, left: 8, right: 8 }

/** A primary-coloured text link, weight 600, with a touch area of at least 44pt. */
export function TextLink({ label, onPress, size = "body-sm" }: { label: string; onPress: () => void; size?: "body-sm" | "caption" }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      hitSlop={SLOP}
      style={{ minHeight: spacing["touch-min"] - SLOP.top - SLOP.bottom, justifyContent: "center" }}
    >
      <Text style={[font(size, size === "caption" ? 700 : 600), { color: colors.primary }]}>{label}</Text>
    </Pressable>
  )
}
