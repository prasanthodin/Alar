import { formatRupees, type DesignCard as DesignCardView } from "@shop/contracts"
import Link from "next/link"
import { t } from "@/lib/i18n"
import { Photo } from "./photo"
import { StatusChip } from "./ui"

/** A Design in the list: photo on neutral grey, name, one line of detail, price. */
export function DesignCard({ design }: { design: DesignCardView }) {
  return (
    <Link href={`/designs/${encodeURIComponent(design.handle)}`} data-testid="design-card" className="group flex flex-col gap-2">
      <Photo image={design.image} className="w-full" />
      <div className="flex flex-col gap-0.5">
        <span className="text-body-sm font-bold text-text group-hover:text-primary-text">{design.name}</span>
        {design.subtitle ? <span className="text-caption text-text-muted">{design.subtitle}</span> : null}
        <span className="flex items-center gap-2">
          <span className="font-heading text-price" data-testid="design-card-price">
            {formatRupees(design.price)}
          </span>
          {design.availability === "sold_out" ? <StatusChip tone="danger">{t("design.soldOut")}</StatusChip> : null}
          {design.availability === "held" ? <StatusChip tone="lavender">{t("design.held")}</StatusChip> : null}
        </span>
      </div>
    </Link>
  )
}
