import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['organizer', 'attendee']);

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  email: varchar('email', { length: 60 }).notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').notNull().default('attendee'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type NewUser = typeof usersTable.$inferInsert
export type User = typeof usersTable.$inferSelect