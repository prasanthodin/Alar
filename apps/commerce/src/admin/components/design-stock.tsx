import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import {
  MAX_STOCK_PIECES,
  Pieces,
  StockReason,
  type AdminDesignStockResponse,
  type StockMovementView,
} from "@shop/contracts"
import { ShopApiError, shopApi, type AdjustStockRequest } from "../lib/shop-api"

type Props = {
  /** The Design's kernel product id. */
  designId: string
}

type FieldErrors = Partial<Record<"reason" | "set", string>>

/** A signed change as the history shows it: "+10", "-1". */
const signed = (n: number) => (n > 0 ? `+${n}` : String(n))

/**
 * The Stock section of a Design (Story 1.7): stocked, reserved and available
 * Pieces, the two named actions that change the count (set it to a number,
 * or add or remove one Piece), each with a required reason, and the stock
 * history, newest first, a page at a time. The count itself is never an
 * editable field. Each click sends a new request id, so a resent request is
 * applied once.
 */
export const DesignStock = ({ designId }: Props) => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const key = ["shop-design-stock", designId]
  const stock = useQuery({ queryKey: key, queryFn: () => shopApi.getStock(designId) })
  const [reason, setReason] = useState("")
  const [setTo, setSetTo] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState(false)
  // Older history pages loaded with "Show older changes", after the first page.
  const [older, setOlder] = useState<{ rows: StockMovementView[]; next: string | null } | null>(null)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, { dateStyle: "medium", timeStyle: "short" })

  const errorText = (e: unknown) => {
    const code = e instanceof ShopApiError ? e.error.code : "unknown"
    const k = `shopDesigns.errors.${code}`
    return i18n.exists(k) ? t(k) : t("shopDesigns.errors.unknown")
  }

  /** Checks the reason (and the target, for "Set stock") in the browser; marks what is wrong. */
  const validate = (withTarget: boolean): { reason: string; set?: number } | null => {
    const next: FieldErrors = {}
    const parsedReason = StockReason.safeParse(reason)
    if (!parsedReason.success) next.reason = t("shopStock.validation.reason")
    let set: number | undefined
    if (withTarget) {
      const parsedSet = Pieces.max(MAX_STOCK_PIECES).safeParse(setTo.trim() === "" ? Number.NaN : Number(setTo))
      if (!parsedSet.success) next.set = t("shopStock.validation.set", { max: MAX_STOCK_PIECES })
      else set = parsedSet.data
    }
    setErrors(next)
    if (Object.keys(next).length > 0 || !parsedReason.success) return null
    return { reason: parsedReason.data, ...(set !== undefined ? { set } : {}) }
  }

  const apply = async (request: AdjustStockRequest) => {
    setBusy(true)
    try {
      const updated: AdminDesignStockResponse = await shopApi.adjustStock(designId, request)
      setOlder(null)
      if (updated.refreshed) queryClient.setQueryData(key, updated)
      else void queryClient.invalidateQueries({ queryKey: key })
      setReason("")
      setSetTo("")
      setErrors({})
      toast.success(t(updated.refreshed ? "shopStock.saved" : "shopStock.savedNotRefreshed", { stocked: updated.stock.stocked }))
    } catch (e) {
      toast.error(errorText(e))
      // Someone else may have changed it meanwhile: show the count as it is now.
      void queryClient.invalidateQueries({ queryKey: key })
    } finally {
      setBusy(false)
    }
  }

  const setStock = () => {
    const values = validate(true)
    if (values && values.set !== undefined) {
      void apply({ set: values.set, reason: values.reason, requestId: crypto.randomUUID() })
    }
  }
  const change = (delta: 1 | -1) => {
    const values = validate(false)
    if (values) void apply({ delta, reason: values.reason, requestId: crypto.randomUUID() })
  }
  const showOlder = async () => {
    const cursor = older ? older.next : stock.data?.nextBefore
    if (!cursor) return
    setLoadingOlder(true)
    try {
      const page = await shopApi.getStock(designId, cursor)
      setOlder((o) => ({ rows: [...(o?.rows ?? []), ...page.movements], next: page.nextBefore }))
    } catch (e) {
      toast.error(errorText(e))
    } finally {
      setLoadingOlder(false)
    }
  }

  const data = stock.data
  const movements = data ? [...data.movements, ...(older?.rows ?? [])] : []
  const moreCursor = older ? older.next : (data?.nextBefore ?? null)
  const fieldError = (k: keyof FieldErrors) =>
    errors[k] ? (
      <Text size="xsmall" className="text-ui-fg-error" id={`stock-${k}-error`}>
        {errors[k]}
      </Text>
    ) : null

  return (
    <section className="flex flex-col gap-y-4" aria-labelledby="design-stock-heading" data-testid="design-stock">
      <Heading level="h3" id="design-stock-heading">
        {t("shopStock.title")}
      </Heading>
      {stock.isError ? (
        <Text size="small" className="text-ui-fg-error">
          {t("shopStock.loadFailed")}
        </Text>
      ) : !data ? (
        <Text size="small" className="text-ui-fg-subtle">
          {t("shopStock.loading")}
        </Text>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-4">
            {(["stocked", "reserved", "available"] as const).map((k) => (
              <div key={k} className="flex flex-col">
                <Text size="small" className="text-ui-fg-subtle" asChild>
                  <dt>{t(`shopStock.counts.${k}`)}</dt>
                </Text>
                <Text size="large" weight="plus" asChild>
                  <dd data-testid={`stock-${k}`}>{data.stock[k]}</dd>
                </Text>
              </div>
            ))}
          </dl>
          <Text size="xsmall" className="text-ui-fg-subtle">
            {t("shopStock.availableHint")}
          </Text>

          <div className="flex flex-col gap-y-1">
            <Label htmlFor="stock-reason" size="small" weight="plus">
              {t("shopStock.reason")}
            </Label>
            <Input
              id="stock-reason"
              value={reason}
              maxLength={200}
              aria-invalid={!!errors.reason}
              aria-describedby={errors.reason ? "stock-reason-error" : undefined}
              placeholder={t("shopStock.reasonPlaceholder")}
              onChange={(e) => setReason(e.target.value)}
            />
            {fieldError("reason")}
          </div>
          <div className="flex items-end gap-x-2">
            <div className="flex flex-1 flex-col gap-y-1">
              <Label htmlFor="stock-set" size="small" weight="plus">
                {t("shopStock.setTo")}
              </Label>
              <Input
                id="stock-set"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={setTo}
                aria-invalid={!!errors.set}
                aria-describedby={errors.set ? "stock-set-error" : undefined}
                onChange={(e) => setSetTo(e.target.value)}
              />
              {fieldError("set")}
            </div>
            <Button variant="secondary" disabled={busy} onClick={setStock}>
              {t("shopStock.setButton")}
            </Button>
          </div>
          <div className="flex gap-x-2">
            <Button
              variant="secondary"
              size="small"
              disabled={busy || data.stock.available === 0}
              onClick={() => change(-1)}
            >
              {t("shopStock.removeOne")}
            </Button>
            <Button variant="secondary" size="small" disabled={busy} onClick={() => change(1)}>
              {t("shopStock.addOne")}
            </Button>
          </div>

          <Heading level="h3">{t("shopStock.history")}</Heading>
          {movements.length === 0 ? (
            <Text size="small" className="text-ui-fg-muted">
              {t("shopStock.noHistory")}
            </Text>
          ) : (
            <ol className="divide-ui-border-base border-ui-border-base flex flex-col divide-y rounded-md border">
              {movements.map((m) => (
                <li key={m.id} data-testid="stock-movement" className="flex flex-col gap-y-1 p-3">
                  <div className="flex items-baseline justify-between gap-x-3">
                    <Text size="small" weight="plus">
                      <span data-testid="stock-movement-change">{signed(m.change)}</span>{" "}
                      {m.cause === "checkout_hold" || m.cause === "hold_released"
                        ? t("shopStock.heldAfter", { reserved: m.reservedAfter })
                        : t("shopStock.after", { stocked: m.stockedAfter })}
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      {t(`shopStock.causes.${m.cause}`)}
                    </Text>
                  </div>
                  <Text size="small" className="break-words">
                    {m.reason}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle break-all">
                    {t("shopStock.when", {
                      at: formatTime(m.occurredAt),
                      actor: m.actor,
                    })}
                  </Text>
                </li>
              ))}
            </ol>
          )}
          {moreCursor ? (
            <Button variant="transparent" size="small" className="w-fit" disabled={loadingOlder} onClick={showOlder}>
              {t("shopStock.showOlder")}
            </Button>
          ) : null}
        </>
      )}
    </section>
  )
}
