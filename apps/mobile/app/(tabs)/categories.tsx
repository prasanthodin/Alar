import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { CategoryThumb, openCategory } from "../../src/components/category-rail"
import { Skeleton } from "../../src/components/empty-state"
import { Icon } from "../../src/components/icon"
import { TopBar } from "../../src/components/top-bar"
import { t } from "../../src/lib/i18n"
import { useResult } from "../../src/lib/shop"
import { colors, FLOATING_NAV_CLEARANCE, spacing, font } from "../../src/lib/theme"

const ALL = "sarees"

export default function Categories() {
  const insets = useSafeAreaInsets()
  const categories = useResult("categories", (api) => api.listCategories())

  return (
    <View style={styles.screen}>
      <TopBar title={t("categories.title")} />
      <View style={styles.body}>
        {/* Departments rail: only live departments show, so Sarees stands alone for now. */}
        <View style={styles.rail} accessibilityRole="tablist">
          <View style={styles.railItemOn} accessibilityRole="tab" accessibilityState={{ selected: true }}>
            <Icon name="grid" size={20} color={colors["primary-text"]} />
            <Text style={[font("label", 700), { color: colors["primary-text"] }]}>{t("categories.department")}</Text>
          </View>
        </View>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingBottom: FLOATING_NAV_CLEARANCE + insets.bottom }]}
        >
          <View style={styles.head}>
            <Text style={font("h4")} accessibilityRole="header">
              {t("categories.department")}
            </Text>
            <Text style={[font("body-sm", 600), { color: colors.primary }]} accessibilityRole="link" onPress={() => openCategory(ALL)}>
              {t("common.viewAll")}
            </Text>
          </View>
          {categories.status === "ok" ? (
            <View style={styles.grid}>
              {categories.data
                .filter((c) => c.id !== ALL)
                .map((c) => (
                  <View key={c.id} style={styles.cell}>
                    <CategoryThumb large tile={{ key: c.id, label: c.name, image: c.thumbnail, onPress: () => openCategory(c.id) }} />
                  </View>
                ))}
            </View>
          ) : (
            <Skeleton height={220} />
          )}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, flexDirection: "row" },
  flex: { flex: 1 },
  rail: { width: 84, backgroundColor: colors["tint-1"] },
  railItemOn: {
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["1"],
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  content: { padding: spacing["4"], paddingHorizontal: spacing["3"], gap: spacing["4"] },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing["4"] },
  cell: { width: "33.333%", alignItems: "center" },
})
