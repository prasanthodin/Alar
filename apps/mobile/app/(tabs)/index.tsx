import { ALL_CATEGORY_ID } from "@shop/api-client"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Banner } from "../../src/components/banner"
import { CategoryRail, openCategory } from "../../src/components/category-rail"
import { ErrorState, Skeleton } from "../../src/components/empty-state"
import { AddressBar, DepartmentTabs, ServiceStrip, type HomeTab } from "../../src/components/home-strips"
import { ProductGrid } from "../../src/components/product-card"
import { SearchBar } from "../../src/components/search-bar"
import { TextLink } from "../../src/components/text-link"
import { mockAssetBaseUrl } from "../../src/lib/config"
import { t } from "../../src/lib/i18n"
import { useResult } from "../../src/lib/shop"
import { colors, FLOATING_NAV_CLEARANCE, spacing, font } from "../../src/lib/theme"

// While one department is live, the Home tabs show its top categories (EXPERIENCE.md).
const TABS: HomeTab[] = [
  { id: ALL_CATEGORY_ID, label: "home.tab.all" },
  { id: "silk", label: "home.tab.silk" },
  { id: "cotton", label: "home.tab.cotton" },
  { id: "wedding", label: "home.tab.wedding" },
]

export default function Home() {
  const insets = useSafeAreaInsets()
  const [tab, setTab] = useState(TABS[0]!.id)
  const categories = useResult("categories", (api) => api.listCategories())
  const designs = useResult(`designs:${tab}`, (api) => api.listDesigns({ categoryId: tab }))
  const tabLabel = t(TABS.find((x) => x.id === tab)!.label)

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + spacing["1"], paddingBottom: FLOATING_NAV_CLEARANCE + insets.bottom }}
    >
      <AddressBar />
      <View style={styles.gutter}>
        <SearchBar />
      </View>
      <DepartmentTabs tabs={TABS} active={tab} onChange={setTab} />

      <View style={styles.section}>
        {categories.status === "ok" ? (
          <CategoryRail categories={categories.data} />
        ) : categories.status === "error" ? (
          <ErrorState code={categories.error.code} onRetry={categories.reload} />
        ) : (
          <View style={styles.gutter}>
            <Skeleton height={176} />
          </View>
        )}
      </View>

      <View style={[styles.gutter, styles.section]}>
        <Banner imageUrl={`${mockAssetBaseUrl}/5-2-wedding.jpg`} onPress={() => openCategory("wedding")} />
      </View>

      <View style={[styles.gutter, styles.section]}>
        <ServiceStrip />
      </View>

      <View style={[styles.gutter, styles.section, styles.head]}>
        <Text style={font("h3")} accessibilityRole="header">
          {tab === ALL_CATEGORY_ID ? t("home.grid.all") : t("home.grid.category", { name: tabLabel })}
        </Text>
        <TextLink label={t("common.viewAll")} onPress={() => openCategory(tab)} />
      </View>
      <View style={[styles.gutter, styles.gridWrap]}>
        {designs.status === "ok" ? (
          <ProductGrid designs={designs.data} />
        ) : designs.status === "error" ? (
          <ErrorState code={designs.error.code} onRetry={designs.reload} />
        ) : (
          <View style={styles.skeletonRow}>
            <View style={styles.flex}>
              <Skeleton height={260} />
            </View>
            <View style={styles.flex}>
              <Skeleton height={260} />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  gutter: { paddingHorizontal: spacing["gutter-phone"], paddingTop: spacing["2"] },
  section: { marginTop: spacing["section-gap-phone"] - spacing["2"] },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  gridWrap: { paddingTop: spacing["3"] },
  skeletonRow: { flexDirection: "row", gap: spacing["grid-gap-phone"] },
  flex: { flex: 1 },
})
