import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useFetcher } from "@remix-run/react";
import { type action as kanjiAddAction } from "./api.kanji.add";
import { useState } from "react";
import { requireUser } from "~/session";

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

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUser(request);
	return null;
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

export default function Search() {
	const actionData = useActionData<
		| { error: string; resultList?: KanjiApiResponse[] }
		| { resultList: KanjiApiResponse[]; error?: string }
	>();
	const fetcher = useFetcher<typeof kanjiAddAction>();
	const [addedKanjis, setAddedKanjis] = useState<string[]>([]);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				{addedKanjis.map((kanji) => (
					<p className="text-3xl" key={kanji}>
						{kanji}
					</p>
				))}
			</div>
			<Form className="flex flex-col gap-4" method="post">
				<div className="flex gap-2 items-center">
					<input
						name="q"
						type="search"
						className="w-full border rounded border-blue-400"
					/>
					<button type="submit">Search</button>
				</div>
			</Form>
			<div>
				{actionData?.resultList?.map((kanji) => (
					<fetcher.Form
						className="flex justify-between items-center"
						method="post"
						action="/api/kanji/add"
					>
						<div className="flex flex-col gap-1">
							<p className="text-3xl">{kanji.kanji}</p>
							<small>{kanji.meanings && kanji.meanings[0]}</small>
						</div>
						<button
							onClick={() =>
								setAddedKanjis([...addedKanjis, kanji.kanji])
							}
							value={kanji.kanji}
							name="kanji"
							className="bg-blue-500 rounded p-1 h-fit text-white"
						>
							Add
						</button>
					</fetcher.Form>
				))}
			</div>
		</div>
	);
}
