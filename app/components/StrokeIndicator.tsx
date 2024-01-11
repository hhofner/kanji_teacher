interface Props {
	strokeCount: number | null;
	drawnCount: number | null;
}
export default function StrokeIndicator({ strokeCount, drawnCount }: Props) {
	return (
		<div className="flex justify-between w-full mb-4">
			<div>
				stroke count:
				<span id="strokeCount">{strokeCount ?? "/"}</span>
			</div>
			<div>
				drawn count: <span id="drawnCount">{drawnCount ?? "/"}</span>
			</div>
		</div>
	)
}
