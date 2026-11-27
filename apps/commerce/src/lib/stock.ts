import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MathBN, Modules } from "@medusajs/framework/utils"
import { availablePieces, StockLocationId, StockMovementView, VariantStockView } from "@shop/contracts"
import type { StockMovementRow } from "../modules/stock-ledger"
import { SETTINGS_MODULE } from "../modules/settings"
import type SettingsModuleService from "../modules/settings/service"
import { shopError } from "./shop-errors"

/**
 * The shop's one stock location (Story 1.7): India. Every Design's Variant
 * has one inventory item with a level here. There is never a second one.
 */
export const SHOP_STOCK_LOCATION = { name: "India", countryCode: "IN" } as const

/** A fault on the shop's side, answered as 500 `internal`. */
const internal = (message: string) => shopError("internal", message)

/** A kernel quantity (number or big number) as a JavaScript number. */
export function quantity(value: unknown): number {
  if (value === null || value === undefined) return 0
  return MathBN.convert(value as never).toNumber()
}

type LocationRow = { id: string; name?: string | null; created_at?: Date | string | null; address?: { country_code?: string | null } | null }

/** The stock locations, oldest first. */
async function listLocations(container: MedusaContainer): Promise<LocationRow[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "created_at", "address.country_code"],
  })
  return (data as unknown as LocationRow[])
    .slice()
    .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime())
}

const inIndia = (l: LocationRow) => (l.address?.country_code ?? "").toUpperCase() === SHOP_STOCK_LOCATION.countryCode

/** The setting that holds the India stock location's id, written by the stock seed. */
export const STOCK_LOCATION_SETTING = "stock.location_id" as const

/** The India location found by its address (oldest first), for the seed and as a fallback. */
export async function findIndiaLocationByAddress(container: MedusaContainer): Promise<string | null> {
  return (await listLocations(container)).find(inIndia)?.id ?? null
}

/**
 * The India stock location's id, from the setting `stock.location_id`, or
 * null when it has not been seeded. Without the setting (a database seeded
 * before it existed) it falls back to the location with an IN address, with
 * a warning; a second IN location is never picked over the stored one.
 */
export async function findShopStockLocationId(container: MedusaContainer): Promise<string | null> {
  const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
  if (await settings.hasValue(STOCK_LOCATION_SETTING)) {
    return StockLocationId.parse(await settings.getValue(STOCK_LOCATION_SETTING))
  }
  const id = await findIndiaLocationByAddress(container)
  if (id) {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(`stock: the setting ${STOCK_LOCATION_SETTING} is missing; using the IN stock location ${id} (run db:migrate)`)
  }
  return id
}

/** The India stock location's id; `internal` when it is missing (run `db:migrate`, which seeds it). */
export async function shopStockLocationId(container: MedusaContainer): Promise<string> {
  const id = await findShopStockLocationId(container)
  if (!id) throw internal("The shop's stock location is missing; run db:migrate to seed it")
  return id
}

/** Every stock location that is not the India one (the seed renames the starter's location instead of adding one). */
export async function otherStockLocations(container: MedusaContainer, shopLocationId?: string): Promise<LocationRow[]> {
  return (await listLocations(container)).filter((l) => (shopLocationId ? l.id !== shopLocationId : !inIndia(l)))
}

/** Logs that a level holds more reserved than stocked Pieces, which no workflow should ever leave. */
export function warnIfOverReserved(
  container: MedusaContainer,
  inventoryItemId: string,
  level: { stocked: number; reserved: number }
): void {
  if (level.reserved > level.stocked) {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(`stock: inventory item ${inventoryItemId} has ${level.reserved} reserved but only ${level.stocked} stocked`)
  }
}

/** The inventory item ids linked to a Variant, and whether the kernel manages its inventory. */
async function variantInventory(
  container: MedusaContainer,
  variantId: string
): Promise<{ manageInventory: boolean; inventoryItemIds: string[] } | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_variant",
    fields: ["id", "manage_inventory", "inventory_items.inventory_item_id"],
    filters: { id: variantId },
  })
  const row = data[0] as
    | { manage_inventory?: boolean | null; inventory_items?: ({ inventory_item_id?: string | null } | null)[] | null }
    | undefined
  if (!row) return null
  return {
    manageInventory: row.manage_inventory === true,
    inventoryItemIds: (row.inventory_items ?? []).flatMap((l) => (l?.inventory_item_id ? [l.inventory_item_id] : [])),
  }
}

/** Where a Variant's stock is kept: its inventory item at the India location. */
export type StockTarget = { variantId: string; inventoryItemId: string; locationId: string }

/**
 * The inventory item and location of a Variant's stock. A Variant without
 * exactly one inventory item, or without a level at the India location, is
 * a fault (`internal`): `create-design` and the stock seed give every Design one.
 */
export async function loadStockTarget(container: MedusaContainer, variantId: string): Promise<StockTarget> {
  const locationId = await shopStockLocationId(container)
  const inventory = await variantInventory(container, variantId)
  if (!inventory || !inventory.manageInventory || inventory.inventoryItemIds.length !== 1) {
    throw internal(`Variant ${variantId} has no single managed inventory item`)
  }
  const inventoryItemId = inventory.inventoryItemIds[0]!
  const levels = await container
    .resolve(Modules.INVENTORY)
    .listInventoryLevels({ inventory_item_id: inventoryItemId, location_id: locationId })
  if (!levels.length) throw internal(`Variant ${variantId} has no stock level at the shop's stock location`)
  return { variantId, inventoryItemId, locationId }
}

