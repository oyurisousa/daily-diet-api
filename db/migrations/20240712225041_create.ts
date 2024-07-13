import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('offensive', (table) => {
    table.uuid('id').primary();
    table.integer('best_offensive').defaultTo(0);
    table.integer('aux_best_offensive').defaultTo(0);
    table.uuid('user_id').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at', { useTz: true });

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('offensive');
}