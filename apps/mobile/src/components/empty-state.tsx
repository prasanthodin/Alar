import { StyleSheet, Text, View } from "react-native"
import { colors, radii, spacing, font } from "../lib/theme"
import type { ErrorCode } from "@shop/contracts"
import { errorText, t } from "../lib/i18n"
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
  body?: string
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
      {body ? <Text style={[font("body"), styles.body]}>{body}</Text> : null}
      {action ? (
        <View style={styles.action}>
          <Button label={action.label} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  )
}

/** A failed call: what happened, and a button to try again. */
export function ErrorState({ code, onRetry, title }: { code: ErrorCode; onRetry: () => void; title?: string }) {
  return (
    <EmptyState
      icon="info"
      title={title ?? errorText(code)}
      body={title ? errorText(code) : undefined}
      action={{ label: t("common.retry"), onPress: onRetry }}
    />
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
