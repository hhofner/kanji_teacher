import { type ActionFunctionArgs, json } from "@remix-run/node";
import { format, startOfWeek } from "date-fns";
import { db } from "~/drizzle/config.server";
import { kanji } from "~/drizzle/schema.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const kanjiQuery = formData.get("kanji")
  if (kanjiQuery) {
    const results = await fetch(`https://kanjiapi.dev/v1/kanji/${kanjiQuery}`)
    const kanjiInfo = await results.json()
    if (kanjiInfo && results.status === 200) {
      const startDay = format(startOfWeek(new Date()), "MM/dd")
      await db.insert(kanji).values({
        date: startDay,
        character: kanjiInfo.kanji,
        kunyomi: kanjiInfo.kun_readings.join(","),
        onyomi: kanjiInfo.on_readings.join(","),
        meanings: kanjiInfo.meanings.join(","),
        jlpt: kanjiInfo.jlpt,
        strokeCount: kanjiInfo.stroke_count
      })
      return json({ ok: true })
    } else {
      return json({ error: results.statusText }, 404)
    }
  } else {
    return json({
      error: "Bad request"
    }, 400)
  }
}
