import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: integer("id").primaryKey(),
  email: text("email"),
  password: text("password"),
  salt: text("salt"),
});

export const kanji = sqliteTable("kanji", {
  id: integer("id").primaryKey(),
  date: text("date").notNull(),
  character: text("character").notNull(),
  kunyomi: text("kunyomi"),
  onyomi: text("onyomi"),
  meanings: text("meanings"),
  jlpt: text("jlpt"),
  strokeCount: integer("strokeCount", { mode: "number" }),
  userId: integer("userId").references(() => user.id),
});

export const writingLog = sqliteTable("writingLog", {
  id: integer("id").primaryKey(),
  datetime: text("datetime"),
  character: text("character"),
  userId: integer("userId").references(() => user.id),
});

export const setting = sqliteTable("setting", {
  id: integer("id").primaryKey(),
  isAutoReset: integer("isAutoReset", { mode: 'boolean' }).notNull().default(true),
  userId: integer("userId").references(() => user.id).unique(),
  lastKanjiIndex: integer("lastKanjiIndex").notNull().default(0),
})
