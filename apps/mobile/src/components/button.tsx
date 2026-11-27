import { StyleSheet, Text, View } from "react-native"
import { colors, radii, sizes, spacing, font } from "../lib/theme"
import { Icon, type IconName } from "./icon"
import { PressableScale } from "./pressable-scale"

type Kind = "primary" | "outline" | "ghost"

export function Button({
  label,
  onPress,
  kind = "primary",
  icon,
  disabled = false,
  flex = false,
}: {
  label: string
  onPress?: () => void
  kind?: Kind
  icon?: IconName
  disabled?: boolean
  flex?: boolean
}) {
  const fg = disabled ? colors["text-muted"] : kind === "primary" ? colors["on-primary"] : kind === "outline" ? colors["primary-text"] : colors.text
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      outerStyle={flex ? styles.flex : undefined}
      hitSlop={(spacing["touch-min"] - sizes.button) / 2}
      style={[styles.base, disabled ? styles.disabled : styles[kind]]}
    >
      <View style={styles.inner}>
        {icon ? <Icon name={icon} size={18} color={fg} /> : null}
        <Text style={[font("button"), { color: fg }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  base: {
    height: sizes.button,
    borderRadius: radii.sm,
    paddingHorizontal: spacing["4"],
    alignItems: "center",
    justifyContent: "center",
  },
  inner: { flexDirection: "row", alignItems: "center", gap: spacing["2"] },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors["tint-3"] },
  disabled: { backgroundColor: colors["surface-disabled"] },
})
