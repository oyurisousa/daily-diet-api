import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.text('username').notNullable()
    table.text('password_hash').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users')
}
