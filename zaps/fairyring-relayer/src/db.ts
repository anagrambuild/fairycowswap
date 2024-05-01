import { Client } from '@planetscale/database'
import { drizzle } from 'drizzle-orm/planetscale-serverless'
import { sql } from 'drizzle-orm'
import { bigint, mysqlTable, mysqlTableCreator, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const createTable = mysqlTableCreator((name) => `fairyring_${name}`)

export const fairyringWatcher = mysqlTable('fairyring_watcher', {
  id: varchar('id', { length: 256 }).primaryKey(),
  fairyring_last_indexed_block_number: bigint('last_indexed_block', { mode: 'number' }),
  fairyring_chain_id: varchar('chain_id', { length: 64 }),
  created_at: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(), // https://github.com/drizzle-team/drizzle-orm/issues/657
  updated_at: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
    .onUpdateNow(), // https://github.com/drizzle-team/drizzle-orm/issues/657
})

// WORKAROUND - Weird typescript complaint if you just use dbCommon.schema directly in the drizzle call
export const appDbSchema = {
  fairyringWatcher,
} as const

export type AppDb = ReturnType<typeof drizzle<typeof appDbSchema>>

let dbSingleton: AppDb | undefined
const getDb = () => {
  if (!dbSingleton) {
    dbSingleton = drizzle(new Client({ url: process.env.DATABASE_URL }), {
      schema: appDbSchema,
    })
  }
  return dbSingleton
}

export { getDb }
