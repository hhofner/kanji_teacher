interface Props {
	kanjis: string[];
	currentIndex: number;
	onSetIndex: (idx: number) => void;
}
export default function KanjiListIndicator({ kanjis, currentIndex, onSetIndex }: Props) {
	return (
		<div className="w-full flex justify-center gap-2">
			{kanjis.map((_, idx) => (
				<div
					key={idx}
					onClick={() => onSetIndex(idx)}
					className={`rounded-full w-2 h-2 border border-black ${idx === currentIndex
						? "bg-black"
						: "cursor-pointer"
						}`}
				></div>
			))}
		</div>
	)
}
