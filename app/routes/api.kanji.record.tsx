import { type ActionFunctionArgs, json } from "@remix-run/node";
import { format } from "date-fns";
import { db } from "~/drizzle/config.server";
import { writingLog } from "~/drizzle/schema.server";
import { requireUserId } from "~/session";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  console.log("userId", userId);
  const formData = await request.formData();
  const kanji = formData.get("kanji") as string | undefined;

  if (kanji && userId) {
    const dateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    await db.insert(writingLog).values({
      character: kanji,
      userId: parseInt(userId),
      datetime: dateTime,
    });
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
