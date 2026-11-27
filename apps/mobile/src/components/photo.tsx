import type { ImageRef } from "@shop/api-client"
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native"
import { colors, radii, spacing, font } from "../lib/theme"
import { Icon } from "./icon"

/** A product photo on the neutral photo ground. Nothing lavender touches it. */
export function Photo({
  image,
  style,
  radius = radii.md,
  fit = "cover",
  children,
}: {
  image: ImageRef
  style?: StyleProp<ViewStyle>
  radius?: number
  /** `contain` shows the whole picture, e.g. a full-length view, uncropped on the photo ground. */
  fit?: "cover" | "contain"
  children?: React.ReactNode
}) {
  return (
    <View style={[styles.ground, { borderRadius: radius }, style]}>
      <Image
        source={{ uri: image.url }}
        accessibilityLabel={image.alt}
        accessible
        resizeMode={fit}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  )
}

/** A label attached to the left edge of a photo ("Just in"). Solid, never glass. */
export function PhotoLabel({ text }: { text: string }) {
  return (
    <View style={styles.label}>
      <Text style={[font("label"), { color: colors["on-primary"] }]}>{text}</Text>
    </View>
  )
}

/** White rating chip at the bottom left of a photo. */
export function RatingChip({ value, count }: { value: number; count: number }) {
  return (
    <View style={styles.rating}>
      <Text style={font("label", 700)}>{value.toFixed(1)}</Text>
      <Icon name="star" size={12} color={colors["rating-star"]} filled />
      <View style={styles.ratingRule} />
      <Text style={[font("label"), { color: colors["text-muted"] }]}>{count}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  ground: { backgroundColor: colors["photo-ground"], overflow: "hidden" },
  label: {
    position: "absolute",
    left: 0,
    top: 10,
    height: 22,
    paddingLeft: spacing["2"],
    paddingRight: 10,
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  rating: {
    position: "absolute",
    left: spacing["2"],
    bottom: spacing["2"],
    height: 22,
    paddingHorizontal: spacing["2"],
    borderRadius: radii.xs,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingRule: { width: 1, height: 10, backgroundColor: colors.border, marginHorizontal: 2 },
})
