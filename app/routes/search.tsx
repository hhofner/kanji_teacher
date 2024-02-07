import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { type action as kanjiAddAction } from "./api.kanji.add";
import { type action as kanjiRemoveAction } from "./api.kanji.remove";
import { useState } from "react";
import { requireUser } from "~/session";
import { format, startOfWeek } from "date-fns";
import { kanji } from "~/drizzle/schema.server";
import { db } from "~/drizzle/config.server";
import { eq, and, sql } from "drizzle-orm";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface KanjiApiResponse {
  grade: number;
  heisig_en: string;
  jlpt: number;
  kanji: string;
  kun_readings: string[];
  meanings: string[];
  name_readings: string[];
  notes: string[];
  on_readings: string[];
  stroke_count: number;
  unicode: string;
}

interface KanjiData {
  kanjiId: number;
  character: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rawQuery = formData.get("q") as string | undefined;

  if (!rawQuery) {
    return json({ error: "Bad request" }, 400);
  }
  const queries = rawQuery.split("");
  if (queries.length > 0) {
    const promiseList = queries.map(async (q: string) => {
      const results = await fetch(`https://kanjiapi.dev/v1/kanji/${q}`);
      const kanjiInfo = await results.json();
      if (kanjiInfo && results.status === 200) {
        return kanjiInfo;
      }
    });

    const resultList = await Promise.all(promiseList);

    return {
      resultList: resultList.filter(Boolean),
    };
  }
  return { resultList: [] };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  const startDay = format(startOfWeek(new Date()), "MM/dd");
  const kanjis = await db
    .select()
    .from(kanji)
    .where(and(eq(kanji.date, startDay), eq(kanji.userId, user.id)));

  return { kanjis };
}

export default function Search() {
  const actionData = useActionData<
    | { error: string; resultList?: KanjiApiResponse[] }
    | { resultList: KanjiApiResponse[]; error?: string }
  >();
  const fetcher = useFetcher<typeof kanjiAddAction>();
  const removeFetcher = useFetcher<typeof kanjiRemoveAction>();
  const { kanjis } = useLoaderData<typeof loader>();
  const [addedKanjis, setAddedKanjis] = useState<KanjiData[]>(
    kanjis.map((k) => ({ character: k.character, kanjiId: k.id })),
  );
  const [tempAddedKanji, setTempAddedKanji] = useState<string[]>([]);

  function removeKanji(kanjiId: number) {
    removeFetcher.submit(
      { kanjiId },
      { method: "POST", action: "/api/kanji/remove" },
    );
    setAddedKanjis(addedKanjis.filter((k) => k.kanjiId !== kanjiId));
  }

  function addToTemp(kanji: string) {
    setTempAddedKanji([...tempAddedKanji, kanji]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-8 flex-wrap gap-4 bg-zinc-100 p-4 rounded">
        {addedKanjis.map((kanji, idx) => (
          <p className="text-4xl relative" key={kanji.character + idx}>
            {kanji.character}
            <svg
              onClick={() => removeKanji(kanji.kanjiId)}
              className="absolute -top-1 -right-1 opacity-25 cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="currentColor"
            >
              <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
            </svg>
          </p>
        ))}
      </div>
      <Form className="flex flex-col gap-4" method="post">
        <div className="flex gap-2 items-center">
          <Input
            name="q"
            type="search"
            className="w-full border rounded text-[16px]"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </div>
      </Form>
      <div>
        <fetcher.Form method="post" action="/api/kanji/add">
          {actionData?.resultList?.map((kanji, idx) => (
            <div
              className="flex justify-between items-center"
              key={kanji.kanji + idx}
            >
              <div className="flex flex-col gap-1">
                <p className="text-3xl">{kanji.kanji}</p>
                <small>{kanji.meanings && kanji.meanings[0]}</small>
              </div>
              <Button
                value={kanji.kanji}
                name="kanji"
                onClick={() => addToTemp(kanji.kanji)}
              >
                {tempAddedKanji.includes(kanji.kanji) ? (
                  <span>Added</span>
                ) : (
                  <span>Add</span>
                )}
              </Button>
            </div>
          ))}
        </fetcher.Form>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Hello</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
