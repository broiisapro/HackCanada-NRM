"use client"
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Flame, Activity, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [imuPort, setImuPort] = useState(8080);
  const [iframeKey, setIframeKey] = useState(0);
  const [connected, setConnected] = useState(false);

  const refreshIframe = () => setIframeKey(k => k + 1);

  return (
    <main className="min-h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex justify-between items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
              <Flame className="w-5 h-5 text-primary" />
              Pyros
            </div>
          </Link>

          {/* Status pill */}
          <div className={`hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${connected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-border text-muted-foreground"}`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? "IMU Connected" : "IMU Disconnected"}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <ShimmerButton className="shadow-lg" background="rgba(159,18,57,1)">
                <span className="text-white text-xs font-medium px-1">← Home</span>
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Page title row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Live Telemetry</p>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">IMU Orientation Viewer</h1>
            <p className="text-muted-foreground mt-1.5 text-sm max-w-xl">
              Real-time 3D payload orientation from the ESP32 IMU. Run <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-xs font-mono">python imu_visualizer.py</code> to start streaming.
            </p>
          </div>

          {/* Port control */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">Port:</span>
            <input
              type="number"
              value={imuPort}
              onChange={e => setImuPort(Number(e.target.value))}
              className="w-20 text-xs bg-muted border border-border rounded-md px-2 py-1.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={refreshIframe}
              title="Refresh viewer"
              className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1">

          {/* VPython iframe — takes 3 columns */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="relative flex-1 min-h-[520px] rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg ring-1 ring-border/20 group">
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 h-9 bg-card/90 backdrop-blur border-b border-border/50 flex items-center px-4 gap-2 z-10">
                <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">localhost:{imuPort}</span>
                <div className="flex gap-1.5 ml-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
              </div>

              {/* iframe */}
              <iframe
                key={iframeKey}
                src={`http://localhost:${imuPort}`}
                className="absolute inset-0 top-9 w-full h-[calc(100%-2.25rem)] border-0 bg-[#141418]"
                title="IMU Visualizer"
                onLoad={() => setConnected(true)}
                onError={() => setConnected(false)}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />

              {/* Offline overlay */}
              <div className="absolute inset-0 top-9 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm transition-opacity pointer-events-none">
                <div className="flex flex-col items-center gap-3 text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-primary/60" />
                  </div>
                  <p className="font-semibold text-foreground">Visualizer not running</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Start the IMU script to see live 3D orientation data from your payload.
                  </p>
                  <code className="mt-1 text-xs bg-muted border border-border rounded-lg px-4 py-2 font-mono text-primary">
                    python imu_visualizer.py
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Side info panel — 1 column */}
          <div className="flex flex-col gap-4">

            {/* Axis legend */}
            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">Axis Legend</h3>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-sm bg-green-500 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Forward Arrow</p>
                    <p className="text-xs text-muted-foreground">Pitch / Yaw axis</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-sm bg-cyan-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Up Arrow</p>
                    <p className="text-xs text-muted-foreground">Roll axis</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-sm bg-primary shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Payload Box</p>
                    <p className="text-xs text-muted-foreground">Real-time orientation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* How to connect */}
            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Start</h3>
              <ol className="flex flex-col gap-2.5 text-xs text-muted-foreground list-decimal list-inside space-y-1">
                <li>Plug in your ESP32 via USB</li>
                <li>Activate the Python venv</li>
                <li>Run <code className="bg-muted text-primary px-1 rounded font-mono">python imu_visualizer.py</code></li>
                <li>VPython opens at <code className="bg-muted text-primary px-1 rounded font-mono">:8080</code></li>
                <li>This iframe auto-loads it</li>
              </ol>
            </div>

            {/* Serial config */}
            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">Serial Config</h3>
              <div className="flex flex-col gap-2 text-xs text-muted-foreground font-mono">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Baud</span>
                  <span className="text-primary">115200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">macOS</span>
                  <span className="text-primary truncate max-w-[120px]">/dev/cu.ESP32_IMU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Windows</span>
                  <span className="text-primary">COM3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
