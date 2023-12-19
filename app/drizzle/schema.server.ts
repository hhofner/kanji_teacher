import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

export const kanji = sqliteTable("kanji", {
  id: integer("id").primaryKey(),
  date: text("date").notNull(),
  character: text("character").notNull(),
  kunyomi: text("kunyomi"),
  onyomi: text("onyomi"),
  meanings: text("meanings"),
  jlpt: text("jlpt"),
  strokeCount: integer("strokeCount", { mode: "number" }),
  userId: integer("userId").references(() => user.id)
});

export const user = sqliteTable("user", {
  id: integer("id").primaryKey(),
  email: text("email"),
  password: text("password"),
  salt: text("salt"),
});

export const writingHistory = sqliteTable("writingHistory", {
  id: integer("id").primaryKey(),
  datetime: text("datetime"),
  character: text("character"),
  userId: integer("id").references(() => user.id),
  type: text("type"),
});
