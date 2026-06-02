import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const folders = pgTable("folders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  type: text("type", { enum: ["personal", "work", "shared"] }).notNull().default("shared"),
  icon: text("icon").default("📁"),
  color: text("color").default("#6366f1"),
  order: integer("order").notNull().default(0),
  isExpanded: boolean("is_expanded").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const links = pgTable("links", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  folderId: text("folder_id"),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Folder = typeof folders.$inferSelect;
export type Link = typeof links.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type NewLink = typeof links.$inferInsert;
