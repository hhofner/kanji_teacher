import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { eq, and, sql } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { kanji, writingLog } from "~/drizzle/schema.server";
import { getUserId } from "~/session";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

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
          <Card className="w-full">
            <CardHeader>
              <small className="text-gray-500 flex items-center gap-4">
                {startDay} to {endDay}
                <svg
                  className="w-4 h-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 22C6.47715 22 2 17.5228 2 12 2 6.47715 6.47715 2 12 2 17.5228 2 22 6.47715 22 12 22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12 20 7.58172 16.4183 4 12 4 7.58172 4 4 7.58172 4 12 4 16.4183 7.58172 20 12 20ZM13 10.5V15H14V17H10V15H11V12.5H10V10.5H13ZM13.5 8C13.5 8.82843 12.8284 9.5 12 9.5 11.1716 9.5 10.5 8.82843 10.5 8 10.5 7.17157 11.1716 6.5 12 6.5 12.8284 6.5 13.5 7.17157 13.5 8Z"></path>
                </svg>
              </small>
            </CardHeader>
            <CardContent className="">
              {kanjis.length <= 0 ? (
                <Link to="/search">
                  <p className="flex gap-2 items-center">
                    <span>
                      No kanjis selected.{" "}
                      <span className="underline">Add some</span>
                    </span>{" "}
                    <svg
                      className=""
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </p>
                </Link>
              ) : (
                <div className="grid grid-cols-8 justify-center">
                  {kanjis.map((kanji) => (
                    <Link key={kanji!.id} to={`/kanji/${kanji!.id}`}>
                      <div className="md:text-6xl text-4xl p-1">
                        {kanji?.character}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex gap-4 mb-12">
          <h3 className="scroll-m-20 text-md font-semibold tracking-tight">
            Kanj Drawn This Week: {kanjiDrawn}
          </h3>
        </div>
        <div className="flex gap-4 w-full justify-center">
          <Link to="/study">
            <Button>Write Kanji</Button>
          </Link>
          <Link to="/quiz">
            <Button>Take Quizzes</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
