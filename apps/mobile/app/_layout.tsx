import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular"
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium"
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold"
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold"
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold"
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ShopProvider } from "../src/lib/shop"
import { colors, fontFamilies } from "../src/lib/theme"

void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    [fontFamilies.heading700]: PlusJakartaSans_700Bold,
    [fontFamilies.heading800]: PlusJakartaSans_800ExtraBold,
    [fontFamilies.body400]: Inter_400Regular,
    [fontFamilies.body500]: Inter_500Medium,
    [fontFamilies.body600]: Inter_600SemiBold,
    [fontFamilies.body700]: Inter_700Bold,
  })

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync()
  }, [loaded, error])

  // A font that fails to load falls back to the system face rather than blocking the app.
  if (!loaded && !error) return null

  return (
    <SafeAreaProvider>
      <ShopProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }} />
      </ShopProvider>
    </SafeAreaProvider>
  )
}
