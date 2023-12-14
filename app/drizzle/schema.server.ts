import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const kanji = sqliteTable("kanji", {
  id: integer("id").primaryKey(),
  date: text("date").notNull(),
  character: text("character").notNull(),
  kunyomi: text("kunyomi"),
  onyomi: text("onyomi"),
  meanings: text("meanings"),
  jlpt: text("jlpt"),
  strokeCount: integer("strokeCount", { mode: "number"})
});
