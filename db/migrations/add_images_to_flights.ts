import { sql } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'

export async function up(db) {
  await db.schema.alterTable('flight').addColumn(
    'images',
    text('images').array().default([]).notNull()
  )
}

export async function down(db) {
  await db.schema.alterTable('flight').dropColumn('images')
} 