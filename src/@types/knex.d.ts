// eslint-disable-next-line
import knex from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      username: string
      password_hash: string
      created_at: string
      updated_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      is_diet: boolean
      user_id: string
      createdAt: Date
      updated_at: Date
    }
    offensive: {
      id: string
      best_offensive: number
      aux_best_offensive: number
      user_id: string
      created_at: Date
      updated_at: Date
    }
  }
}
