import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Badge, Button, Checkbox, Drawer, Heading, IconButton, Input, Label, Switch, Text, Textarea, toast } from "@medusajs/ui"
import type { AdminDesignView, DesignPhoto, PublishRequirement } from "@shop/contracts"
import { ShopApiError, shopApi } from "../lib/shop-api"

/** The form as typed: text fields as strings, empty meaning "not given". */
type Form = {
  name: string
  description: string
  fibre: string
  weave: string
  lengthM: string
  widthM: string
  blousePieceIncluded: boolean
  care: string
  countryOfOrigin: string
  taxCode: string
  stitched: boolean
  priceRupees: string
  photos: DesignPhoto[]
}

const EMPTY: Form = {
  name: "",
  description: "",
  fibre: "",
  weave: "",
  lengthM: "",
  widthM: "",
  blousePieceIncluded: false,
  care: "",
  countryOfOrigin: "",
  taxCode: "saree",
  stitched: false,
  priceRupees: "",
  photos: [],
}

function formOf(design: AdminDesignView): Form {
  const a = design.attributes
  return {
    name: design.name,
    description: design.description,
    fibre: a.fibre ?? "",
    weave: a.weave ?? "",
    lengthM: a.lengthM === null ? "" : String(a.lengthM),
    widthM: a.widthM === null ? "" : String(a.widthM),
    blousePieceIncluded: a.blousePieceIncluded,
    care: a.care ?? "",
    countryOfOrigin: a.countryOfOrigin ?? "",
    taxCode: a.taxCode ?? "",
    stitched: a.stitched,
    priceRupees: design.pricePaise === null ? "" : String(design.pricePaise / 100),
    photos: design.photos,
  }
}

const text = (v: string) => (v.trim() === "" ? null : v.trim())
const number = (v: string) => (v.trim() === "" ? null : Number(v))

function attributesOf(form: Form) {
  return {
    fibre: text(form.fibre),
    weave: text(form.weave),
    lengthM: number(form.lengthM),
    widthM: number(form.widthM),
    blousePieceIncluded: form.blousePieceIncluded,
    care: text(form.care),
    countryOfOrigin: text(form.countryOfOrigin),
    taxCode: text(form.taxCode),
    stitched: form.stitched,
  }
}

/** Photos renumbered 0, 1, 2, ... in their current order. */
const renumber = (photos: DesignPhoto[]) => photos.map((p, i) => ({ ...p, position: i }))

type Props = {
  /** The Design to edit, or null to create one. */
  design: AdminDesignView | null
  onClose: () => void
  /** Called with the Design after every successful change. */
  onChanged: (design: AdminDesignView) => void
}

