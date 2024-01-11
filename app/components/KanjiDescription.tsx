interface Props {
	onyomi: string | null;
	kunyomi: string| null;
	meanings: string | null;
}
export default function KanjiDescription({ onyomi, kunyomi, meanings }: Props) {
	return (
		<div>
			{meanings && <div className="w-full text-center text-zinc-500">
				{meanings
					?.split(",")
					.map((meaning, idx) => (
						<span key={idx}>{`${meaning}, `}</span>
					))}
			</div> }
			{kunyomi && <div className="w-full text-center text-zinc-500">
				{kunyomi
					?.split(",")
					.map((meaning, idx) => (
						<span key={idx}>{`${meaning}, `}</span>
					))}
			</div> }
			{onyomi && <div className="w-full text-center text-zinc-500">
				{onyomi
					?.split(",")
					.map((meaning, idx) => (
						<span key={idx}>{`${meaning}, `}</span>
					))}
			</div> }
		</div>
	)
}
