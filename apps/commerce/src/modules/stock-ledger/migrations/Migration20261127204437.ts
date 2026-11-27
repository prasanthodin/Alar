import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261127204437 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "stock_movement" drop constraint if exists "stock_movement_request_id_unique";`);
    this.addSql(`alter table if exists "stock_movement" drop constraint if exists "stock_movement_cause_check";`);

    this.addSql(`alter table if exists "stock_movement" add column if not exists "actor_id" text null, add column if not exists "request_id" text null;`);
    this.addSql(`alter table if exists "stock_movement" add constraint "stock_movement_cause_check" check("cause" in ('opening_balance', 'manual_adjustment', 'checkout_hold', 'payment_confirmed', 'hold_released', 'fulfilled', 'order_cancelled', 'return_restocked'));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_stock_movement_request_id_unique" ON "stock_movement" ("request_id") WHERE request_id IS NOT NULL AND deleted_at IS NULL;`);

    // Append-only (AD-6): the database refuses to edit or delete a stock-movement row,
    // whatever code asks (the kernel's soft delete is an UPDATE of deleted_at, so it is refused too).
    this.addSql(`create or replace function "stock_movement_refuse_change"() returns trigger language plpgsql as $$
begin
  raise exception 'stock_movement rows are append-only: % is not allowed', tg_op using errcode = 'restrict_violation';
end;
$$;`);
    this.addSql(`drop trigger if exists "stock_movement_append_only" on "stock_movement";`);
    this.addSql(`create trigger "stock_movement_append_only" before update or delete on "stock_movement" for each row execute function "stock_movement_refuse_change"();`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop trigger if exists "stock_movement_append_only" on "stock_movement";`);
    this.addSql(`drop function if exists "stock_movement_refuse_change"();`);
    this.addSql(`alter table if exists "stock_movement" drop constraint if exists "stock_movement_cause_check";`);

    this.addSql(`drop index if exists "IDX_stock_movement_request_id_unique";`);
    this.addSql(`alter table if exists "stock_movement" drop column if exists "actor_id", drop column if exists "request_id";`);

    this.addSql(`alter table if exists "stock_movement" add constraint "stock_movement_cause_check" check("cause" in ('manual_adjustment', 'checkout_hold', 'payment_confirmed', 'hold_released', 'fulfilled', 'order_cancelled', 'return_restocked'));`);
  }

}
