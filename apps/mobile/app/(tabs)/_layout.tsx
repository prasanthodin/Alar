import { Tabs } from "expo-router"
import { GlassNav } from "../../src/components/glass-nav"
import { t } from "../../src/lib/i18n"
import { colors } from "../../src/lib/theme"

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassNav {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.surface } }}
    >
      <Tabs.Screen name="index" options={{ title: t("nav.home") }} />
      <Tabs.Screen name="categories" options={{ title: t("nav.categories") }} />
      <Tabs.Screen name="try-on" options={{ title: t("nav.tryOn") }} />
      <Tabs.Screen name="bag" options={{ title: t("nav.bag") }} />
    </Tabs>
  )
}
