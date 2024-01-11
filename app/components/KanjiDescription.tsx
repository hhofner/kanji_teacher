interface Props {
	onyomi: string;
	kunyomi: string;
	meanings: string;
}
export default function KanjiDescription({ onyomi, kunyomi, meanings }: Props) {
	return (
		<div>
			<div className="w-full text-center text-zinc-500">
				{meanings
					?.split(",")
					.map((meaning, idx) => (
						<span key={idx}>{`${meaning}, `}</span>
					))}
			</div>
			<div className="w-full text-center text-zinc-500">
				{kunyomi
					?.split(",")
					.map((meaning, idx) => (
						<span key={idx}>{`${meaning}, `}</span>
					))}
			</div>
			<div className="w-full text-center text-zinc-500">
				{onyomi
					?.split(",")
					.map((meaning, idx) => (
						<span key={idx}>{`${meaning}, `}</span>
					))}
			</div>
		</div>
	)
}
