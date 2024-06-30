import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary().index()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('is_diet').notNullable()
    table.text('user_id').unsigned()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at')

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('meals')
}

