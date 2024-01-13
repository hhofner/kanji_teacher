import { type ActionFunctionArgs, json } from "@remix-run/node";
import { format, startOfWeek } from "date-fns";
import { and, eq } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { kanji } from "~/drizzle/schema.server";
import { requireUserId } from "~/session";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const kanjiId = formData.get("kanjiId") as string | undefined;
  if (kanjiId) {
    // Find in DB
    await db
      .delete(kanji)
      .where(
        and(
          eq(kanji.id, parseInt(kanjiId)),
          eq(kanji.userId, parseInt(userId)),
        ),
      );
    return json({ ok: true });
  } else {
    return json(
      {
        error: "Bad request",
      },
      400,
    );
  }
}
