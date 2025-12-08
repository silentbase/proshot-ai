import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users_table", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  avatar_url: text("avatar_url"),
  plan: text("plan"),
  isCanceled: boolean("isCanceled"),
  stripe_id: text("stripe_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  credits: integer("credits").default(5),
});

export const userGenerationsTable = pgTable("user_generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").defaultRandom().notNull(),
  title: text("title").notNull(),
  original_image_url: text("original_image_url"),
  reference_image_url: text("reference_image_url"),
  background_prompt: text("background_prompt"),
  generated_image_url: text("generated_image_url"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull()
    .defaultNow(),
});

// Credit transactions table
export const creditTransactionsTable = pgTable("credit_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  amount: integer("amount").notNull(),
  transactionType: text("transaction_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  paymentId: text("payment_id"),
  metadata: jsonb("metadata"),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertUserGeneration = typeof userGenerationsTable.$inferInsert;
export type SelectUserGeneration = typeof userGenerationsTable.$inferSelect;

export type InsertCreditTransaction =
  typeof creditTransactionsTable.$inferInsert;
export type SelectCreditTransaction =
  typeof creditTransactionsTable.$inferSelect;
