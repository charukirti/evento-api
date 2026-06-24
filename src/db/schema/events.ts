import {
  pgTable,
  varchar,
  numeric,
  integer,
  uuid,
  timestamp,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const eventCategoryEnum = pgEnum('event_category', [
  'music',
  'tech',
  'sports',
  'arts',
  'food',
  'business',
  'other',
]);
export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'published',
  'cancelled',
  'completed',
]);
export const eventsTable = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title').notNull(),
  description: text('description').notNull(),
  category: eventCategoryEnum('category').notNull(),
  location: varchar('location').notNull(),
  date: timestamp('date').notNull(),
  status: eventStatusEnum('status').notNull().default('draft'),
  totalSeats: integer('total_seats').notNull(),
  availableSeats: integer('available_seats').notNull(),
  posterUrl: varchar('poster_url'),
  organizerId: uuid('organizer_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type NewEvent = typeof eventsTable.$inferInsert;
export type Event = typeof eventsTable.$inferSelect;
