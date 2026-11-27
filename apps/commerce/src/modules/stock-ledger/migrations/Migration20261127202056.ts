import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261127202056 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "stock_movement" ("id" text not null, "inventory_item_id" text not null, "variant_id" text not null, "cause" text check ("cause" in ('manual_adjustment', 'checkout_hold', 'payment_confirmed', 'hold_released', 'fulfilled', 'order_cancelled', 'return_restocked')) not null, "change" integer not null, "stocked_after" integer not null, "reserved_after" integer not null, "actor" text not null, "reason" text not null, "occurred_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "stock_movement_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_deleted_at" ON "stock_movement" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_variant_id_occurred_at" ON "stock_movement" ("variant_id", "occurred_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "stock_movement" cascade;`);
  }

}
