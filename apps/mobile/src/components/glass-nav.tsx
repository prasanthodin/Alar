import type { BottomTabBarProps } from "expo-router/tabs"
import { StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { t, type MessageKey } from "../lib/i18n"
import { useShop } from "../lib/shop"
import { colors, radii, sizes, spacing, font } from "../lib/theme"
import { Glass } from "./glass"
import { Icon, type IconName } from "./icon"
import { PressableScale } from "./pressable-scale"

const ITEMS: Record<string, { icon: IconName; label: MessageKey }> = {
  index: { icon: "home", label: "nav.home" },
  categories: { icon: "grid", label: "nav.categories" },
  "try-on": { icon: "spark", label: "nav.tryOn" },
  bag: { icon: "bag", label: "nav.bag" },
}

/** Floating glass bottom navigation: Home, Categories, Try-on, Bag. The current item is a tinted pill. */
export function GlassNav({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { bag } = useShop()
  const count = bag?.count ?? 0

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: spacing["3"] + insets.bottom }]}>
      <Glass style={styles.bar}>
        <View style={styles.row} accessibilityRole="tablist">
          {state.routes.map((route, index) => {
            const item = ITEMS[route.name]
            if (!item) return null
            const active = state.index === index
            const label = t(item.label)
            const a11y = route.name === "bag" && count > 0 ? t("nav.bagCount", { n: count }) : label
            return (
              <PressableScale
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={a11y}
                outerStyle={styles.cell}
                style={styles.cellInner}
                onPress={() => {
                  const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true })
                  if (!active && !event.defaultPrevented) navigateToTab(route.key)
                }}
              >
                {active ? (
                  <View style={styles.pill}>
                    <Icon name={item.icon} size={20} color={colors["primary-text"]} />
                    <Text style={[font("body-sm", 600), styles.pillText]} numberOfLines={1}>
                      {label}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Icon name={item.icon} size={22} color={colors["text-muted"]} />
                  </View>
                )}
                {route.name === "bag" && count > 0 ? (
                  <View style={[styles.badge, active ? styles.badgeActive : null]}>
                    <Text style={styles.badgeText}>{count}</Text>
                  </View>
                ) : null}
              </PressableScale>
            )
          })}
        </View>
      </Glass>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: spacing["4"], right: spacing["4"] },
  bar: { height: sizes["bottom-nav"], borderRadius: radii["2xl"] },
  row: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing["2"] },
  cell: { flex: 1 },
  cellInner: { height: sizes["bottom-nav"], alignItems: "center", justifyContent: "center" },
  pill: {
    height: 40,
    paddingHorizontal: spacing["3"],
    borderRadius: radii.full,
    backgroundColor: colors["tint-2"],
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillText: { color: colors["primary-text"] },
  badge: {
    position: "absolute",
    top: 8,
    left: "50%",
    marginLeft: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: { top: 2, marginLeft: 22 },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 10, lineHeight: 12, color: colors["on-primary"] },
})
