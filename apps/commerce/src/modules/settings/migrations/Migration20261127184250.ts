import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261127184250 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "setting_value" ("id" text not null, "key" text not null, "value" jsonb not null, "effective_from" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "setting_value_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_setting_value_deleted_at" ON "setting_value" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_setting_value_key_effective_from" ON "setting_value" ("key", "effective_from") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "setting_value" cascade;`);
  }

}
