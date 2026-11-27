import { BlurView } from "expo-blur"
import { useEffect, useState, type ComponentRef, type ReactNode, type RefObject } from "react"
import { AccessibilityInfo, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import { colors } from "../lib/theme"

// Glass is used only by the floating bottom navigation, the floating filter bar and the bottom action bar.
const BLUR_INTENSITY = 40

// react-native-web has no AccessibilityInfo for this; the browser exposes a media query.
const webQuery = (): MediaQueryList | undefined =>
  Platform.OS === "web" && typeof window !== "undefined"
    ? window.matchMedia?.("(prefers-reduced-transparency: reduce)")
    : undefined

function useReducedTransparency(): boolean {
  const [reduced, setReduced] = useState(() => webQuery()?.matches ?? false)
  useEffect(() => {
    if (Platform.OS === "web") {
      const query = webQuery()
      if (!query) return
      const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
      query.addEventListener?.("change", onChange)
      return () => query.removeEventListener?.("change", onChange)
    }
    let live = true
    void AccessibilityInfo.isReduceTransparencyEnabled().then((v) => live && setReduced(v))
    const sub = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduced)
    return () => {
      live = false
      sub.remove()
    }
  }, [])
  return reduced
}

/**
 * A translucent white bar with a 20px-style blur and a hairline. Falls back to solid white when the
 * system asks for reduced transparency, or on Android without a blur target (blur there needs the
 * content wrapped in a BlurTargetView, and only Android 12+ blurs at all).
 */
export function Glass({
  children,
  style,
  blurTarget,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  blurTarget?: RefObject<ComponentRef<typeof View> | null>
}) {
  const reduced = useReducedTransparency()
  const solid = reduced || (Platform.OS === "android" && !blurTarget)
  return (
    <View style={[styles.base, solid ? styles.solid : null, style]}>
      {solid ? null : (
        <>
          <BlurView
            intensity={BLUR_INTENSITY}
            tint="light"
            blurMethod="dimezisBlurViewSdk31Plus"
            blurTarget={blurTarget}
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, styles.fill]} />
        </>
      )}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: { overflow: "hidden", borderWidth: 1, borderColor: colors["glass-line"] },
  solid: { backgroundColor: colors.surface },
  fill: { backgroundColor: colors["glass-fill"] },
})