/** The stocked and reserved quantities of an inventory item at a location (0 and 0 when it has no level). */
export async function readStockLevel(
  container: MedusaContainer,
  target: { inventoryItemId: string; locationId: string }
): Promise<{ stocked: number; reserved: number }> {
  const [level] = await container
    .resolve(Modules.INVENTORY)
    .listInventoryLevels({ inventory_item_id: target.inventoryItemId, location_id: target.locationId })
  return { stocked: quantity(level?.stocked_quantity), reserved: quantity(level?.reserved_quantity) }
}

/** A Variant's stock as the Admin shows it. */
export async function readVariantStock(container: MedusaContainer, variantId: string): Promise<VariantStockView> {
  const target = await loadStockTarget(container, variantId)
  const { stocked, reserved } = await readStockLevel(container, target)
  warnIfOverReserved(container, target.inventoryItemId, { stocked, reserved })
  return VariantStockView.parse({
    variantId,
    inventoryItemId: target.inventoryItemId,
    stocked,
    reserved,
    available: availablePieces(stocked, reserved),
  })
}

/** A stored stock-movement row as the contract's view. */
export function movementView(row: StockMovementRow): StockMovementView {
  return StockMovementView.parse({
    id: row.id,
    inventoryItemId: row.inventory_item_id,
    variantId: row.variant_id,
    cause: row.cause,
    change: row.change,
    stockedAfter: row.stocked_after,
    reservedAfter: row.reserved_after,
    actor: row.actor,
    actorId: row.actor_id ?? null,
    reason: row.reason,
    occurredAt: new Date(row.occurred_at as unknown as string | Date).toISOString(),
  })
}

/** What `ensureVariantStock` created or changed, so it can be undone. */
export type EnsuredVariantStock = {
  inventoryItemId: string
  /** The Variant's `manage_inventory` was false and was turned on. */
  turnedOnInventory: boolean
  /** An inventory item was created (and linked) for the Variant. */
  createdInventoryItem: boolean
  /** The level created at the India location, if there was none. */
  createdLevelId: string | null
}

/**
 * Makes sure a Variant's stock is kept: `manage_inventory` on, one inventory
 * item linked to it (created when it has none), and a level at the India
 * location (created with 0 stocked when missing). Leaves what exists alone.
 * A Variant with more than one inventory item is a fault (`internal`).
 */
export async function ensureVariantStock(
  container: MedusaContainer,
  variantId: string,
  locationId: string
): Promise<EnsuredVariantStock> {
  const inventory = await variantInventory(container, variantId)
  if (!inventory) throw internal(`No Variant ${variantId}`)
  if (inventory.inventoryItemIds.length > 1) throw internal(`Variant ${variantId} has more than one inventory item`)
  const products = container.resolve(Modules.PRODUCT)
  const inventoryModule = container.resolve(Modules.INVENTORY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  const done: EnsuredVariantStock = {
    inventoryItemId: inventory.inventoryItemIds[0] ?? "",
    turnedOnInventory: false,
    createdInventoryItem: false,
    createdLevelId: null,
  }
  try {
    if (!inventory.manageInventory) {
      await products.updateProductVariants(variantId, { manage_inventory: true })
      done.turnedOnInventory = true
    }
    if (!done.inventoryItemId) {
      const variant = await products.retrieveProductVariant(variantId, { select: ["id", "title", "sku"] })
      const [item] = await inventoryModule.createInventoryItems([
        { title: variant.title ?? undefined, sku: variant.sku ?? undefined, requires_shipping: true },
      ])
      done.inventoryItemId = item!.id
      done.createdInventoryItem = true
      await link.create({
        [Modules.PRODUCT]: { variant_id: variantId },
        [Modules.INVENTORY]: { inventory_item_id: done.inventoryItemId },
        data: { required_quantity: 1 },
      })
    }
    const levels = await inventoryModule.listInventoryLevels({
      inventory_item_id: done.inventoryItemId,
      location_id: locationId,
    })
    if (!levels.length) {
      const [level] = await inventoryModule.createInventoryLevels([
        { inventory_item_id: done.inventoryItemId, location_id: locationId, stocked_quantity: 0 },
      ])
      done.createdLevelId = level!.id
    }
  } catch (e) {
    // Leave nothing half-made: undo what this call wrote, then report the failure.
    await undoEnsureVariantStock(container, variantId, done).catch((undoError: unknown) => {
      container
        .resolve(ContainerRegistrationKeys.LOGGER)
        .error(`stock: could not undo a partial stock record of Variant ${variantId}: ${(undoError as Error).stack ?? undoError}`)
    })
    throw e
  }
  return done
}

/** Undoes what `ensureVariantStock` created or changed, newest first. */
export async function undoEnsureVariantStock(
  container: MedusaContainer,
  variantId: string,
  done: EnsuredVariantStock
): Promise<void> {
  const inventoryModule = container.resolve(Modules.INVENTORY)
  if (done.createdLevelId) await inventoryModule.deleteInventoryLevels([done.createdLevelId])
  if (done.createdInventoryItem && done.inventoryItemId) {
    await container.resolve(ContainerRegistrationKeys.LINK).dismiss({
      [Modules.PRODUCT]: { variant_id: variantId },
      [Modules.INVENTORY]: { inventory_item_id: done.inventoryItemId },
    })
    await inventoryModule.deleteInventoryItems([done.inventoryItemId])
  }
  if (done.turnedOnInventory) {
    await container.resolve(Modules.PRODUCT).updateProductVariants(variantId, { manage_inventory: false })
  }
}
