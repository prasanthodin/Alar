import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  Heading,
  IconButton,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import {
  MAX_DESIGN_PHOTOS,
  MAX_PRICE_RUPEES,
  Metres,
  shelfPriceFromRupees,
  UPLOAD_MAX_BYTES,
  UPLOAD_MAX_FILES,
  UPLOAD_MAX_MEGABYTES,
  type AdminDesignView,
  type DesignPhoto,
  type DesignPhotoInput,
  type PublishRequirement,
} from "@shop/contracts"
import { ShopApiError, shopApi } from "../lib/shop-api"
import { DesignStock } from "./design-stock"

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

type FieldErrors = Partial<Record<"name" | "lengthM" | "widthM" | "priceRupees", string>>

/** The Select's value for "no tax code" (a Select item cannot have an empty value). */
const NO_TAX_CODE = "__none"

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
  taxCode: "",
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

/** Photos renumbered 0, 1, 2, ... in their current order. */
const renumber = (photos: DesignPhoto[]) => photos.map((p, i) => ({ ...p, position: i }))

/** Photos as a request names them: file, role and place (the kernel derives the address). */
const photoInputs = (photos: DesignPhoto[]): DesignPhotoInput[] =>
  renumber(photos).map(({ fileId, role, position }) => ({ fileId, role, position }))

/** The files, roles and order of a photo list, to compare two lists. */
const photoKey = (photos: DesignPhoto[]) => JSON.stringify(photos.map((p) => [p.fileId, p.role]))

/** The form without the price, to tell whether anything but the price changed. */
const withoutPrice = (f: Form) => JSON.stringify({ ...f, priceRupees: "" })

type Props = {
  /** The Design to edit, or null to create one. */
  design: AdminDesignView | null
  onClose: () => void
  /** Called with the Design after every successful change. */
  onChanged: (design: AdminDesignView) => void
}

