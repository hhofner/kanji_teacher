import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { eq, and, sql } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { kanji, writingLog } from "~/drizzle/schema.server";
import { getUserId } from "~/session";

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
  const kanjisDrawn = await db.select().from(writingLog).where(
    and(eq(writingLog.userId, parseInt(userId)), sql`strftime('%Y-%m-%d %H:%M:%S', ${writingLog.datetime}) >= datetime('now', 'weekday 0', '-7 days')`))
  const kanjiDrawn = kanjisDrawn.length;
  return { kanjis, kanjiDrawn, quizzesTaken: 0, passagesRead: 0 };
}

export default function Index() {
  const startDay = format(startOfWeek(new Date()), "MM/dd");
  const endDay = format(endOfWeek(new Date()), "MM/dd");
  const { kanjis, kanjiDrawn, quizzesTaken, passagesRead } =
    useLoaderData<typeof loader>();
  return (
    <div className="space-y-6 relative">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">This Week's Kanji</h2>
            <span className="text-sm">
              {startDay} - {endDay}
            </span>
          </div>
          <Link to="/search">
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
              Set
            </button>
          </Link>
        </div>
        <div className="flex justify-around bg-zinc-100 rounded p-4">
          {kanjis.length <= 0 ? (
            <p>No kanjis selected. Add some!</p>
          ) : (
            kanjis.map((kanji) => (
              <Link key={kanji.id} to={`/kanji/${kanji.id}`}>
                <div className="md:text-6xl text-4xl p-1">
                  {kanji.character}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <div className="mb-6 text-gray-200">
        <h3 className="text-lg font-semibold mb-2">Upcoming test</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm">November 31, 2023</span>
          <button
            disabled
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-200"
          >
            Test
          </button>
        </div>
      </div>
      <div className="mb-6 text-gray-200">
        <div className="flex gap-4 mb-12 justify-evenly">
          <div className="rounded bg-zinc-100 p-4">
            <h3 className="text-2xl font-semibold mb-2 text-black">
              {kanjiDrawn}
            </h3>
            <p className="mb-2 text-black tracking-tight">
              Kanji Drawn This Week
            </p>
          </div>
          <div className="rounded bg-zinc-100 p-4">
            <h3 className="text-2xl font-semibold mb-2">{quizzesTaken}</h3>
            <p className="mb-2 tracking-tight">Quizzes Taken Yesterday</p>
          </div>
          <div className="rounded bg-zinc-100 p-4">
            <h3 className="text-2xl font-semibold mb-2">{passagesRead}</h3>
            <p className="mb-2 tracking-tight">Passages Read Yesterday</p>
          </div>
        </div>
        <div className="flex gap-4 w-full justify-center">
          <Link to="/study">
            <button className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800 transition-colors disabled:bg-gray-200">
              Write Kanji
            </button>
          </Link>
          <Link to="/quiz">
            <button
              disabled
              className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800 transition-colors disabled:bg-gray-200"
            >
              Take Quizzes
            </button>
          </Link>
          <Link to="/read">
            <button
              disabled
              className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800 transition-colors disabled:bg-gray-200"
            >
              Read Passages
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
