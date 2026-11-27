import type { DesignView, ImageRef } from "@shop/api-client"
import { lowStockCount, formatRupees } from "@shop/contracts"
import { BlurTargetView } from "expo-blur"
import { router, useLocalSearchParams } from "expo-router"
import { useRef, useState, type ComponentRef } from "react"
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ActionBar } from "../../src/components/action-bar"
import { Button } from "../../src/components/button"
import { EmptyState, ErrorState, Skeleton } from "../../src/components/empty-state"
import { Icon, type IconName } from "../../src/components/icon"
import { Photo, PhotoLabel, RatingChip } from "../../src/components/photo"
import { PriceRow } from "../../src/components/price"
import { PressableScale } from "../../src/components/pressable-scale"
import { TextLink } from "../../src/components/text-link"
import { TopBar } from "../../src/components/top-bar"
import { badgeCount, bagLabel, errorText, t } from "../../src/lib/i18n"
import { useResult, useShop } from "../../src/lib/shop"
import { colors, fontFamilies, radii, sizes, spacing, font } from "../../src/lib/theme"

const GALLERY_MAX_HEIGHT = 400

function BagButton() {
  const { bag } = useShop()
  const count = bag?.count ?? 0
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={bagLabel(count)}
      onPress={() => router.navigate("/bag")}
      style={styles.iconBtn}
    >
      <Icon name="bag" size={22} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount(count)}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

function Tile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale accessibilityRole="button" onPress={onPress} outerStyle={styles.flex} style={styles.tile}>
      <Icon name={icon} size={18} color={colors.primary} />
      <Text style={font("body-sm", 600)} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  )
}

