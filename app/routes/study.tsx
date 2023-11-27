import { useEffect, useMemo, useRef, useState } from "react"
import { LazyBrush } from "lazy-brush"

export default function Study() {
  const [strokeCount, setStrokeCount] = useState(0)

  const lazy = useMemo(() => 
      new LazyBrush({
        enabled: true,
        radius: 20,
      }), [])

  let width = 384
  let height = 384

  const canvasInterfaceRef = useRef<HTMLCanvasElement | null>(null)
  const canvasTempRef = useRef<HTMLCanvasElement | null>(null)
  const canvasDrawingRef = useRef<HTMLCanvasElement | null>(null)
  const canvasGridRef = useRef<HTMLCanvasElement | null>(null)

  // let isPressing = false
  const isPressing = useRef(false)
  // let isDrawing = false
  const isDrawing = useRef(false)
  let points: { x: number, y: number }[] = []
  let dpi = 2
  const DRAW_MAX_DPI = 2

  // let x = 0;
  // const [x, setX] = useState(0)
  const x = useRef(0)
  // const [y, setY] = useState(0)
  const y = useRef(0)
  // let y = 0;

  function handleMouseDown() {
    isPressing.current = true
  }

  function handlePointerUp() {
    isDrawing.current = false
    isPressing.current = false
    points.length = 0
    const drawDpi = Math.min(dpi, DRAW_MAX_DPI)
    const w = canvasTempRef.current!.width / drawDpi
    const h = canvasTempRef.current!.height / drawDpi

    // Get temp onto Drawing canvas
    drawGuideLines()
    canvasDrawingRef.current!.getContext('2d')!.drawImage(canvasTempRef.current!, 0, 0, w, h)
    canvasTempRef.current!.getContext('2d')!.clearRect(0, 0, w, h)
    setStrokeCount((strokeCount) => strokeCount + 1)
  }

  function internalHandlePointerMove(newX: number, newY: number) {
    const rect = canvasDrawingRef.current!.getBoundingClientRect()
    // console.log(newX - rect.left)
    // x = newX - rect.left
    x.current = newX - rect.left
    // y = newY - rect.top
    y.current = newY - rect.top
  }

  function handleMouseMove(e: MouseEvent) {
    internalHandlePointerMove(e.clientX, e.clientY)
  }

  function handleTouchStart(e: TouchEvent) {
    internalHandlePointerMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    lazy.update({ x: x.current, y }, { both: true })
  }

  function handleTouchMove(e: TouchEvent) {
    internalHandlePointerMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
  }

  function handleTouchEnd() {
    handlePointerUp()
    const brush = lazy.getBrushCoordinates()
    lazy.update({ x: brush.x, y: brush.y }, { both: true })
  }

  function drawInterface() {
    const ctx = canvasInterfaceRef.current!.getContext('2d')
    const brush = lazy.getBrushCoordinates()
    // console.log(brush.x, brush.y)
    if (!ctx) return
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Brush Point
    ctx.beginPath()
    ctx.fillStyle = "blue"
    // TODO: View arc docs
    ctx.arc(brush.x, brush.y, 10, 0, Math.PI * 2, true)
    ctx.fill()

    // Mouse point
    ctx.beginPath()
    ctx.fillStyle = "red"
    ctx.arc(x.current, y.current, 2, 0, Math.PI * 2, true)
    ctx.fill()

    // Draw mouse point ??
    ctx.beginPath()
    ctx.fillStyle = '#222222'
    ctx.arc(brush.x, brush.y, 10, 0, Math.PI * 2, true)
    ctx.fill()
  }

  function drawGuideLines() {
    const ctx = canvasGridRef.current!.getContext('2d')
    if (!ctx) return
    // Horizontal Line
    ctx.beginPath()
    ctx.moveTo(ctx.canvas.width / (dpi * 2), 0)
    ctx.strokeStyle = "#F0F8FF"
    ctx.lineWidth = 4
    ctx.lineTo(ctx.canvas.width / (dpi * 2), ctx.canvas.height / dpi)
    ctx.stroke()

    // Vertical
    ctx.beginPath()
    ctx.moveTo(0, ctx.canvas.height / (dpi * 2))
    ctx.strokeStyle = "#F0F8FF"
    ctx.lineWidth = 4
    ctx.lineTo(ctx.canvas.width / dpi, ctx.canvas.height / (dpi * 2))
    ctx.stroke()
  }

  function midPointBtw(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2
    }
  }

  function updateLazyBrush() {
    // const hasChanged = lazy.update(
    //   { x, y },
    // )
    const hasMoved = lazy.brushHasMoved()

    if (!hasMoved) {
      // return
    }

    const ctx = canvasTempRef.current!.getContext('2d')!
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    if (
      (isPressing.current && !isDrawing.current)
    ) {
      isDrawing.current = true
      points.push(lazy.getBrushCoordinates())
    }

    if (isDrawing.current) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      // brush radius * 2
      ctx.lineWidth = 10 * 2
      points.push(lazy.getBrushCoordinates())

      let p1 = points[0]
      let p2 = points[1]

      ctx.moveTo(p2.x, p2.y)
      ctx.beginPath()

      for (let i = 1, len = points.length; i < len; i++) {
        // we pick the point between pi+1 & pi+2 as the
        // end point and p1 as our control point
        const midPoint = midPointBtw(p1, p2)
        ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
        p1 = points[i]
        p2 = points[i + 1]
      }
      // Draw last line as a straight line while
      // we wait for the next point to be able to calculate
      // the bezier control point
      ctx.lineTo(p1.x, p1.y)
      ctx.stroke()
    }
  }


  let raf = null
  function loop() {
    drawInterface()
    drawGuideLines()
    updateLazyBrush()
    lazy.update({ x: x.current, y: y.current })
    raf = requestAnimationFrame(loop)
  }

  function setDpi() {
    var dpr = window.devicePixelRatio || 2;
    // Get the size of the canvas in CSS pixels.
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvasDrawingRef.current!.width = 384 * dpr;
    canvasDrawingRef.current!.height = 384 * dpr;
    canvasInterfaceRef.current!.width = 384 * dpr;
    canvasInterfaceRef.current!.height = 384 * dpr;
    canvasTempRef.current!.width = 384 * dpr;
    canvasTempRef.current!.height = 384 * dpr;
    canvasGridRef.current!.width = 384 * dpr;
    canvasGridRef.current!.height = 384 * dpr;

    var ctx = canvasDrawingRef.current!.getContext('2d');
    var ctxInterface = canvasInterfaceRef.current!.getContext('2d');
    var ctxTemp = canvasTempRef.current!.getContext('2d');
    var ctxGrid = canvasGridRef.current!.getContext('2d');
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx!.scale(dpr, dpr);
    ctxInterface!.scale(dpr, dpr);
    ctxTemp!.scale(dpr, dpr);
    ctxGrid!.scale(dpr, dpr)
    return ctx;
  }

  function initiateCanvasHandlers() {
    canvasInterfaceRef.current!.addEventListener('mousedown', handleMouseDown)
    canvasInterfaceRef.current!.addEventListener('mousemove', handleMouseMove)
    canvasInterfaceRef.current!.addEventListener('mouseup', handlePointerUp)
    canvasInterfaceRef.current!.addEventListener('touchstart', handleTouchStart)
    canvasInterfaceRef.current!.addEventListener('touchmove', handleTouchMove)
    canvasInterfaceRef.current!.addEventListener('touchend', handleTouchEnd)
  }

  function removeCanvasHandlers() {
    canvasInterfaceRef.current!.removeEventListener('mousedown', handleMouseDown)
    canvasInterfaceRef.current!.removeEventListener('mousemove', handleMouseMove)
    canvasInterfaceRef.current!.removeEventListener('mouseup', handlePointerUp)
    canvasInterfaceRef.current!.removeEventListener('touchstart', handleTouchStart)
    canvasInterfaceRef.current!.removeEventListener('touchmove', handleTouchMove)
    canvasInterfaceRef.current!.removeEventListener('touchend', handleTouchEnd)
  }

  useEffect(() => {
    initiateCanvasHandlers()
    return () => 
      removeCanvasHandlers()
  })

  useEffect(() => {
    setDpi()
    loop()

    return () => {
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex items-center justify-center mb-4">
          <button id="prev" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-l">
            ←
          </button>
          <div id="character" className="mx-4 py-2 px-4 border rounded text-2xl bg-white text-black">
            感
          </div>
          <button id="next" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-r">
            →
          </button>
        </div>
        <div className="mb-2">
          <button id="toggle" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded">
            hide
          </button>
        </div>
        <div className="flex justify-between w-full max-w-lg mb-4">
          <div>stroke count: <span id="strokeCount">{strokeCount}</span></div>
          <div>drawn count: <span id="drawnCount">4</span></div>
        </div>
        <div className="w-[384px] h-[384px] relative">
          <canvas
            ref={canvasInterfaceRef} width="384" height="384"
            className="border-2 border-gray-500 absolute left-0 top-0 z-40 w-[384px] h-[384px]"
          />
          <canvas ref={canvasTempRef} width="384" height="384"
            className="border-2 border-gray-500 absolute left-0 top-0 z-30 w-[384px] h-[384px]"
          ></canvas>
          <canvas ref={canvasDrawingRef} width="384" height="384" className="border-2 border-gray-500 absolute left-0 top-0 z-20 w-[384px] h-[384px]"></canvas>
          <canvas ref={canvasGridRef} width="384" height="384" className="border-2 border-gray-500 absolute left-0 top-0 z-10 w-[384px] h-[384px]"></canvas>
        </div>
      </div>
    </div>
  )
}
