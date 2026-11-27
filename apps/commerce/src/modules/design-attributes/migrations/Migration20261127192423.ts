import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261127192423 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "design_attributes" ("id" text not null, "fibre" text null, "weave" text null, "length_cm" integer null, "width_cm" integer null, "blouse_piece_included" boolean not null default false, "care" text null, "country_of_origin" text null, "tax_code" text null, "stitched" boolean not null default false, "photos" jsonb not null, "true_colour_confirmed_at" timestamptz null, "true_colour_confirmed_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "design_attributes_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_design_attributes_deleted_at" ON "design_attributes" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "design_attributes" cascade;`);
  }

}
