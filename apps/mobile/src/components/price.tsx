import { formatRupees, percentOff } from "@shop/contracts"
import { StyleSheet, Text, View } from "react-native"
import { t } from "../lib/i18n"
import { colors, spacing, font } from "../lib/theme"

/** Price, struck MRP and discount on one line. */
export function PriceRow({ price, mrp, large = false }: { price: number; mrp: number; large?: boolean }) {
  const off = percentOff(mrp, price)
  return (
    <View style={styles.row}>
      {large && off > 0 ? (
        <Text style={[font("body-sm"), styles.muted]}>{t("common.mrp")}</Text>
      ) : null}
      {large && off > 0 ? <Text style={[font("body-sm"), styles.struck]}>{formatRupees(mrp)}</Text> : null}
      <Text style={font(large ? "price-lg" : "price")}>{formatRupees(price)}</Text>
      {!large && off > 0 ? <Text style={[font("caption"), styles.struck]}>{formatRupees(mrp)}</Text> : null}
      {off > 0 ? (
        <Text style={[font(large ? "body-sm" : "caption", 700), styles.off]}>{t("common.off", { n: off })}</Text>
      ) : null}
    </View>
  )
}

/** The words a screen reader hears for a price. */
export function priceLabel(price: number, mrp: number): string {
  const off = percentOff(mrp, price)
  return off > 0
    ? `${formatRupees(price)}, ${t("common.mrp")} ${formatRupees(mrp)}, ${t("common.off", { n: off })}`
    : formatRupees(price)
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: spacing["1"] + 2 },
  muted: { color: colors["text-muted"] },
  struck: { color: colors["text-muted"], textDecorationLine: "line-through" },
  off: { color: colors["primary-text"] },
})
