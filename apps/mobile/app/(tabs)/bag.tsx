import type { BagLine } from "@shop/api-client"
import { formatRupees, lowStockCount } from "@shop/contracts"
import { router } from "expo-router"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { EmptyState, ErrorState, Skeleton } from "../../src/components/empty-state"
import { Icon } from "../../src/components/icon"
import { Photo } from "../../src/components/photo"
import { PriceRow } from "../../src/components/price"
import { PressableScale } from "../../src/components/pressable-scale"
import { TopBar } from "../../src/components/top-bar"
import { itemCount, t } from "../../src/lib/i18n"
import { useShop } from "../../src/lib/shop"
import { colors, FLOATING_NAV_CLEARANCE, radii, spacing, font } from "../../src/lib/theme"

function Line({ line }: { line: BagLine }) {
  const low = lowStockCount(line.stock)
  return (
    <PressableScale
      accessibilityRole="link"
      accessibilityLabel={`${line.name}, ${line.colourName}, ${formatRupees(line.price)}, ${t("bag.qty", { n: line.quantity })}`}
      onPress={() => router.push({ pathname: "/design/[id]", params: { id: line.designId } })}
      style={styles.line}
    >
      {line.image ? (
        <Photo image={line.image} style={styles.linePhoto} radius={radii.md} />
      ) : (
        // A line whose Design is gone may have no photo: the neutral photo ground alone.
        <View style={[styles.linePhoto, { borderRadius: radii.md, backgroundColor: colors["photo-ground"] }]} />
      )}
      <View style={styles.lineText}>
        <Text style={font("body-strong")} numberOfLines={1}>
          {line.name}
        </Text>
        <Text style={[font("caption"), styles.muted]}>{line.colourName}</Text>
        <PriceRow price={line.price} mrp={line.mrp} />
        <View style={styles.lineFoot}>
          <View style={styles.qty}>
            <Text style={font("body-sm", 700)}>{t("bag.qty", { n: line.quantity })}</Text>
          </View>
          {low !== null ? (
            <Text style={[font("caption", 600), { color: colors.warning }]}>{t("common.onlyLeft", { n: low })}</Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  )
}

function Row({ label, value, tone, strong = false }: { label: string; value: string; tone?: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={font(strong ? "body-strong" : "body-sm")}>{label}</Text>
      <Text style={[font(strong ? "body-strong" : "body-sm", strong ? 700 : 600), tone ? { color: tone } : null]}>{value}</Text>
    </View>
  )
}

export default function Bag() {
  const insets = useSafeAreaInsets()
  const { bagState, reloadBag } = useShop()
  const bottom = { paddingBottom: FLOATING_NAV_CLEARANCE + insets.bottom }

  if (bagState.status === "loading") {
    return (
      <View style={[styles.screen, bottom]}>
        <TopBar title={t("bag.title")} />
        <View style={styles.summary}>
          <Skeleton height={105} />
          <Skeleton height={180} radius={radii.xl} />
        </View>
      </View>
    )
  }

  if (bagState.status === "error") {
    return (
      <View style={[styles.screen, bottom]}>
        <TopBar title={t("bag.title")} />
        <ErrorState title={t("bag.error")} code={bagState.error.code} onRetry={reloadBag} />
      </View>
    )
  }

  const bag = bagState.data
  if (bag.count === 0) {
    return (
      <View style={[styles.screen, bottom]}>
        <TopBar title={t("bag.title")} />
        <EmptyState
          icon="bag"
          title={t("bag.empty.title")}
          body={t("bag.empty.body")}
          action={{ label: t("bag.empty.cta"), onPress: () => router.navigate("/") }}
        />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <TopBar title={t("bag.title")} trailing={<Text style={[font("body-sm"), styles.muted]}>{itemCount(bag.count)}</Text>} />
      <ScrollView contentContainerStyle={{ paddingBottom: FLOATING_NAV_CLEARANCE + insets.bottom }}>
        {bag.lines.map((line) => (
          <Line key={line.id} line={line} />
        ))}
        <View style={styles.summary}>
          {/* Always the same four price lines, in the same order. */}
          <View style={styles.card} accessibilityLabel={t("bag.priceDetails")}>
            <Text style={font("h4")} accessibilityRole="header">
              {t("bag.priceDetails")}
            </Text>
            <Row label={t("bag.totalMrp", { count: itemCount(bag.count) })} value={formatRupees(bag.totalMrp)} />
            <Row label={t("bag.discount")} value={`− ${formatRupees(bag.discount)}`} tone={colors.success} />
            <Row
              label={t("bag.delivery")}
              value={bag.delivery === 0 ? t("bag.free") : formatRupees(bag.delivery)}
              tone={bag.delivery === 0 ? colors.success : undefined}
            />
            <View style={styles.rule} />
            <Row label={t("bag.total")} value={formatRupees(bag.total)} strong />
            <Text style={[font("caption"), styles.muted]}>{t("common.taxes")}</Text>
          </View>
          {bag.discount > 0 ? (
            <Text style={[font("body-sm", 600), { color: colors.success }]}>
              {t("bag.youSave", { amount: formatRupees(bag.discount) })}
            </Text>
          ) : null}
          <View style={styles.note}>
            <Icon name="info" size={16} color={colors.primary} />
            <Text style={[font("caption"), styles.noteText]}>{t("bag.payLater")}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  muted: { color: colors["text-muted"] },
  line: {
    flexDirection: "row",
    gap: spacing["3"],
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["4"],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linePhoto: { width: 84, height: 105 },
  lineText: { flex: 1, minWidth: 0, gap: spacing["1"] },
  lineFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  qty: {
    height: 28,
    paddingHorizontal: spacing["2"],
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors["tint-3"],
    justifyContent: "center",
  },
  summary: { padding: spacing["4"], gap: spacing["3"] },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing["card-pad-lg"],
    gap: spacing["2"] + 2,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing["2"] },
  rule: { height: 1, backgroundColor: colors.border },
  note: {
    flexDirection: "row",
    gap: spacing["2"],
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: spacing["3"],
    borderRadius: radii.md,
    backgroundColor: colors["tint-1"],
  },
  noteText: { flex: 1, color: colors.text },
})
