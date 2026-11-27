import { router } from "expo-router"
import type { ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { t } from "../lib/i18n"
import { colors, sizes, spacing, font } from "../lib/theme"
import { Icon } from "./icon"

/** 56px white bar with a hairline beneath: optional back target, title with an optional caption, one trailing item. */
export function TopBar({
  title,
  caption,
  back = false,
  trailing,
}: {
  title?: string
  caption?: string
  back?: boolean
  trailing?: ReactNode
}) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={[styles.bar, !back && styles.noBack]}>
        {back ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            style={styles.back}
          >
            <Icon name="back" size={22} />
          </Pressable>
        ) : null}
        <View style={styles.titles}>
          {title ? (
            <Text style={font("h3")} numberOfLines={1} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {caption ? (
            <Text style={[font("caption"), { color: colors["text-muted"] }]} numberOfLines={1}>
              {caption}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  bar: {
    height: sizes["top-bar"],
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing["4"],
    paddingLeft: spacing["1"],
    gap: spacing["1"],
  },
  noBack: { paddingLeft: spacing["4"] },
  back: { width: spacing["touch-min"], height: spacing["touch-min"], alignItems: "center", justifyContent: "center" },
  titles: { flex: 1, minWidth: 0 },
})
