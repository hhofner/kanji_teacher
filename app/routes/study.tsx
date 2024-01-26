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
import { kanji, setting } from "~/drizzle/schema.server";
import { requireUser } from "~/session";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { type action as kanjiRecordAction } from "./api.kanji.record";
import { type action as settingSetAction } from "./api.setting.set";
import { Button } from "~/components/ui/button";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const startDay = format(startOfWeek(new Date()), "MM/dd");
  const kanjis = await db
    .select()
    .from(kanji)
    .where(and(eq(kanji.date, startDay), eq(kanji.userId, user.id)));

  const rawSettings = await db
    .select()
    .from(setting)
    .where(eq(setting.userId, user.id));
  let settings = {
    isAutoReset: false,
    lastKanjiIndex: 0,
  };
  if (rawSettings.length > 0) {
    settings = rawSettings[0];
  }
  return {
    kanjis,
    isAutoReset: settings.isAutoReset,
    lastKanjiIndex: settings.lastKanjiIndex > kanjis.length ? 0 : settings.lastKanjiIndex,
  };
}

export default function Study() {
  const {
    kanjis,
    isAutoReset: autoResetSetting,
    lastKanjiIndex,
  } = useLoaderData<typeof loader>();

  const [strokeCount, setStrokeCount] = useState(0);
  const [currentKanji, setCurrentKanji] = useState(lastKanjiIndex);
  const [hidden, setHidden] = useState(false);
  const [drawnCount, setDrawnCount] = useState(0);
  const [isAutoReset, setIsAutoReset] = useState(autoResetSetting);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<typeof kanjiRecordAction>();
  const settingsFetcher = useFetcher<typeof settingSetAction>();

  const noKanjisExist = kanjis.length === 0;

  const lazy = useMemo(
    () =>
      new LazyBrush({
        enabled: true,
        radius: 1,
      }),
    [],
  );

  let width = useRef(300);
  let height = useRef(300);

  const canvasInterfaceRef = useRef<HTMLCanvasElement>(null);
  const canvasTempRef = useRef<HTMLCanvasElement>(null);
  const canvasDrawingRef = useRef<HTMLCanvasElement>(null);
  const canvasGridRef = useRef<HTMLCanvasElement>(null);

  const isPressing = useRef(false);
  const isDrawing = useRef(false);
  let points = useRef<{ x: number; y: number }[]>([]);
  let dpi = useRef(2);

  const x = useRef(0);
  const y = useRef(0);
  const [validStroke, setValidStroke] = useState(false);

  function handleAutoResetChange() {
    settingsFetcher.submit(
      { isAutoReset: !isAutoReset, lastKanjiIndex: currentKanji },
      { method: "POST", action: "/api/setting/set" },
    );
    setIsAutoReset(!isAutoReset);
  }

  function handleKanjiStrokeCount() {
    if (!validStroke) return;
    if (kanjis[currentKanji]) {
      if (kanjis[currentKanji].strokeCount === strokeCount + 1 && isAutoReset) {
        setStrokeCount(0);
        clearCanvasReset();
        setDrawnCount((drawnCount) => drawnCount + 1);
        fetcher.submit(
          { kanji: kanjis[currentKanji].character },
          { method: "POST", action: "/api/kanji/record" },
        );
      } else {
        setStrokeCount((strokeCount) => strokeCount + 1);
      }
    } else {
      setStrokeCount((strokeCount) => strokeCount + 1);
    }
  }

  function handleMouseDown() {
    isPressing.current = true;
  }

  function handlePointerUp() {
    isDrawing.current = false;
    isPressing.current = false;
    points.current.length = 0;
    const w = canvasTempRef.current!.width / dpi.current;
    const h = canvasTempRef.current!.height / dpi.current;

    // Get temp onto Drawing canvas
    drawGuideLines();
    canvasDrawingRef
      .current!.getContext("2d")!
      .drawImage(canvasTempRef.current!, 0, 0, w, h);
    canvasTempRef.current!.getContext("2d")!.clearRect(0, 0, w, h);
    handleKanjiStrokeCount();
    setValidStroke(false);
  }

  function internalHandlePointerMove(newX: number, newY: number) {
    const rect = canvasDrawingRef.current!.getBoundingClientRect();
    x.current = newX - rect.left;
    y.current = newY - rect.top;
  }

  function handleMouseMove(e: MouseEvent) {
    internalHandlePointerMove(e.clientX, e.clientY);
  }

  function handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    internalHandlePointerMove(
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY,
    );
    lazy.update({ x: x.current, y: y.current }, { both: true });
    isPressing.current = true;
  }

  function handleTouchMove(e: TouchEvent) {
    internalHandlePointerMove(
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY,
    );
  }

  function handleTouchEnd() {
    handlePointerUp();
    const brush = lazy.getBrushCoordinates();
    lazy.update({ x: brush.x, y: brush.y }, { both: true });
  }

  function drawInterface() {
    const ctx = canvasInterfaceRef.current!.getContext("2d");
    const brush = lazy.getBrushCoordinates();
    // console.log(brush.x, brush.y)
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Brush Point
    ctx.beginPath();
    ctx.fillStyle = "blue";
    // TODO: View arc docs
    ctx.arc(brush.x, brush.y, 10, 0, Math.PI * 2, true);
    ctx.fill();

    // Mouse point
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(x.current, y.current, 2, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw mouse point ??
    ctx.beginPath();
    ctx.fillStyle = "#222222";
    ctx.arc(brush.x, brush.y, 10, 0, Math.PI * 2, true);
    ctx.fill();
  }

  function drawGuideLines() {
    const ctx = canvasGridRef.current!.getContext("2d");
    if (!ctx) return;
    // Horizontal Line
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / (dpi.current * 2), 0);
    ctx.strokeStyle = "#F0F8FF";
    ctx.lineWidth = 4;
    ctx.lineTo(
      ctx.canvas.width / (dpi.current * 2),
      ctx.canvas.height / dpi.current,
    );
    ctx.stroke();

    // Vertical
    ctx.beginPath();
    ctx.moveTo(0, ctx.canvas.height / (dpi.current * 2));
    ctx.strokeStyle = "#F0F8FF";
    ctx.lineWidth = 4;
    ctx.lineTo(
      ctx.canvas.width / dpi.current,
      ctx.canvas.height / (dpi.current * 2),
    );
    ctx.stroke();
  }

  function midPointBtw(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2,
    };
  }

  function updateLazyBrush() {
    // const hasChanged = lazy.update(
    //   { x, y },
    // )
    const hasMoved = lazy.brushHasMoved();

    if (!hasMoved) {
      // return
    }

    const ctx = canvasTempRef.current!.getContext("2d")!;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (isPressing.current && !isDrawing.current) {
      isDrawing.current = true;
      points.current = [...points.current, lazy.getBrushCoordinates()];
    }

    if (isDrawing.current) {
      if (lazy.brushHasMoved()) {
        setValidStroke(true);
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // brush radius * 2
      ctx.lineWidth = 14;
      points.current = [...points.current, lazy.getBrushCoordinates()];

      let p1 = points.current[0];
      let p2 = points.current[1];

      ctx.moveTo(p2.x, p2.y);
      ctx.beginPath();

      for (let i = 1, len = points.current.length; i < len; i++) {
        // we pick the point between pi+1 & pi+2 as the
        // end point and p1 as our control point
        const midPoint = midPointBtw(p1, p2);
        ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        p1 = points.current[i];
        p2 = points.current[i + 1];
      }
      // Draw last line as a straight line while
      // we wait for the next point to be able to calculate
      // the bezier control point
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
  }

  let raf: null | number = null;
  function loop() {
    // drawInterface();
    drawGuideLines();
    updateLazyBrush();
    lazy.update({ x: x.current, y: y.current });
    raf = window.requestAnimationFrame(loop);
  }

  function setDpi() {
    var dpr = window.devicePixelRatio || 2;
    dpi.current = dpr;
    // Get the size of the canvas in CSS pixels.
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvasDrawingRef.current!.width = width.current * dpr;
    canvasDrawingRef.current!.height = width.current * dpr;
    canvasInterfaceRef.current!.width = width.current * dpr;
    canvasInterfaceRef.current!.height = width.current * dpr;
    canvasTempRef.current!.width = width.current * dpr;
    canvasTempRef.current!.height = width.current * dpr;
    canvasGridRef.current!.width = width.current * dpr;
    canvasGridRef.current!.height = width.current * dpr;

    var ctx = canvasDrawingRef.current!.getContext("2d");
    var ctxInterface = canvasInterfaceRef.current!.getContext("2d");
    var ctxTemp = canvasTempRef.current!.getContext("2d");
    var ctxGrid = canvasGridRef.current!.getContext("2d");
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx!.scale(dpr, dpr);
    ctxInterface!.scale(dpr, dpr);
    ctxTemp!.scale(dpr, dpr);
    ctxGrid!.scale(dpr, dpr);
    return ctx;
  }

  function initiateCanvasHandlers() {
    canvasInterfaceRef.current!.addEventListener("mousedown", handleMouseDown);
    canvasInterfaceRef.current!.addEventListener("mousemove", handleMouseMove);
    canvasInterfaceRef.current!.addEventListener("mouseup", handlePointerUp);
    canvasInterfaceRef.current!.addEventListener(
      "touchstart",
      handleTouchStart,
    );
    canvasInterfaceRef.current!.addEventListener("touchmove", handleTouchMove);
    canvasInterfaceRef.current!.addEventListener("touchend", handleTouchEnd);
  }

  function removeCanvasHandlers() {
    if (canvasInterfaceRef.current) {
      canvasInterfaceRef.current!.removeEventListener(
        "mousedown",
        handleMouseDown,
      );
      canvasInterfaceRef.current!.removeEventListener(
        "mousemove",
        handleMouseMove,
      );
      canvasInterfaceRef.current!.removeEventListener(
        "mouseup",
        handlePointerUp,
      );
      canvasInterfaceRef.current!.removeEventListener(
        "touchstart",
        handleTouchStart,
      );
      canvasInterfaceRef.current!.removeEventListener(
        "touchmove",
        handleTouchMove,
      );
      canvasInterfaceRef.current!.removeEventListener(
        "touchend",
        handleTouchEnd,
      );
    }
  }

  function setCanvasSize() {
    // get size of containerRef
    const containerHeight = canvasContainerRef.current!.clientHeight;
    const containerWidth = canvasContainerRef.current!.clientWidth;

    let maxSize = 300;

    height.current = Math.max(containerHeight, maxSize);
    width.current = Math.max(containerWidth, maxSize);
  }

  useEffect(() => {
    setCanvasSize();
    setDpi();
    loop();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    initiateCanvasHandlers();
    return () => removeCanvasHandlers();
  });

  function clearCanvasReset() {
    const w = canvasDrawingRef.current!.width / dpi.current;
    const h = canvasDrawingRef.current!.height / dpi.current;

    canvasDrawingRef.current!.getContext("2d")!.clearRect(0, 0, w, h);
    setStrokeCount(0);
  }

  function resetCanvas() {
    const kanjiStrokeCount = kanjis[currentKanji].strokeCount;
    if (kanjiStrokeCount) {
      if (strokeCount >= kanjiStrokeCount) {
        setDrawnCount((drawnCount) => drawnCount + 1);
        fetcher.submit(
          { kanji: kanjis[currentKanji].character },
          { method: "POST", action: "/api/kanji/record" },
        );
      }
    }
    clearCanvasReset();
  }

  function nextKanji() {
    if (currentKanji === kanjis.length - 1) {
      setCurrentKanji(0);
      settingsFetcher.submit(
        { isAutoReset, lastKanjiIndex: 0 },
        { method: "POST", action: "/api/setting/set" },
      );
    } else {
      setCurrentKanji(currentKanji + 1);
      settingsFetcher.submit(
        { isAutoReset, lastKanjiIndex: currentKanji + 1 },
        { method: "POST", action: "/api/setting/set" },
      );
    }
    clearCanvasReset();
    setStrokeCount(0);
  }

  function previousKanji() {
    if (currentKanji === 0) {
      setCurrentKanji(kanjis.length - 1);
      settingsFetcher.submit(
        { isAutoReset, lastKanjiIndex: kanjis.length - 1 },
        { method: "POST", action: "/api/setting/set" },
      );
    } else {
      setCurrentKanji(currentKanji - 1);
      settingsFetcher.submit(
        { isAutoReset, lastKanjiIndex: currentKanji - 1 },
        { method: "POST", action: "/api/setting/set" },
      );
    }
    clearCanvasReset();
    setStrokeCount(0);
  }

  return (
    <div className="select-none safari-no-select">
      <div className="flex flex-col">
        <div className="flex mb-6 justify-center">{noKanjisExist ? (
          <div className="w-full text-center">No kanjis selected, add some</div>
        ) : (
          <>
            <div className="flex items-center justify-center mb-2 select-none w-1/2">
              <div
                id="character"
                className="relative mx-4 py-2 px-4 rounded text-6xl text-bold bg-white text-black"
                onClick={() => setHidden(!hidden)}
              >
                <span className={`${hidden ? "invisible" : ""}`}>
                  {kanjis[currentKanji].character}
                </span>
                <span
                  className={`absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 text-gray-700 ${hidden ? "" : "invisible"
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
            </div>
          </>
        )}
          <div className="mb-2 w-1/2">
            {!noKanjisExist && (
              <div>
                <div className="w-full text-zinc-500">
                  {kanjis[currentKanji].meanings
                    ?.split(",")
                    .slice(0, 4)
                    .join(", ")}
                </div></div>
            )}
            {!noKanjisExist && (
              <div className="w-full text-zinc-500">
                {kanjis[currentKanji].onyomi
                  ?.split(",")
                  .slice(0, 4)
                  .join(", ")}

              </div>
            )}
            {!noKanjisExist && (
              <div>
                <div className="w-full text-zinc-500">
                  {kanjis[currentKanji].kunyomi
                    ?.split(",")
                    .slice(0, 4)
                    .join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>
        {!noKanjisExist && (
          <div className="mb-2">
            {kanjis[currentKanji].strokeCount || "error"} strokes
          </div>
        )}
        <div className="mb-2 flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => setHidden(!hidden)}
            id="toggle"
          >
            Hide
          </Button>
          <Button
            variant="secondary"
            onClick={() => resetCanvas()}
          >
            Reset
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleAutoResetChange()}
          >
            Auto Reset {isAutoReset ? "✔" : ""}
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => previousKanji()}>
              Prev
            </Button>
            <Button variant="outline" onClick={() => nextKanji()}>
              Next
            </Button>
          </div>
        </div>
        <div className="flex justify-between w-full mb-2">
          <div>
            Stroke Count: <span id="strokeCount">{strokeCount}</span>
          </div>
          <div>
            Drawn Count: <span id="drawnCount">{drawnCount}</span>
          </div>
        </div>
        <div className="p-4">
          <div
            className="aspect-square relative select-none max-w-md mx-auto"
            ref={canvasContainerRef}
          >
            <canvas
              ref={canvasInterfaceRef}
              className="border-2 border-gray-200 absolute left-0 top-0 z-40 h-full w-full aspect-square rounded"
              style={{ WebkitUserSelect: "none" }}
            />
            <canvas
              ref={canvasTempRef}
              className="border-2 border-gray-200 absolute left-0 top-0 z-30 h-full w-full aspect-square rounded"
              style={{ WebkitUserSelect: "none" }}
            ></canvas>
            <canvas
              ref={canvasDrawingRef}
              className="border-2 border-gray-200 absolute left-0 top-0 z-20 h-full w-full aspect-square rounded"
              style={{ WebkitUserSelect: "none" }}
            ></canvas>
            <canvas
              ref={canvasGridRef}
              className="border-2 border-gray-200 absolute left-0 top-0 z-10 h-full w-full aspect-square rounded"
              style={{ WebkitUserSelect: "none" }}
            ></canvas>
          </div>
        </div>
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
    return <div>Kanji not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
