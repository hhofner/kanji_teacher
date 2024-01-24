import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { eq, and, sql } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { kanji, writingLog } from "~/drizzle/schema.server";
import { getUserId } from "~/session";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export const meta: MetaFunction = () => {
  return [
    { title: "Kanji Teacher" },
    { name: "description", content: "Learning Kanji" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Show kanjis for logged in user
  const userId = await getUserId(request);
  if (!userId) {
    return { kanjis: [], kanjiDrawn: [], quizzesTaken: 0, passagesRead: 0 };
  }

  const startDay = format(startOfWeek(new Date()), "MM/dd");
  const kanjis = await db
    .select()
    .from(kanji)
    .where(and(eq(kanji.date, startDay), eq(kanji.userId, parseInt(userId))));
  const kanjisDrawn = await db
    .select()
    .from(writingLog)
    .where(
      and(
        eq(writingLog.userId, parseInt(userId)),
        sql`strftime('%Y-%m-%d %H:%M:%S', ${writingLog.datetime}) >= datetime('now', 'weekday 0', '-7 days')`,
      ),
    );
  const kanjiDrawn = kanjisDrawn.length;
  return { kanjis, kanjiDrawn, quizzesTaken: 0, passagesRead: 0 };
}

export default function Index() {
  const startDay = format(startOfWeek(new Date()), "MM/dd");
  const endDay = format(endOfWeek(new Date()), "MM/dd");
  const { kanjis, kanjiDrawn, quizzesTaken, passagesRead } =
    useLoaderData<typeof loader>();
  return (
    <div className="space-y-6 relative h-full">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">This Week's Kanji</h2>
            <small className="text-sm">
              {startDay} - {endDay}
            </small>
          </div>
          <Link to="/search">
            <Button variant="outline">
              Set
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-8 justify-center">{kanjis.length <= 0 ? (
          <p>No kanjis selected. Add some!</p>
        ) : (
          kanjis.map((kanji) => (
            <Link key={kanji!.id} to={`/kanji/${kanji!.id}`}>
              <div className="md:text-6xl text-4xl p-1">
                {kanji?.character}
              </div>
            </Link>
          ))
        )}
        </div>
      </div>
      <div className="mb-6">
        <div className="flex gap-4 mb-12">
          <Card>
            <CardHeader><h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Kanj Drawn This Week</h4></CardHeader>
            <CardContent><p className="leading-7 [&:not(:first-child)]:mt-6">{kanjiDrawn}</p></CardContent>
          </Card>
        </div>
        <div className="flex gap-4 w-full justify-center">
          <Link to="/study">
            <Button>
              Write Kanji
            </Button>
          </Link>
          <Link to="/quiz">
            <Button>
              Take Quizzes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
