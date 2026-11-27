import type { DesignCard } from "@shop/api-client"
import { router } from "expo-router"
import { StyleSheet, Text, View } from "react-native"
import { t } from "../lib/i18n"
import { colors, spacing, font } from "../lib/theme"
import { Photo, PhotoLabel, RatingChip } from "./photo"
import { PriceRow, priceLabel } from "./price"
import { PressableScale } from "./pressable-scale"

/** The whole card opens the Product page. */
export function ProductCard({ design }: { design: DesignCard }) {
  const label = [
    design.name,
    design.subtitle,
    priceLabel(design.price, design.mrp),
    design.rating ? t("common.ratingLabel", { value: design.rating.value, count: design.rating.count }) : null,
  ]
    .filter(Boolean)
    .join(", ")
  return (
    <PressableScale
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => router.push({ pathname: "/design/[id]", params: { id: design.id } })}
      outerStyle={styles.outer}
      style={styles.card}
    >
      <Photo image={design.image} style={styles.photo}>
        {design.badge ? <PhotoLabel text={design.badge} /> : null}
        {design.rating ? <RatingChip value={design.rating.value} count={design.rating.count} /> : null}
      </Photo>
      <View style={styles.text}>
        <Text style={font("body-sm", 700)} numberOfLines={1}>
          {design.name}
        </Text>
        <Text style={[font("caption"), { color: colors["text-muted"] }]} numberOfLines={1}>
          {design.subtitle}
        </Text>
        <PriceRow price={design.price} mrp={design.mrp} />
      </View>
    </PressableScale>
  )
}

/** Two columns with a 12px gap. */
export function ProductGrid({ designs }: { designs: DesignCard[] }) {
  return (
    <View style={styles.grid}>
      {designs.map((d) => (
        <View key={d.id} style={styles.cell}>
          <ProductCard design={d} />
        </View>
      ))}
    </View>
  )
}

const GAP = spacing["grid-gap-phone"]

const styles = StyleSheet.create({
  outer: { flex: 1 },
  card: { gap: spacing["2"] },
  photo: { width: "100%", aspectRatio: 4 / 5 },
  text: { gap: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -GAP / 2, rowGap: spacing["4"] },
  cell: { width: "50%", paddingHorizontal: GAP / 2 },
})
