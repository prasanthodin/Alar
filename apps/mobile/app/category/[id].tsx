import type { DesignCard } from "@shop/api-client"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { EmptyState, ErrorState, Skeleton } from "../../src/components/empty-state"
import { Glass } from "../../src/components/glass"
import { Icon } from "../../src/components/icon"
import { ProductGrid } from "../../src/components/product-card"
import { PressableScale } from "../../src/components/pressable-scale"
import { TopBar } from "../../src/components/top-bar"
import { itemCount, t, type MessageKey } from "../../src/lib/i18n"
import { useResult } from "../../src/lib/shop"
import { colors, radii, sizes, spacing, font } from "../../src/lib/theme"

const SORTS: { key: MessageKey; order: (a: DesignCard, b: DesignCard) => number }[] = [
  { key: "listing.sort.recommended", order: () => 0 },
  { key: "listing.sort.priceLow", order: (a, b) => a.price - b.price },
  { key: "listing.sort.priceHigh", order: (a, b) => b.price - a.price },
]

export default function Listing() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [sort, setSort] = useState(0)
  const [note, setNote] = useState<string | null>(null)
  const categories = useResult("categories", (api) => api.listCategories())
  const designs = useResult(`designs:${id}`, (api) => api.listDesigns({ categoryId: id }))
  const category = categories.status === "ok" ? categories.data.find((c) => c.id === id) : undefined
  const sorted = designs.status === "ok" ? [...designs.data].sort(SORTS[sort]!.order) : []
  const unknown = categories.status === "ok" && !category

  if (unknown) {
    return (
      <View style={styles.screen}>
        <TopBar back />
        <EmptyState
          icon="search"
          title={t("listing.notFound.title")}
          body={t("listing.notFound.body")}
          action={{ label: t("common.goHome"), onPress: () => router.navigate("/") }}
        />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <TopBar
        back
        title={category?.name ?? ""}
        caption={designs.status === "ok" ? itemCount(designs.data.length) : undefined}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 96 + insets.bottom }]}>
        {note ? <Text style={[font("caption"), styles.muted]}>{note}</Text> : null}
        {designs.status === "ok" ? (
          sorted.length > 0 ? (
            <ProductGrid designs={sorted} />
          ) : (
            <EmptyState
              icon="search"
              title={t("listing.empty")}
              body={t("listing.emptyBody")}
              action={{ label: t("common.goHome"), onPress: () => router.navigate("/") }}
            />
          )
        ) : designs.status === "error" ? (
          <ErrorState code={designs.error.code} onRetry={designs.reload} />
        ) : (
          <Skeleton height={260} />
        )}
      </ScrollView>

      {/* Floating Sort and filter bar. */}
      <View pointerEvents="box-none" style={[styles.barWrap, { bottom: spacing["3"] + insets.bottom }]}>
        <Glass style={styles.bar}>
          <View style={styles.barRow}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t(SORTS[sort]!.key)}
              onPress={() => {
                const next = (sort + 1) % SORTS.length
                setSort(next)
                setNote(t(SORTS[next]!.key))
              }}
              style={styles.barItem}
            >
              <Icon name="sort" size={18} />
              <Text style={font("body-sm", 600)}>{t("listing.sort")}</Text>
            </PressableScale>
            <View style={styles.barRule} />
            <PressableScale
              accessibilityRole="button"
              onPress={() => setNote(t("listing.filterSoon"))}
              style={styles.barItem}
            >
              <Icon name="filter" size={18} />
              <Text style={font("body-sm", 600)}>{t("listing.filter")}</Text>
            </PressableScale>
          </View>
        </Glass>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing["gutter-phone"], gap: spacing["3"] },
  muted: { color: colors["text-muted"] },
  barWrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  bar: { height: sizes["bottom-nav"] - 8, borderRadius: radii.full },
  barRow: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing["2"] },
  barItem: {
    height: spacing["touch-min"],
    paddingHorizontal: spacing["5"],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  barRule: { width: 1, height: 20, backgroundColor: colors.border },
})
