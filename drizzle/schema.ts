import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Prompts table stores original and improved prompts for each user.
 */
export const prompts = mysqlTable("prompts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  originalPrompt: text("originalPrompt").notNull(),
  improvedPrompt: text("improvedPrompt").notNull(),
  templateType: varchar("templateType", { length: 50 }),
  tone: varchar("tone", { length: 50 }),
  detailLevel: varchar("detailLevel", { length: 50 }),
  outputFormat: varchar("outputFormat", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = typeof prompts.$inferInsert;