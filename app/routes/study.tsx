import { useEffect, useMemo, useRef, useState } from "react";
import { LazyBrush } from "lazy-brush";
import { format, startOfWeek } from "date-fns";
import {
	isRouteErrorResponse,
	useFetcher,
	useLoaderData,
	useRouteError,
} from "@remix-run/react";
import { eq, and } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { kanji } from "~/drizzle/schema.server";
import { requireUser } from "~/session";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { type action as kanjiRecordAction } from "./api.kanji.record";
import KanjiCanvas from "~/components/KanjiCanvas";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireUser(request);
	const startDay = format(startOfWeek(new Date()), "MM/dd");
	const kanjis = await db
		.select()
		.from(kanji)
		.where(and(eq(kanji.date, startDay), eq(kanji.userId, user.id)));
	return { kanjis };
}

export default function Study() {

	const { kanjis } = useLoaderData<typeof loader>();

	return (
		<KanjiCanvas onStroke={function(): void {
			throw new Error("Function not implemented.");
		}} onClear={function(): void {
			throw new Error("Function not implemented.");
		}} onHide={function(): void {
			throw new Error("Function not implemented.");
		}} onAutoReset={function(): void {
			throw new Error("Function not implemented.");
		}} isAutoReset={false} kanji={""} />
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
		return <div>Kanji not found</div>;
	}

	return <div>An unexpected error occurred: {error.statusText}</div>;
}