/** Create or edit one Design, upload its photos, set its price and publish it. */
export const DesignEditor = ({ design, onClose, onChanged }: Props) => {
  const { t, i18n } = useTranslation()
  const initial = useMemo(() => (design ? formOf(design) : EMPTY), [design])
  const [form, setForm] = useState<Form>(initial)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [missing, setMissing] = useState<PublishRequirement[]>([])
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm(initial)
    setConfirmed(false)
  }, [initial])

  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }))

  const errorText = (e: unknown) => {
    const code = e instanceof ShopApiError ? e.error.code : "unknown"
    const key = `shopDesigns.errors.${code}`
    return i18n.exists(key) ? t(key) : t("shopDesigns.errors.unknown")
  }

  const save = async () => {
    setBusy(true)
    try {
      let saved: AdminDesignView
      if (!design) {
        saved = (
          await shopApi.createDesign({
            name: form.name,
            description: form.description,
            attributes: attributesOf(form),
            photos: renumber(form.photos),
            priceRupees: Number(form.priceRupees),
          })
        ).design
        toast.success(t("shopDesigns.editor.created"))
      } else {
        saved = (
          await shopApi.updateDesign(design.id, {
            name: form.name,
            description: form.description,
            attributes: attributesOf(form),
            photos: renumber(form.photos),
          })
        ).design
        if (form.priceRupees !== initial.priceRupees) {
          saved = (await shopApi.setPrice(design.id, Number(form.priceRupees))).design
        }
        toast.success(t("shopDesigns.editor.saved"))
      }
      setMissing([])
      onChanged(saved)
    } catch (e) {
      toast.error(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const { files: stored } = await shopApi.uploadPhotos([...files])
      setForm((f) => ({
        ...f,
        photos: renumber([
          ...f.photos,
          ...stored.map((s) => ({ fileId: s.id, url: s.url, role: "other" as const, position: 0 })),
        ]),
      }))
      toast.success(t("shopDesigns.photos.uploaded"))
    } catch (e) {
      toast.error(errorText(e))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ""
    }
  }

  /** Marks one photo as the fabric close-up (only one can be), or unmarks it. */
  const setCloseUp = (index: number, on: boolean) =>
    set(
      "photos",
      form.photos.map((p, i) => {
        if (i === index) return { ...p, role: on ? ("close_up" as const) : ("other" as const) }
        return on ? { ...p, role: "other" as const } : p
      })
    )
  const move = (index: number, by: -1 | 1) => {
    const next = [...form.photos]
    const [photo] = next.splice(index, 1)
    next.splice(index + by, 0, photo!)
    set("photos", renumber(next))
  }
  const remove = (index: number) => set("photos", renumber(form.photos.filter((_, i) => i !== index)))

  const publish = async () => {
    if (!design) return
    setBusy(true)
    try {
      const result = await shopApi.publish(design.id, confirmed)
      setMissing([])
      toast.success(t("shopDesigns.publishing.published"))
      onChanged(result.design)
    } catch (e) {
      if (e instanceof ShopApiError && e.missing.length > 0) setMissing(e.missing)
      else toast.error(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const field = (key: "name" | "fibre" | "weave" | "care" | "countryOfOrigin" | "taxCode", hint?: string) => (
    <div className="flex flex-col gap-y-1">
      <Label htmlFor={`design-${key}`} size="small" weight="plus">
        {t(`shopDesigns.fields.${key}`)}
      </Label>
      <Input id={`design-${key}`} value={form[key]} onChange={(e) => set(key, e.target.value)} />
      {hint ? (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {hint}
        </Text>
      ) : null}
    </div>
  )
  const metres = (key: "lengthM" | "widthM") => (
    <div className="flex flex-col gap-y-1">
      <Label htmlFor={`design-${key}`} size="small" weight="plus">
        {t(`shopDesigns.fields.${key}`)}
      </Label>
      <Input
        id={`design-${key}`}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
      />
    </div>
  )
  const toggle = (key: "blousePieceIncluded" | "stitched") => (
    <div className="flex items-center gap-x-2">
      <Switch id={`design-${key}`} checked={form[key]} onCheckedChange={(v) => set(key, v)} />
      <Label htmlFor={`design-${key}`} size="small">
        {t(`shopDesigns.fields.${key}`)}
      </Label>
    </div>
  )

  return (
    <Drawer open onOpenChange={(open) => (open ? undefined : onClose())}>
      <Drawer.Content aria-describedby={undefined}>
        <Drawer.Header>
          <Drawer.Title>{t(design ? "shopDesigns.editor.editTitle" : "shopDesigns.editor.createTitle")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-8 overflow-y-auto">
          <section className="flex flex-col gap-y-4">
            <Heading level="h3">{t("shopDesigns.editor.details")}</Heading>
            {field("name")}
            <div className="flex flex-col gap-y-1">
              <Label htmlFor="design-description" size="small" weight="plus">
                {t("shopDesigns.fields.description")}
              </Label>
              <Textarea
                id="design-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </section>

          <section className="flex flex-col gap-y-4">
            <Heading level="h3">{t("shopDesigns.editor.attributes")}</Heading>
            <div className="grid grid-cols-2 gap-4">
              {field("fibre")}
              {field("weave")}
              {metres("lengthM")}
              {metres("widthM")}
              {field("care")}
              {field("countryOfOrigin")}
            </div>
            {field("taxCode", t("shopDesigns.fields.taxCodeHint"))}
            <div className="flex flex-col gap-y-3">
              {toggle("blousePieceIncluded")}
              {toggle("stitched")}
            </div>
          </section>

          <section className="flex flex-col gap-y-4">
            <Heading level="h3">{t("shopDesigns.editor.price")}</Heading>
            <div className="flex flex-col gap-y-1">
              <Label htmlFor="design-price" size="small" weight="plus">
                {t("shopDesigns.fields.priceRupees")}
              </Label>
              <Input
                id="design-price"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={form.priceRupees}
                onChange={(e) => set("priceRupees", e.target.value)}
              />
            </div>
          </section>

          <section className="flex flex-col gap-y-4">
            <Heading level="h3">{t("shopDesigns.editor.photos")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("shopDesigns.photos.hint")}
            </Text>
            <div className="flex items-center gap-x-3">
              <Label htmlFor="design-photos" size="small" weight="plus">
                {uploading ? t("shopDesigns.photos.uploading") : t("shopDesigns.photos.add")}
              </Label>
              <input
                ref={fileInput}
                id="design-photos"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={(e) => upload(e.target.files)}
                className="txt-compact-small"
              />
            </div>
            {form.photos.length === 0 ? (
              <Text size="small" className="text-ui-fg-muted">
                {t("shopDesigns.photos.none")}
              </Text>
            ) : (
              <ol className="flex flex-col gap-y-2">
                {form.photos.map((p, i) => (
                  <li
                    key={p.fileId}
                    data-testid="design-photo"
                    className="border-ui-border-base flex items-center gap-x-3 rounded-md border p-2"
                  >
                    <img
                      src={p.url}
                      alt={t("shopDesigns.photos.alt", { n: i + 1 })}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="flex flex-1 items-center gap-x-2">
                      <Checkbox
                        id={`design-close-up-${i}`}
                        checked={p.role === "close_up"}
                        onCheckedChange={(v) => setCloseUp(i, v === true)}
                      />
                      <Label htmlFor={`design-close-up-${i}`} size="small">
                        {t("shopDesigns.photos.closeUp")}
                      </Label>
                    </div>
                    <IconButton
                      size="small"
                      variant="transparent"
                      aria-label={t("shopDesigns.photos.moveUp", { n: i + 1 })}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      ↑
                    </IconButton>
                    <IconButton
                      size="small"
                      variant="transparent"
                      aria-label={t("shopDesigns.photos.moveDown", { n: i + 1 })}
                      disabled={i === form.photos.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      ↓
                    </IconButton>
                    <IconButton
                      size="small"
                      variant="transparent"
                      aria-label={t("shopDesigns.photos.remove", { n: i + 1 })}
                      onClick={() => remove(i)}
                    >
                      ×
                    </IconButton>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {design ? (
            <section className="flex flex-col gap-y-4" aria-labelledby="design-publish-heading">
              <Heading level="h3" id="design-publish-heading">
                {t("shopDesigns.editor.publish")}
              </Heading>
              {design.status === "published" ? (
                <div className="flex flex-col gap-y-1">
                  <Badge color="green" size="small" className="w-fit">
                    {t("shopDesigns.publishing.isPublished")}
                  </Badge>
                  {design.trueColourConfirmation ? (
                    <Text size="small" className="text-ui-fg-subtle">
                      {t("shopDesigns.publishing.confirmedAt", {
                        at: new Date(design.trueColourConfirmation.at).toLocaleString(),
                      })}
                    </Text>
                  ) : null}
                </div>
              ) : (
                <>
                  <Text size="small" className="text-ui-fg-subtle">
                    {t("shopDesigns.publishing.intro")}
                  </Text>
                  <div className="flex items-start gap-x-2">
                    <Checkbox
                      id="design-true-colour"
                      checked={confirmed}
                      onCheckedChange={(v) => setConfirmed(v === true)}
                    />
                    <Label htmlFor="design-true-colour" size="small">
                      {t("shopDesigns.publishing.confirm")}
                    </Label>
                  </div>
                  {missing.length > 0 ? (
                    <div role="alert" className="bg-ui-bg-subtle rounded-md p-3" data-testid="publish-missing">
                      <Text size="small" weight="plus">
                        {t("shopDesigns.publishing.refused")}
                      </Text>
                      <ul className="list-disc pl-5">
                        {missing.map((m) => (
                          <li key={m} data-requirement={m}>
                            <Text size="small">{t(`shopDesigns.missing.${m}`)}</Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {dirty ? (
                    <Text size="small" className="text-ui-fg-subtle">
                      {t("shopDesigns.publishing.saveFirst")}
                    </Text>
                  ) : null}
                  <Button variant="secondary" className="w-fit" disabled={busy || dirty} onClick={publish}>
                    {t("shopDesigns.publishing.button")}
                  </Button>
                </>
              )}
            </section>
          ) : null}
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" onClick={onClose}>
            {t("shopDesigns.editor.cancel")}
          </Button>
          <Button onClick={save} disabled={busy || uploading || (!!design && !dirty)} isLoading={busy}>
            {t("shopDesigns.editor.save")}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
