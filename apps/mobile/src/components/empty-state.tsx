import { StyleSheet, Text, View } from "react-native"
import { colors, radii, spacing, font } from "../lib/theme"
import { Button } from "./button"
import { Icon, type IconName } from "./icon"

/** A round tint tile with an icon, a title, one sentence, then one button. */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName
  title: string
  body: string
  action?: { label: string; onPress: () => void }
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.tile}>
        <Icon name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[font("h2"), styles.center]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[font("body"), styles.body]}>{body}</Text>
      {action ? (
        <View style={styles.action}>
          <Button label={action.label} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  )
}

/** Grey blocks in the shape of what is loading. Static: nothing loops. */
export function Skeleton({ height, width = "100%", radius = radii.md }: { height: number; width?: number | `${number}%`; radius?: number }) {
  return <View style={{ height, width, borderRadius: radius, backgroundColor: colors["photo-ground"] }} />
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing["6"], gap: spacing["3"] },
  tile: {
    width: 68,
    height: 68,
    borderRadius: radii.full,
    backgroundColor: colors["tint-2"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing["1"],
  },
  center: { textAlign: "center" },
  body: { textAlign: "center", color: colors["text-muted"], lineHeight: 22, maxWidth: 320 },
  action: { marginTop: spacing["2"] },
})
