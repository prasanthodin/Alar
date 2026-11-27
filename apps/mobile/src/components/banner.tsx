import { Image, StyleSheet, Text, View } from "react-native"
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg"
import { t } from "../lib/i18n"
import { colors, radii, spacing, font } from "../lib/theme"
import { PressableScale } from "./pressable-scale"

/** One banner, moved by the Shopper only. The whole banner is one target. */
export function Banner({ imageUrl, onPress }: { imageUrl: string; onPress: () => void }) {
  return (
    <PressableScale accessibilityRole="link" accessibilityLabel={t("home.banner.a11y")} onPress={onPress} style={styles.banner}>
      <Image source={{ uri: imageUrl }} resizeMode="cover" style={StyleSheet.absoluteFill} accessible={false} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors["photo-scrim"].slice(0, 7)} stopOpacity={0xc7 / 255} />
            <Stop offset="0.75" stopColor={colors["photo-scrim"].slice(0, 7)} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#scrim)" />
      </Svg>
      <View style={styles.copy}>
        <View style={styles.pill}>
          <Text style={[font("overline"), { color: colors["primary-text"] }]}>{t("home.banner.label")}</Text>
        </View>
        <Text style={[font("h2"), styles.white]}>{t("home.banner.headline")}</Text>
        <Text style={[font("body-sm"), styles.white]}>{t("home.banner.line")}</Text>
        <Text style={[font("button"), styles.white, styles.cta]}>{t("home.banner.cta")} →</Text>
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  banner: { height: 230, borderRadius: radii["2xl"], overflow: "hidden", backgroundColor: colors["photo-ground"] },
  copy: { position: "absolute", left: spacing["4"], top: 0, bottom: 0, justifyContent: "center", gap: spacing["2"], maxWidth: 200 },
  pill: {
    alignSelf: "flex-start",
    height: 24,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  white: { color: colors["on-primary"] },
  cta: { marginTop: spacing["1"] },
})