/** Create or edit one Design, upload its photos, set its price and stock, and publish it. */
export const DesignEditor = ({ design, onClose, onChanged }: Props) => {
  const { t, i18n } = useTranslation()
  const initial = useMemo(() => (design ? formOf(design) : EMPTY), [design])
  const [form, setForm] = useState<Form>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [photosConfirmed, setPhotosConfirmed] = useState(false)
  const [missing, setMissing] = useState<{ items: PublishRequirement[]; onSave: boolean }>({ items: [], onSave: false })
  const fileInput = useRef<HTMLInputElement>(null)
  const taxCodes = useQuery({ queryKey: ["shop-tax-codes"], queryFn: shopApi.listTaxCodes })
  const limits = { maxFiles: MAX_DESIGN_PHOTOS, maxMb: UPLOAD_MAX_MEGABYTES }

  // A different Design (or a new one just created) starts from its saved values.
  useEffect(() => {
    setForm(initial)
    setErrors({})
    setConfirmed(false)
    setPhotosConfirmed(false)
    setMissing({ items: [], onSave: false })
  }, [design?.id])

  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const photosChanged = photoKey(form.photos) !== photoKey(initial.photos)
  const needsReconfirm = design?.status === "published" && photosChanged
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }))

  const errorText = (e: unknown) => {
    if (e instanceof ShopApiError && e.uploadReason) {
      return t(`shopDesigns.uploadReasons.${e.uploadReason}`, limits)
    }
    const code = e instanceof ShopApiError ? e.error.code : "unknown"
    const key = `shopDesigns.errors.${code}`
    return i18n.exists(key) ? t(key) : t("shopDesigns.errors.unknown")
  }

  /** Checks the form in the browser; returns the values to send, or null after marking the bad fields. */
  const validate = () => {
    const next: FieldErrors = {}
    if (!form.name.trim()) next.name = t("shopDesigns.validation.name")
    const price = shelfPriceFromRupees(form.priceRupees.trim() === "" ? undefined : Number(form.priceRupees))
    if (!price.ok) next.priceRupees = t("shopDesigns.validation.price", { max: MAX_PRICE_RUPEES })
    const metres = (key: "lengthM" | "widthM") => {
      const raw = form[key].trim()
      if (raw === "") {
        if (initial[key] !== "") next[key] = t("shopDesigns.validation.metresRequired")
        return null
      }
      const parsed = Metres.safeParse(Number(raw))
      if (!parsed.success) {
        next[key] = t("shopDesigns.validation.metres")
        return null
      }
      return parsed.data
    }
    const lengthM = metres("lengthM")
    const widthM = metres("widthM")
    setErrors(next)
    if (Object.keys(next).length > 0 || !price.ok) {
      toast.error(t("shopDesigns.validation.fix"))
      return null
    }
    return {
      priceRupees: price.data / 100,
      attributes: {
        fibre: text(form.fibre),
        weave: text(form.weave),
        lengthM,
        widthM,
        blousePieceIncluded: form.blousePieceIncluded,
        care: text(form.care),
        countryOfOrigin: text(form.countryOfOrigin),
        taxCode: text(form.taxCode),
        stitched: form.stitched,
      },
    }
  }

  /** Shows the missing items of a refusal, or a notice for any other error. */
  const refused = (e: unknown, onSave: boolean) => {
    if (e instanceof ShopApiError && e.missing.length > 0) setMissing({ items: e.missing, onSave })
    else toast.error(errorText(e))
  }

  const save = async () => {
    const values = validate()
    if (!values) return
    setBusy(true)
    setMissing({ items: [], onSave: false })
    try {
      if (!design) {
        const { design: created } = await shopApi.createDesign({
          name: form.name,
          description: form.description,
          attributes: values.attributes,
          photos: photoInputs(form.photos),
          priceRupees: values.priceRupees,
        })
        toast.success(t("shopDesigns.editor.created"))
        onChanged(created)
        return
      }
      let saved = design
      if (withoutPrice(form) !== withoutPrice(initial)) {
        saved = (
          await shopApi.updateDesign(design.id, {
            name: form.name,
            description: form.description,
            attributes: values.attributes,
            photos: photoInputs(form.photos),
            ...(needsReconfirm ? { trueColourConfirmed: photosConfirmed } : {}),
          })
        ).design
        // Saved: the page shows it at once, even if the price below is refused.
        onChanged(saved)
      }
      if (form.priceRupees !== initial.priceRupees) {
        try {
          saved = (await shopApi.setPrice(design.id, values.priceRupees)).design
          onChanged(saved)
        } catch (e) {
          if (saved !== design) toast.error(t("shopDesigns.editor.priceFailed"))
          throw e
        }
      }
      setForm(formOf(saved))
      setPhotosConfirmed(false)
      toast.success(t("shopDesigns.editor.saved"))
    } catch (e) {
      refused(e, true)
    } finally {
      setBusy(false)
    }
  }

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const chosen = [...files]
    const reset = () => {
      if (fileInput.current) fileInput.current.value = ""
    }
    if (form.photos.length + chosen.length > MAX_DESIGN_PHOTOS || chosen.length > UPLOAD_MAX_FILES) {
      toast.error(t("shopDesigns.photos.tooMany", limits))
      return reset()
    }
    const large = chosen.find((f) => f.size > UPLOAD_MAX_BYTES)
    if (large) {
      toast.error(t("shopDesigns.photos.tooLarge", { ...limits, name: large.name }))
      return reset()
    }
    setUploading(true)
    try {
      const { files: stored } = await shopApi.uploadPhotos(chosen)
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
      reset()
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
    setMissing({ items: [], onSave: false })
    try {
      const result = await shopApi.publish(design.id, confirmed)
      toast.success(t("shopDesigns.publishing.published"))
      onChanged(result.design)
    } catch (e) {
      refused(e, false)
    } finally {
      setBusy(false)
    }
  }

  // Preview: the website shows the Design as a Shopper would see it, for an hour,
  // once it has a price and a photo. The tab is opened on the click itself (so no
  // popup blocker stops it) and sent to the signed link when it arrives.
  const previewable = !!design && design.pricePaise !== null && design.photos.length > 0
  const openPreview = async () => {
    if (!design) return
    const tab = window.open("", "_blank")
    if (!tab) {
      // Blocked: say so, and never take the Admin away from the panel.
      toast.error(t("shopDesigns.preview.popupBlocked"))
      return
    }
    try {
      const { url } = await shopApi.preview(design.id)
      tab.opener = null
      tab.location.href = url
    } catch (e) {
      tab.close()
      const missing = e instanceof ShopApiError ? e.missing : []
      toast.error(t(missing.length ? "shopDesigns.preview.needs" : "shopDesigns.preview.failed"))
    }
  }

  const fieldError = (key: keyof FieldErrors) =>
    errors[key] ? (
      <Text size="xsmall" className="text-ui-fg-error" id={`design-${key}-error`}>
        {errors[key]}
      </Text>
    ) : null

  const field = (key: "name" | "fibre" | "weave" | "care" | "countryOfOrigin") => (
    <div className="flex flex-col gap-y-1">
      <Label htmlFor={`design-${key}`} size="small" weight="plus">
        {t(`shopDesigns.fields.${key}`)}
      </Label>
      <Input
        id={`design-${key}`}
        value={form[key]}
        aria-invalid={key === "name" && !!errors.name}
        onChange={(e) => set(key, e.target.value)}
      />
      {key === "name" ? fieldError("name") : null}
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
        aria-invalid={!!errors[key]}
        onChange={(e) => set(key, e.target.value)}
      />
      {fieldError(key)}
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

  // The codes with a band now, plus the Design's own code if it no longer has one.
  const codeOptions = [...new Set([...(taxCodes.data?.taxCodes ?? []), ...(initial.taxCode ? [initial.taxCode] : [])])]

  const missingList = missing.items.length > 0 ? (
    <div role="alert" className="bg-ui-bg-subtle rounded-md p-3" data-testid="publish-missing">
      <Text size="small" weight="plus">
        {t(missing.onSave ? "shopDesigns.publishing.refusedSave" : "shopDesigns.publishing.refused")}
      </Text>
      <ul className="list-disc pl-5">
        {missing.items.map((m) => (
          <li key={m} data-requirement={m}>
            <Text size="small">{t(`shopDesigns.missing.${m}`)}</Text>
          </li>
        ))}
      </ul>
    </div>
  ) : null

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
            <div className="flex flex-col gap-y-1">
              <Label htmlFor="design-taxCode" size="small" weight="plus">
                {t("shopDesigns.fields.taxCode")}
              </Label>
              <Select
                value={form.taxCode === "" ? undefined : form.taxCode}
                onValueChange={(v) => set("taxCode", v === NO_TAX_CODE ? "" : v)}
              >
                <Select.Trigger id="design-taxCode" aria-label={t("shopDesigns.fields.taxCode")}>
                  <Select.Value placeholder={t("shopDesigns.fields.taxCodePlaceholder")} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value={NO_TAX_CODE}>{t("shopDesigns.fields.taxCodeNone")}</Select.Item>
                  {codeOptions.map((code) => (
                    <Select.Item key={code} value={code}>
                      {code}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Text size="xsmall" className={taxCodes.isError ? "text-ui-fg-error" : "text-ui-fg-subtle"}>
                {taxCodes.isError ? t("shopDesigns.taxCodesFailed") : t("shopDesigns.fields.taxCodeHint")}
              </Text>
            </div>
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
                aria-invalid={!!errors.priceRupees}
                onChange={(e) => set("priceRupees", e.target.value)}
              />
              {fieldError("priceRupees")}
            </div>
          </section>

          {design ? <DesignStock designId={design.id} /> : null}

          <section className="flex flex-col gap-y-4">
            <Heading level="h3">{t("shopDesigns.editor.photos")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("shopDesigns.photos.hint", limits)}
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
                disabled={uploading || form.photos.length >= MAX_DESIGN_PHOTOS}
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
            {needsReconfirm ? (
              <div className="flex flex-col gap-y-1">
                <Text size="small" className="text-ui-fg-subtle">
                  {t("shopDesigns.photos.reconfirmHint")}
                </Text>
                <div className="flex items-start gap-x-2">
                  <Checkbox
                    id="design-photos-true-colour"
                    checked={photosConfirmed}
                    onCheckedChange={(v) => setPhotosConfirmed(v === true)}
                  />
                  <Label htmlFor="design-photos-true-colour" size="small">
                    {t("shopDesigns.photos.reconfirm")}
                  </Label>
                </div>
              </div>
            ) : null}
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
                  {missingList}
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
                  {missingList}
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
              <div className="border-ui-border-base flex flex-col gap-y-2 border-t pt-4">
                <Text size="small" className="text-ui-fg-subtle">
                  {t(previewable ? "shopDesigns.preview.intro" : "shopDesigns.preview.needs")}
                </Text>
                <Button
                  variant="secondary"
                  className="w-fit"
                  disabled={busy || dirty || !previewable}
                  onClick={openPreview}
                  data-testid="design-preview"
                >
                  {t("shopDesigns.preview.button")}
                </Button>
              </div>
            </section>
          ) : (
            missingList
          )}
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
