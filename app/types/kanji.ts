export type KanjiShape = {
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

export type KanjiDb = {
	date: string;
	id: number;
	character: string;
	kunyomi: string | null;
	onyomi: string | null;
	meanings: string | null;
	jlpt: string | null;
	strokeCount: number | null;
	userId: number | null;
}