import type { ComponentRef, ReactNode, RefObject } from "react"
import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { spacing } from "../lib/theme"
import { Glass } from "./glass"

/** Full-width glass bar at the bottom of a purchase screen, in place of the navigation. */
export function ActionBar({ children, blurTarget }: { children: ReactNode; blurTarget?: RefObject<ComponentRef<typeof View> | null> }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={styles.wrap}>
      <Glass blurTarget={blurTarget} style={[styles.bar, { paddingBottom: spacing["3"] + insets.bottom }]}>
        {children}
      </Glass>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bar: {
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    paddingTop: spacing["2"],
    paddingHorizontal: spacing["4"],
    gap: spacing["2"],
  },
})
