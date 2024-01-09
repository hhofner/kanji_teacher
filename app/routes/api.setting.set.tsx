import { ActionFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { setting } from "~/drizzle/schema.server";
import { requireUserId } from "~/session";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const isAutoReset = formData.get("isAutoReset") as string | undefined;
  const lastKanjiIndex = formData.get("lastKanjiIndex") as string | undefined;

  if (userId) {
    await db.insert(setting).values({
      isAutoReset: isAutoReset === "true",
      lastKanjiIndex: parseInt(lastKanjiIndex ?? "0"),
      userId: parseInt(userId),
    })
      .onConflictDoUpdate({
        target: [setting.userId],
        set: {
          isAutoReset: isAutoReset === "true",
          lastKanjiIndex: parseInt(lastKanjiIndex ?? "0"),
        },
      })
  }

  return json({ ok: true });
}
