import { router } from "expo-router"
import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { EmptyState } from "../../src/components/empty-state"
import { TopBar } from "../../src/components/top-bar"
import { t } from "../../src/lib/i18n"
import { colors, FLOATING_NAV_CLEARANCE } from "../../src/lib/theme"

/** Placeholder: the real Try-on (consent, photo, AI picture) is out of scope for this shell. */
export default function TryOn() {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.screen, { paddingBottom: FLOATING_NAV_CLEARANCE + insets.bottom }]}>
      <TopBar title={t("tryOn.title")} />
      <EmptyState
        icon="spark"
        title={t("tryOn.empty.title")}
        body={t("tryOn.empty.body")}
        action={{ label: t("tryOn.empty.cta"), onPress: () => router.navigate("/") }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
})
