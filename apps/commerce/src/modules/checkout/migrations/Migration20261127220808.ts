import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261127220808 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "checkout" ("id" text not null, "cart_id" text not null, "customer_id" text not null, "status" text check ("status" in ('held', 'cancelled', 'expired')) not null default 'held', "snapshot" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "checkout_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_checkout_deleted_at" ON "checkout" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_checkout_cart_id" ON "checkout" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_checkout_customer_id" ON "checkout" ("customer_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "checkout" cascade;`);
  }

}
