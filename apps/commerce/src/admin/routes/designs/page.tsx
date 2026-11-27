import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Table, Text } from "@medusajs/ui"
import { formatRupees, type AdminDesignView } from "@shop/contracts"
import { DesignEditor } from "../../components/design-editor"
import { shopApi } from "../../lib/shop-api"

const DESIGNS_KEY = ["shop-designs"]

/**
 * The shop's Designs page (Story 1.6): the list of Designs with name, price
 * and status; a right-hand panel creates or edits one, uploads its photos,
 * sets its price and publishes it. Calls only `/admin/shop/*`.
 */
const DesignsPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({ queryKey: DESIGNS_KEY, queryFn: shopApi.listDesigns })
  // null: closed; "new": creating; otherwise the Design being edited.
  const [open, setOpen] = useState<AdminDesignView | "new" | null>(null)

  const onChanged = (design: AdminDesignView) => {
    setOpen(design)
    queryClient.invalidateQueries({ queryKey: DESIGNS_KEY })
  }

  const designs = data?.designs ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">{t("shopDesigns.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("shopDesigns.subtitle")}
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setOpen("new")}>
          {t("shopDesigns.create")}
        </Button>
      </div>
      {isError ? (
        <Text className="text-ui-fg-error px-6 py-4">{t("shopDesigns.loadFailed")}</Text>
      ) : !isLoading && designs.length === 0 ? (
        <Text className="text-ui-fg-subtle px-6 py-4">{t("shopDesigns.empty")}</Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t("shopDesigns.columns.name")}</Table.HeaderCell>
              <Table.HeaderCell>{t("shopDesigns.columns.price")}</Table.HeaderCell>
              <Table.HeaderCell>{t("shopDesigns.columns.status")}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {designs.map((d) => (
              <Table.Row key={d.id} className="cursor-pointer" onClick={() => setOpen(d)} data-testid="design-row">
                <Table.Cell>
                  <button type="button" className="text-left" onClick={() => setOpen(d)}>
                    {d.name}
                  </button>
                </Table.Cell>
                <Table.Cell>{d.pricePaise === null ? t("shopDesigns.noPrice") : formatRupees(d.pricePaise)}</Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color={d.status === "published" ? "green" : "grey"}>
                    {t(`shopDesigns.status.${d.status}`)}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      {open ? (
        <DesignEditor design={open === "new" ? null : open} onClose={() => setOpen(null)} onChanged={onChanged} />
      ) : null}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "shopDesigns.nav",
  translationNs: "translation",
})

export default DesignsPage
