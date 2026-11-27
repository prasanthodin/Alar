import { router } from "expo-router"
import { StyleSheet, View } from "react-native"
import { EmptyState } from "../src/components/empty-state"
import { TopBar } from "../src/components/top-bar"
import { t } from "../src/lib/i18n"
import { colors } from "../src/lib/theme"

export default function NotFound() {
  return (
    <View style={styles.screen}>
      <TopBar back />
      <EmptyState
        icon="search"
        title={t("notFound.title")}
        body={t("notFound.body")}
        action={{ label: t("common.goHome"), onPress: () => router.replace("/") }}
      />
    </View>
  )
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.surface } })
