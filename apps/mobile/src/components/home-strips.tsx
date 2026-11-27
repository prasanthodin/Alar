import { Pressable, StyleSheet, Text, View } from "react-native"
import { t, type MessageKey } from "../lib/i18n"
import { colors, radii, spacing, font } from "../lib/theme"
import { Icon, type IconName } from "./icon"

/** Delivery place. With no account yet, it asks for a PIN code. */
export function AddressBar() {
  return (
    <View style={styles.address}>
      <Icon name="pin" size={16} color={colors.primary} />
      <Text style={[font("body-sm"), styles.addressText]} numberOfLines={1}>
        {t("home.deliverTo")} <Text style={font("body-sm", 700)}>{t("home.addPin")}</Text>
      </Text>
      <Icon name="right" size={16} color={colors["text-muted"]} />
    </View>
  )
}

export type HomeTab = { id: string; label: MessageKey }

/** Department tabs. While one department is live they show its top categories. */
export function DepartmentTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: HomeTab[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const on = tab.id === active
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(tab.id)}
            style={[styles.tab, on && styles.tabOn]}
          >
            <Text style={[font("overline"), { color: on ? colors["primary-text"] : colors["text-muted"] }]}>
              {t(tab.label)}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const SERVICES: { icon: IconName; title: MessageKey; text: MessageKey }[] = [
  { icon: "truck", title: "home.service.delivery", text: "home.service.deliveryText" },
  { icon: "undo", title: "home.service.returns", text: "home.service.returnsText" },
  { icon: "lock", title: "home.service.payment", text: "home.service.paymentText" },
]

export function ServiceStrip() {
  return (
    <View style={styles.services}>
      {SERVICES.map((s) => (
        <View key={s.title} style={styles.service}>
          <Icon name={s.icon} size={18} color={colors.primary} />
          <Text style={[font("overline"), { color: colors["primary-text"] }]}>{t(s.title)}</Text>
          <Text style={[font("caption"), { color: colors["text-muted"] }]}>{t(s.text)}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  address: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    paddingHorizontal: spacing["gutter-phone"],
  },
  addressText: { flex: 1 },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: spacing["gutter-phone"],
    gap: spacing["5"],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    minHeight: spacing["touch-min"],
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  tabOn: { borderBottomColor: colors.primary },
  services: {
    flexDirection: "row",
    borderRadius: radii.xl,
    backgroundColor: colors["tint-1"],
    padding: spacing["3"],
    gap: spacing["2"],
  },
  service: { flex: 1, gap: 2 },
})
