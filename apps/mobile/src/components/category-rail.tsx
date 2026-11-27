import type { CategoryView } from "@shop/api-client"
import { router } from "expo-router"
import { Image, ScrollView, StyleSheet, Text, View } from "react-native"
import { t } from "../lib/i18n"
import { colors, radii, spacing, font } from "../lib/theme"
import { Icon } from "./icon"
import { PressableScale } from "./pressable-scale"

type Tile = { key: string; label: string; onPress: () => void; image?: CategoryView["thumbnail"]; icon?: "spark" }

export function CategoryThumb({ tile, large = false }: { tile: Tile; large?: boolean }) {
  return (
    <PressableScale accessibilityRole="link" accessibilityLabel={tile.label} onPress={tile.onPress} style={[styles.thumb, large && styles.thumbLarge]}>
      <View style={[styles.art, large && styles.artLarge]}>
        {tile.image ? (
          <Image source={{ uri: tile.image.url }} resizeMode="cover" style={StyleSheet.absoluteFill} accessible={false} />
        ) : (
          <Icon name={tile.icon ?? "spark"} size={24} color={colors.primary} />
        )}
      </View>
      <Text style={[font("label"), styles.label]} numberOfLines={2}>
        {tile.label}
      </Text>
    </PressableScale>
  )
}

export const openCategory = (id: string) => router.push({ pathname: "/category/[id]", params: { id } })

/** Two rows of category thumbnails that scroll sideways. The rail claims only sideways movement. */
export function CategoryRail({ categories }: { categories: CategoryView[] }) {
  const tiles: Tile[] = categories.map((c) => ({
    key: c.id,
    label: c.name,
    image: c.thumbnail,
    onPress: () => openCategory(c.id),
  }))
  // Try-on is a feature, not a category; its tile opens the Try-on tab.
  tiles.splice(Math.ceil((tiles.length + 1) / 2), 0, {
    key: "try-on",
    label: t("home.tryOnTile"),
    icon: "spark",
    onPress: () => router.navigate("/try-on"),
  })
  const perRow = Math.ceil(tiles.length / 2)
  const rows = [tiles.slice(0, perRow), tiles.slice(perRow)]

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      <View style={styles.rows}>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((tile) => (
              <CategoryThumb key={tile.key} tile={tile} />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  rail: { paddingHorizontal: spacing["gutter-phone"] },
  rows: { gap: spacing["3"] },
  row: { flexDirection: "row", gap: spacing["3"] + 2 },
  thumb: { width: 64, alignItems: "center", gap: 6 },
  thumbLarge: { width: 76 },
  art: {
    width: 60,
    height: 72,
    borderRadius: radii.xl,
    backgroundColor: colors["tint-2"],
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  artLarge: { width: 76, height: 92 },
  label: { textAlign: "center" },
})
