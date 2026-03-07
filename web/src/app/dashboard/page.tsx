"use client"

import Link from "next/link"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Flame, Activity, Wifi, WifiOff } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface IMUData {
  yaw: number
  pitch: number
  roll: number
  axis: { x: number; y: number; z: number }
  up: { x: number; y: number; z: number }
  connected: boolean
}

export default function Dashboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [imuData, setImuData] = useState<IMUData>({
    yaw: 0,
    pitch: 0,
    roll: 0,
    axis: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 0, z: 0 },
    connected: false
  })

  const [connected, setConnected] = useState(false)

  // fetch IMU data
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/imu-data")

        if (!res.ok) {
          setConnected(false)
          return
        }

        const data = await res.json()

        setImuData(data)
        setConnected(true)
      } catch {
        setConnected(false)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // rendering
  useEffect(() => {

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    ctx.fillStyle = "#14141a"
    ctx.fillRect(0,0,w,h)

    if (!imuData.connected) {

      ctx.fillStyle = "#6b7280"
      ctx.font = "18px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("IMU Disconnected", w/2, h/2)

      return
    }

    const scale = 120

    const cam = {x:-1,y:-0.3,z:-1}
    const camLen = Math.hypot(cam.x,cam.y,cam.z)

    cam.x/=camLen
    cam.y/=camLen
    cam.z/=camLen

    const camRight = {
      x: cam.y*0 - cam.z*1,
      y: cam.z*0 - cam.x*0,
      z: cam.x*1 - cam.y*0
    }

    const camUp = {
      x: camRight.y*cam.z - camRight.z*cam.y,
      y: camRight.z*cam.x - camRight.x*cam.z,
      z: camRight.x*cam.y - camRight.y*cam.x
    }

    function project(p:{x:number,y:number,z:number}){

      const x = p.x*camRight.x + p.y*camRight.y + p.z*camRight.z
      const y = p.x*camUp.x + p.y*camUp.y + p.z*camUp.z
      const z = p.x*cam.x + p.y*cam.y + p.z*cam.z + 6

      return {
        x: w/2 + (x/z)*scale,
        y: h/2 - (y/z)*scale
      }

    }

    const axis = imuData.axis
    const up = imuData.up

    const right = {
      x: axis.y*up.z - axis.z*up.y,
      y: axis.z*up.x - axis.x*up.z,
      z: axis.x*up.y - axis.y*up.x
    }

    const L = 4
    const W = 2
    const H = 1

    const corners = [
      [-L/2,-H/2,-W/2],
      [ L/2,-H/2,-W/2],
      [ L/2, H/2,-W/2],
      [-L/2, H/2,-W/2],
      [-L/2,-H/2, W/2],
      [ L/2,-H/2, W/2],
      [ L/2, H/2, W/2],
      [-L/2, H/2, W/2]
    ]

    const verts = corners.map(c => {

      const p = {
        x: axis.x*c[0] + up.x*c[1] + right.x*c[2],
        y: axis.y*c[0] + up.y*c[1] + right.y*c[2],
        z: axis.z*c[0] + up.z*c[1] + right.z*c[2]
      }

      return project(p)

    })

    const faces = [
      [0,1,2,3],
      [4,5,6,7],
      [0,1,5,4],
      [2,3,7,6],
      [0,3,7,4],
      [1,2,6,5]
    ]

    ctx.strokeStyle = "#dc2626"
    ctx.fillStyle = "rgba(220,38,38,0.35)"
    ctx.lineWidth = 2

    faces.forEach(f => {

      ctx.beginPath()
      ctx.moveTo(verts[f[0]].x,verts[f[0]].y)
      ctx.lineTo(verts[f[1]].x,verts[f[1]].y)
      ctx.lineTo(verts[f[2]].x,verts[f[2]].y)
      ctx.lineTo(verts[f[3]].x,verts[f[3]].y)
      ctx.closePath()

      ctx.fill()
      ctx.stroke()

    })

    function drawArrow(v:{x:number,y:number,z:number},color:string){

      const p = project(v)

      ctx.strokeStyle = color
      ctx.lineWidth = 3

      ctx.beginPath()
      ctx.moveTo(w/2,h/2)
      ctx.lineTo(p.x,p.y)
      ctx.stroke()

    }

    drawArrow({x: axis.x*3, y: axis.y*3, z: axis.z*3},"#22c55e")
    drawArrow({x: up.x*3, y: up.y*3, z: up.z*3},"#06b6d4")

    ctx.fillStyle = "#ffffff"
    ctx.font = "16px monospace"
    ctx.textAlign = "left"

    ctx.fillText(`Yaw: ${imuData.yaw.toFixed(1)}°`,30,50)
    ctx.fillText(`Pitch: ${imuData.pitch.toFixed(1)}°`,30,80)
    ctx.fillText(`Roll: ${imuData.roll.toFixed(1)}°`,30,110)

  }, [imuData])

  return (
    <main className="min-h-screen w-full bg-background flex flex-col">

      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 h-14 flex justify-between items-center">

          <Link href="/">
            <div className="flex items-center gap-2 text-primary font-bold text-xl">
              <Flame className="w-5 h-5"/>
              Pyros
            </div>
          </Link>

          <div
            className={`hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
              connected
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-border text-muted-foreground"
            }`}
          >
            {connected ? <Wifi className="w-3 h-3"/> : <WifiOff className="w-3 h-3"/>}
            {connected ? "IMU Connected" : "IMU Disconnected"}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle/>
            <Link href="/">
              <ShimmerButton background="rgba(159,18,57,1)">
                <span className="text-white text-xs">← Home</span>
              </ShimmerButton>
            </Link>
          </div>

        </div>

      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
            Live Telemetry
          </p>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            IMU Orientation Viewer
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1">

          <div className="lg:col-span-3">

            <div className="relative min-h-[520px] rounded-2xl border border-border bg-card overflow-hidden">

              <div className="absolute top-0 left-0 right-0 h-9 bg-card border-b flex items-center px-4 gap-2">

                <Activity
                  className={`w-3.5 h-3.5 ${
                    connected
                      ? "text-emerald-500 animate-pulse"
                      : "text-red-500"
                  }`}
                />

                <span className="text-xs text-muted-foreground">
                  localhost:5000
                </span>

              </div>

              <canvas
                ref={canvasRef}
                width={1000}
                height={650}
                className="absolute inset-0 top-9 w-full h-[calc(100%-2.25rem)] bg-[#141418]"
              />

            </div>

          </div>

        </div>

      </div>

    </main>
  )
}