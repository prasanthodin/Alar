import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261127192424 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "price_history" ("id" text not null, "variant_id" text not null, "old_price_paise" integer null, "new_price_paise" integer not null, "changed_at" timestamptz not null, "changed_by" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "price_history_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_history_deleted_at" ON "price_history" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_history_variant_id_changed_at" ON "price_history" ("variant_id", "changed_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "price_history" cascade;`);
  }

}
