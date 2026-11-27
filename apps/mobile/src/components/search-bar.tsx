import { StyleSheet, Text, View } from "react-native"
import { storeName } from "../lib/config"
import { t } from "../lib/i18n"
import { colors, radii, sizes, spacing, font } from "../lib/theme"
import { Icon } from "./icon"

/** The wordmark is the configured store name, lower case, Plus Jakarta Sans 800 in primary. */
export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <Text
      style={[font("h2"), { fontSize: size, lineHeight: size + 4, color: colors.primary, letterSpacing: -0.03 * size }]}
      accessibilityRole="header"
    >
      {storeName}
    </Text>
  )
}

/** Home search field with the wordmark at its left. Search itself arrives later. */
export function SearchBar() {
  return (
    <View style={styles.field} accessibilityLabel={t("home.searchPlaceholder")}>
      <Wordmark />
      <View style={styles.rule} />
      <Icon name="search" size={18} color={colors["text-muted"]} />
      <Text style={[font("body"), styles.placeholder]} numberOfLines={1}>
        {t("home.searchPlaceholder")}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    height: sizes.search,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors["tint-3"],
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing["3"],
    gap: spacing["2"],
  },
  rule: { width: 1, height: 20, backgroundColor: colors["tint-3"], marginHorizontal: spacing["1"] },
  placeholder: { flex: 1, color: colors.placeholder },
})
