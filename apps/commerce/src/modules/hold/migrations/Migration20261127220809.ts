import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261127220809 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "hold" drop constraint if exists "hold_checkout_id_unique";`);
    this.addSql(`alter table if exists "hold" drop constraint if exists "hold_cart_id_live_unique";`);
    this.addSql(`create table if not exists "hold" ("id" text not null, "checkout_id" text not null, "cart_id" text not null, "expires_at" timestamptz not null, "status" text check ("status" in ('live', 'released', 'expired')) not null default 'live', "ended_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "hold_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hold_deleted_at" ON "hold" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_hold_cart_id_live_unique" ON "hold" ("cart_id") WHERE status = 'live' AND deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_hold_checkout_id_unique" ON "hold" ("checkout_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hold_status_expires_at" ON "hold" ("status", "expires_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "hold" cascade;`);
  }

}
