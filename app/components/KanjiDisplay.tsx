interface Props {
	character: string;
	onNext: () => void;
	onPrev: () => void;
	onSetHidden: () => void;
	isHidden: boolean;
}
export default function KanjiDisplay({ character, onNext, onPrev, onSetHidden, isHidden }: Props) {
	return (<div className="flex items-center justify-center mb-2 select-none">
		<button
			id="prev"
			onClick={() => onPrev()}
			className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-l"
		>
			←
		</button>
		<div
			id="character"
			className="relative mx-4 py-2 px-4 border rounded text-6xl text-bold bg-white text-black"
			onClick={() => onSetHidden()}
		>
			<span
				className={`${isHidden ? "invisible" : ""}`}
			>
				{character}
			</span>
			<span
				className={`absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 text-gray-700 ${isHidden ? "" : "invisible"
					}`}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 16 16"
				>
					<path
						fill="currentColor"
						d="M8 11c-1.65 0-3-1.35-3-3s1.35-3 3-3s3 1.35 3 3s-1.35 3-3 3m0-5c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"
					/>
					<path
						fill="currentColor"
						d="M8 13c-3.19 0-5.99-1.94-6.97-4.84a.442.442 0 0 1 0-.32C2.01 4.95 4.82 3 8 3s5.99 1.94 6.97 4.84c.04.1.04.22 0 .32C13.99 11.05 11.18 13 8 13M2.03 8c.89 2.4 3.27 4 5.97 4s5.07-1.6 5.97-4C13.08 5.6 10.7 4 8 4S2.93 5.6 2.03 8"
					/>
					<path
						fill="currentColor"
						d="M14 14.5a.47.47 0 0 1-.35-.15l-12-12c-.2-.2-.2-.51 0-.71c.2-.2.51-.2.71 0l11.99 12.01c.2.2.2.51 0 .71c-.1.1-.23.15-.35.15Z"
					/>
				</svg>
			</span>
		</div>
		<button
			id="next"
			onClick={() => onNext()}
			className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-r"
		>
			→
		</button>
	</div>
	)
}
