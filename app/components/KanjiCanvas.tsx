
import { useEffect, useRef, useState } from "react";
import KanjiDisplay from "./KanjiDisplay";
import KanjiListIndicator from "./KanjiListIndicator";
import KanjiDescription from "./KanjiDescription";
import StrokeIndicator from "./StrokeIndicator";
import { KanjiDb } from "~/types/kanji";

interface Props {
	onStroke: (isValid: boolean) => void;
	onClear: (isValid: boolean) => void;
	onHide: () => void;
	onAutoReset: () => void;
	onIndexChange: (idx: number) => void;
	isAutoReset: boolean;
	currentIndex: number;
	kanjis: KanjiDb[];
}

export default function KanjiCanvas({ onStroke, onClear, onHide, onAutoReset, onIndexChange, isAutoReset, currentIndex, kanjis }: Props) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasDrawnRef = useRef<HTMLCanvasElement | null>(null);
	const canvasGridRef = useRef<HTMLCanvasElement | null>(null);
	const isDrawing = useRef(false);
	const points = useRef<Array<{ x: number, y: number }>>([]);
	const offset = useRef({ x: 0, y: 0 });
	const dimensions = useRef({ width: 0, height: 0 });
	const dpr = useRef(1);
	const animationFrame = useRef(0);
	const hasDrawn = useRef(false);

	const [currentKanjiIndex, setCurrentKanjiIndex] = useState(currentIndex);
	const currentKanji = kanjis[currentKanjiIndex];
	const [drawnCount, setDrawnCount] = useState(0);
	const [isHidden, setIsHidden] = useState(false)

	function handleNextKanji() {
		if (currentKanjiIndex === kanjis.length - 1) {
			setCurrentKanjiIndex(0);
			onIndexChange(0)
		} else {
			setCurrentKanjiIndex(currentKanjiIndex + 1);
			onIndexChange(currentKanjiIndex + 1)
		}
	}

	function handlePreviousKanji() {
		if (currentKanjiIndex === 0) {
			setCurrentKanjiIndex(kanjis.length - 1);
			onIndexChange(kanjis.length - 1)
		} else {
			setCurrentKanjiIndex(currentKanjiIndex - 1);
			onIndexChange(currentKanjiIndex - 1)
		}
	}

	function drawOntoDrawnCanvas() {
		const canvasDrawn = canvasDrawnRef.current;
		if (!canvasDrawn) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const width = canvas.width / dpr.current
		const height = canvas.height / dpr.current

		const canvasDrawnCtx = canvasDrawn.getContext("2d")

		if (!canvasDrawnCtx) {
			return;
		}

		canvasDrawnCtx.drawImage(canvas, 0, 0, width, height);
	}

	// Mouse handlers
	function handleMouseDown(e: MouseEvent) {
		isDrawing.current = true;
		points.current.push({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y })
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDrawing.current) return;
		points.current.push({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y })
	}

	function handleMouseUp() {
		isDrawing.current = false;
		points.current = [];
		if (hasDrawn.current) {
			hasDrawn.current = false;
			setDrawnCount(drawnCount + 1)
		}
		drawOntoDrawnCanvas();
	}

	// Touch handlers
	function handleTouchStart(e: TouchEvent) {
		isDrawing.current = true;
		points.current.push({ x: e.touches[0].clientX - offset.current.x, y: e.touches[0].clientY - offset.current.y })
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDrawing.current) return;
		points.current.push({ x: e.touches[0].clientX - offset.current.x, y: e.touches[0].clientY - offset.current.y })
	}

	function handleTouchEnd() {
		isDrawing.current = false;
		points.current = [];
		if (hasDrawn.current) {
			hasDrawn.current = false;
			setDrawnCount(drawnCount + 1)
		}
	}

	function setDpr() {
		dpr.current = window.devicePixelRatio || 1;

		const canvas = canvasRef.current;
		const canvasDrawn = canvasDrawnRef.current;
		const canvasGrid = canvasGridRef.current;
		if (!canvas) return;
		if (!canvasDrawn) return;
		if (!canvasGrid) return;

		canvas.width = dimensions.current.width * dpr.current;
		canvas.height = dimensions.current.height * dpr.current;
		canvasDrawn.width = dimensions.current.width * dpr.current;
		canvasDrawn.height = dimensions.current.height * dpr.current;
		canvasGrid.width = dimensions.current.width * dpr.current;
		canvasGrid.height = dimensions.current.height * dpr.current;


		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const ctxDrawn = canvasDrawn.getContext("2d");
		if (!ctxDrawn) return;
		const ctxGrid = canvasGrid.getContext("2d");
		if (!ctxGrid) return;
		ctx.scale(dpr.current, dpr.current);
		ctxDrawn.scale(dpr.current, dpr.current);
		ctxGrid.scale(dpr.current, dpr.current);
	}

	function draw() {
		if (!isDrawing.current) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.lineWidth = 14;

		ctx.lineJoin = "round";
		ctx.lineCap = "round";

		if (points.current.length < 2) {
			return; // Not enough points to draw curves.
		}

		let p1 = points.current[0];
		let p2 = points.current[1];

		if (JSON.stringify(p1) !== JSON.stringify(p2)) {
			hasDrawn.current = true;
		}

		ctx.moveTo(p1.x, p1.y);

		for (let i = 1, len = points.current.length; i < len - 1; i++) {
			// calculate midpoint to be used as cp1
			const midPoint = calculateMidPoint(p1, p2);
			ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
			p1 = points.current[i];
			p2 = points.current[i + 1];
		}

		// Draw last bit of line (from last control point to the end point)
		if (p1 && p2) {
			ctx.lineTo(p2.x, p2.y)
		}
		ctx.stroke();
	}

	function calculateMidPoint(p1: { x: number, y: number }, p2: { x: number, y: number }) {
		return {
			x: p1.x + (p2.x - p1.x) / 2,
			y: p1.y + (p2.y - p1.y) / 2
		};
	}

	function drawGuideLines() {
		const canvasGrid = canvasGridRef.current;
		if (!canvasGrid) return;
		const ctx = canvasGrid.getContext("2d");
		if (!ctx) return;
		// Horizontal Line
		ctx.beginPath();
		ctx.moveTo(ctx.canvas.width / (dpr.current * 2), 0);
		ctx.strokeStyle = "#F0F8FF";
		ctx.lineWidth = 4;
		ctx.lineTo(
			ctx.canvas.width / (dpr.current * 2),
			ctx.canvas.height / dpr.current,
		);
		ctx.stroke();

		// Vertical
		ctx.beginPath();
		ctx.moveTo(0, ctx.canvas.height / (dpr.current * 2));
		ctx.strokeStyle = "#F0F8FF";
		ctx.lineWidth = 4;
		ctx.lineTo(
			ctx.canvas.width / dpr.current,
			ctx.canvas.height / (dpr.current * 2),
		);
		ctx.stroke();
	}

	function resetCanvas() {
		const canvas = canvasRef.current;
		const drawnCanvas = canvasDrawnRef.current;
		if (!canvas) return;
		if (!drawnCanvas) return;
		const ctx = canvas.getContext("2d");
		const drawnCtx = drawnCanvas.getContext("2d");
		if (!ctx) return;
		if (!drawnCtx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.clearRect(0, 0, drawnCanvas.width, drawnCanvas.height);
		if (currentKanji && currentKanji.strokeCount) { onClear(drawnCount >= currentKanji.strokeCount) }
			setDrawnCount(0)
	}

	function loop() {
		draw();
		animationFrame.current = requestAnimationFrame(loop);
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		offset.current = { x: rect.left, y: rect.top };
		const container = canvas.parentElement;
		if (!container) return;

		dimensions.current = { width: container.clientWidth, height: container.clientWidth };
		setDpr()

		canvas.addEventListener('mousedown', handleMouseDown);
		canvas.addEventListener('mousemove', handleMouseMove);
		canvas.addEventListener('mouseup', handleMouseUp);
		canvas.addEventListener('touchstart', handleTouchStart);
		canvas.addEventListener('touchmove', handleTouchMove);
		canvas.addEventListener('touchend', handleTouchEnd);

		drawGuideLines()

		animationFrame.current = requestAnimationFrame(loop);

		return () => {
			canvas.removeEventListener('mousedown', handleMouseDown);
			canvas.removeEventListener('mousemove', handleMouseMove);
			canvas.removeEventListener('mouseup', handleMouseUp);
			canvas.removeEventListener('touchstart', handleTouchStart);
			canvas.removeEventListener('touchmove', handleTouchMove);
			canvas.removeEventListener('touchend', handleTouchEnd);
			cancelAnimationFrame(animationFrame.current);
		}
	}, [])

	return (
		<div className="flex flex-col-reverse flex-grow justify-between">
			<div><div className="relative aspect-square max-w-md">
				<canvas id="canvas" width={dimensions.current.width} height={dimensions.current.height} ref={canvasRef} className="border border-zinc-300 border-1 w-full aspect-square absolute z-30"></canvas>
				<canvas id="canvasDrawn" width={dimensions.current.width} height={dimensions.current.height} ref={canvasDrawnRef} className="border border-zinc-300 w-full border-1 aspect-square absolute z-20"></canvas>
				<canvas id="canvasGrid" width={dimensions.current.width} height={dimensions.current.height} ref={canvasGridRef} className="border border-zinc-300 w-full border-1 aspect-square absolute z-10"></canvas>
			</div></div>
			<div className="mb-2 flex gap-4">
				<button
					onClick={() => onHide()}
					id="toggle"
					className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded"
				>
					hide
				</button>
				<button
					onClick={() => resetCanvas()}
					className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded"
				>
					reset
				</button>
				<button
					onClick={() => onAutoReset()}
					className={`hover:bg-gray-600 text-white font-bold py-1 px-2 rounded ${isAutoReset ? "bg-gray-700 " : "bg-gray-300 "
						}`}
				>
					auto reset {isAutoReset ? "✔" : ""}
				</button>
			</div>
			<StrokeIndicator strokeCount={currentKanji.strokeCount} drawnCount={drawnCount} />
			<KanjiDescription meanings={currentKanji.meanings} onyomi={currentKanji.onyomi} kunyomi={currentKanji.kunyomi} />
			<KanjiListIndicator kanjis={kanjis.map(k => k.character)} currentIndex={currentKanjiIndex} onSetIndex={(idx: number) => setCurrentKanjiIndex(idx)} />
			<KanjiDisplay character={currentKanji.character} onNext={() => handleNextKanji()} onSetHidden={() => setIsHidden(!isHidden)} onPrev={() => handlePreviousKanji()} isHidden={isHidden} />
		</div>
	);
}