function Gallery({
  design,
  pages,
  width,
  scrollRef,
}: {
  design: DesignView
  pages: { image: ImageRef; full: boolean }[]
  width: number
  scrollRef: React.RefObject<ComponentRef<typeof ScrollView> | null>
}) {
  const [index, setIndex] = useState(0)
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return
    const raw = Math.round(e.nativeEvent.contentOffset.x / width)
    const next = Math.min(Math.max(Number.isFinite(raw) ? raw : 0, 0), pages.length - 1)
    if (next !== index) setIndex(next)
  }
  // Photos are 4:5; the frame is capped so price and colours stay in view on a phone. Each photo is
  // shown whole ("contain") on the neutral photo ground rather than cropped to fit.
  const height = Math.min(Math.round((width * 5) / 4), GALLERY_MAX_HEIGHT)
  return (
    <View>
      <ScrollView
        ref={scrollRef}
        style={{ width }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
      >
        {pages.map((p, i) => (
          <Photo
            key={`${p.image.url}-${i}`}
            image={p.image}
            radius={0}
            fit="contain"
            style={{ width, height }}
          >
            {i === 0 && design.badge ? <PhotoLabel text={design.badge} /> : null}
            {i === 0 && design.rating ? <RatingChip value={design.rating.value} count={design.rating.count} /> : null}
          </Photo>
        ))}
      </ScrollView>
      {pages.length > 1 ? (
        <View style={styles.counter} accessibilityLabel={t("product.photo", { n: index + 1, total: pages.length })}>
          <Text style={font("label", 700)}>
            {index + 1}/{pages.length}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

function DesignPage({ design }: { design: DesignView }) {
  const insets = useSafeAreaInsets()
  const { width: windowWidth } = useWindowDimensions()
  const width = Math.min(windowWidth, 640)
  const { addToBag } = useShop()
  const galleryRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const blurTarget = useRef<ComponentRef<typeof View>>(null)
  const [variantId, setVariantId] = useState(
    (design.variants.find((v) => v.stock > 0) ?? design.variants[0]!).id
  )
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null)
  const variant = design.variants.find((v) => v.id === variantId) ?? design.variants[0]!
  const low = lowStockCount(variant.stock)
  // Every available Piece is held by Shoppers who are paying (Story 1.9): unavailable for now, not sold out.
  const held = design.availability === "held"

  // The gallery follows the chosen colour. The extra photos and the full view show the Design's
  // main colour, so they appear only when that colour is chosen.
  const mainColour = variant.swatch.url === design.images[0]!.url
  const pages = mainColour
    ? [
        ...design.images.map((image) => ({ image, full: false })),
        ...(design.fullView ? [{ image: design.fullView, full: true }] : []),
      ]
    : [{ image: variant.swatch, full: false }]
  const hasFullView = pages.some((p) => p.full)
  const [pending, setPending] = useState(false)
  // The ref stops a second tap in the same frame, before the disabled state has rendered.
  const inFlight = useRef(false)

  const add = async (then?: () => void) => {
    if (inFlight.current) return
    inFlight.current = true
    setPending(true)
    try {
      const res = await addToBag(variant.id)
      if (res.ok) {
        setMessage({ tone: "ok", text: t("product.added") })
        AccessibilityInfo.announceForAccessibility(t("product.added"))
        then?.()
      } else if (res.error.code === "bag.stock_exceeded") {
        setMessage({ tone: "error", text: t("product.stockLimit", { n: variant.stock }) })
      } else {
        setMessage({ tone: "error", text: errorText(res.error.code) })
      }
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }

  const share = async () => {
    try {
      await Share.share({ message: t("product.shareMessage", { name: design.name, price: formatRupees(design.price) }) })
    } catch {
      // Sharing is not available on every browser; nothing to undo.
    }
  }

  return (
    <View style={styles.screen}>
      <TopBar back trailing={<BagButton />} />
      <BlurTargetView ref={blurTarget} style={styles.flex}>
        <ScrollView contentContainerStyle={{ paddingBottom: 132 + insets.bottom }}>
          <Gallery key={variant.id} design={design} pages={pages} width={width} scrollRef={galleryRef} />

          <View style={styles.tiles}>
            {hasFullView ? (
              <Tile
                icon="expand"
                label={t("product.fullSaree")}
                onPress={() => galleryRef.current?.scrollTo({ x: width * (pages.length - 1), animated: true })}
              />
            ) : null}
            <Tile icon="spark" label={t("product.tryOn")} onPress={() => router.navigate("/try-on")} />
            <Tile icon="share" label={t("product.share")} onPress={() => void share()} />
          </View>

          <View style={styles.section}>
            <Text style={font("h3")} accessibilityRole="header">
              {design.name}
            </Text>
            <Text style={[font("body-sm"), styles.muted]}>{design.subtitle}</Text>
            <View style={styles.priceGap}>
              <PriceRow price={design.price} mrp={design.mrp} large />
            </View>
            <Text style={[font("caption"), styles.muted]}>{t("common.taxes")}</Text>
          </View>

          <View style={[styles.section, styles.ruleTop]}>
            <Text style={font("h4")}>
              {t("product.colour")}: <Text style={font("body-sm")}>{variant.colourName}</Text>
            </Text>
            <View style={styles.swatches} accessibilityRole="radiogroup">
              {design.variants.map((v) => {
                const on = v.id === variant.id
                const soldOut = v.stock === 0
                return (
                  <Pressable
                    key={v.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={soldOut ? `${v.colourName}, ${t("common.soldOut")}` : v.colourName}
                    onPress={() => {
                      setVariantId(v.id)
                      setMessage(null)
                    }}
                    style={[styles.swatch, on && styles.swatchOn]}
                  >
                    <Photo image={v.swatch} radius={radii.sm - 2} style={[styles.swatchPhoto, soldOut && styles.dim]} />
                    {soldOut ? <View style={styles.strike} /> : null}
                  </Pressable>
                )
              })}
            </View>
            {variant.stock === 0 && held ? (
              <View style={[styles.note, { backgroundColor: colors["tint-2"] }]}>
                <Text style={[font("caption", 600), { color: colors["primary-text"] }]}>{t("common.heldNow")}</Text>
              </View>
            ) : variant.stock === 0 ? (
              <View style={[styles.note, { backgroundColor: colors["danger-tint"] }]}>
                <Text style={[font("caption", 600), { color: colors.danger }]}>{t("common.soldOut")}</Text>
              </View>
            ) : low !== null ? (
              <View style={[styles.note, { backgroundColor: colors["warning-tint"] }]}>
                <Text style={[font("caption", 600), { color: colors.warning }]}>{t("common.onlyLeft", { n: low })}</Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.section, styles.ruleTop]}>
            <Text style={font("h4")} accessibilityRole="header">
              {t("product.details")}
            </Text>
            <View style={styles.specs}>
              {design.attributes.map((a) => (
                <View key={a.label} style={styles.spec}>
                  <Text style={[font("caption"), styles.muted]}>{a.label}</Text>
                  <Text style={font("body-sm", 600)}>{a.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {pages.some((p) => p.image.isSample) ? (
            <View style={[styles.section, styles.ruleTop]}>
              <View style={[styles.note, styles.sample]}>
                <Icon name="info" size={16} color={colors["text-muted"]} />
                <Text style={[font("caption"), styles.sampleText]}>{t("product.sample")}</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </BlurTargetView>

      <ActionBar blurTarget={blurTarget}>
        {message ? (
          <View style={styles.message} accessibilityLiveRegion="polite">
            <Text style={[font("caption", 600), { color: message.tone === "ok" ? colors.success : colors.danger, flex: 1 }]}>
              {message.text}
            </Text>
            {message.tone === "ok" ? (
              <TextLink size="caption" label={t("product.viewBag")} onPress={() => router.navigate("/bag")} />
            ) : null}
          </View>
        ) : null}
        {variant.stock === 0 ? (
          <View style={styles.soldOutBar}>
            {held ? (
              <Text style={[font("body-sm", 600), { color: colors["primary-text"] }]}>{t("product.heldBar")}</Text>
            ) : (
              <Text style={[font("body-sm", 600), { color: colors.danger }]}>{t("product.soldOutBar")}</Text>
            )}
          </View>
        ) : (
          <View style={styles.buttons}>
            <Button
              flex
              kind="outline"
              disabled={pending}
              label={t("product.buyNow")}
              onPress={() => void add(() => router.navigate("/bag"))}
            />
            <Button flex icon="bag" disabled={pending} label={t("product.addToBag")} onPress={() => void add()} />
          </View>
        )}
      </ActionBar>
    </View>
  )
}

export default function DesignScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const design = useResult(`design:${id}`, (api) => api.getDesign(id))

  if (design.status === "ok") return <DesignPage design={design.data} />

  return (
    <View style={styles.screen}>
      <TopBar back trailing={<BagButton />} />
      {design.status === "loading" ? (
        <View style={styles.loading}>
          <Skeleton height={420} radius={0} />
          <View style={styles.section}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={16} width="40%" />
          </View>
        </View>
      ) : design.error.code === "design.not_found" ? (
        <EmptyState
          icon="search"
          title={t("product.notFound.title")}
          body={t("product.notFound.body")}
          action={{ label: t("common.goHome"), onPress: () => router.navigate("/") }}
        />
      ) : (
        <ErrorState code={design.error.code} onRetry={design.reload} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  muted: { color: colors["text-muted"] },
  loading: { gap: spacing["4"] },
  iconBtn: { width: spacing["touch-min"], height: spacing["touch-min"], alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: 6,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontFamily: fontFamilies.body700, fontSize: 10, lineHeight: 12, color: colors["on-primary"] },
  counter: {
    position: "absolute",
    right: spacing["3"],
    bottom: spacing["3"],
    height: 22,
    paddingHorizontal: spacing["2"],
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  tiles: { flexDirection: "row", gap: spacing["2"], paddingHorizontal: spacing["4"], paddingTop: spacing["3"] },
  tile: {
    height: sizes["action-tile"],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors["tint-3"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  section: { paddingHorizontal: spacing["4"], paddingVertical: spacing["4"], gap: spacing["1"] },
  ruleTop: { borderTopWidth: 1, borderTopColor: colors.border, gap: spacing["3"] },
  priceGap: { marginTop: spacing["2"] },
  swatches: { flexDirection: "row", gap: spacing["2"], flexWrap: "wrap" },
  swatch: { padding: 2, borderRadius: radii.sm, borderWidth: 2, borderColor: "transparent" },
  swatchOn: { borderColor: colors.primary },
  swatchPhoto: { width: 52, height: 65 },
  dim: { opacity: 0.45 },
  strike: {
    position: "absolute",
    left: 4,
    right: 4,
    top: "50%",
    height: 2,
    backgroundColor: colors["text-muted"],
    transform: [{ rotate: "-35deg" }],
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.md,
  },
  specs: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: colors["tint-3"],
    borderRadius: radii.xl,
    padding: spacing["4"],
    rowGap: spacing["3"],
  },
  spec: { width: "50%", gap: 2, paddingRight: spacing["2"] },
  sample: { alignSelf: "stretch", backgroundColor: colors["neutral-tint"], alignItems: "flex-start" },
  sampleText: { flex: 1, color: colors["text-muted"] },
  message: { flexDirection: "row", alignItems: "center", gap: spacing["2"] },
  buttons: { flexDirection: "row", gap: spacing["2"] },
  soldOutBar: { height: sizes.button, justifyContent: "center", alignItems: "center" },
})
