"use client";

import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Flame, Activity, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

interface IMUData {
  yaw: number;
  pitch: number;
  roll: number;
}

export default function RenderDashboardPage() {
  const mountRef = useRef<HTMLDivElement>(null);

  const payloadRef = useRef<THREE.Mesh | null>(null);
  const forwardArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const upArrowRef = useRef<THREE.ArrowHelper | null>(null);

  const [imuData, setImuData] = useState<IMUData>({
    yaw: 0,
    pitch: 0,
    roll: 0,
  });

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141418);

    const camera = new THREE.PerspectiveCamera(
      60,
      1000 / 650,
      0.1,
      1000
    );

    camera.position.set(-6, 3, -6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1000, 650);
    renderer.setPixelRatio(window.devicePixelRatio);

    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(5, 10, 5);
    scene.add(light);

    const geometry = new THREE.BoxGeometry(4, 1, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.6,
    });

    const payload = new THREE.Mesh(geometry, material);
    scene.add(payload);
    payloadRef.current = payload;

    const forwardArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      3,
      0x22c55e
    );

    const upArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      3,
      0x06b6d4
    );

    scene.add(forwardArrow);
    scene.add(upArrow);

    forwardArrowRef.current = forwardArrow;
    upArrowRef.current = upArrow;

    scene.add(new THREE.GridHelper(20, 20, 0x444444, 0x222222));

    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/imu-data");

        if (!res.ok) {
          setConnected(false);
          return;
        }

        const data = await res.json();

        setImuData(data);
        setConnected(true);
      } catch {
        setConnected(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const payload = payloadRef.current;
    const forwardArrow = forwardArrowRef.current;
    const upArrow = upArrowRef.current;

    if (!payload || !forwardArrow || !upArrow) return;

    const yaw = THREE.MathUtils.degToRad(imuData.yaw);
    const pitch = THREE.MathUtils.degToRad(imuData.pitch);
    const roll = THREE.MathUtils.degToRad(imuData.roll);

    let axis = new THREE.Vector3(
      Math.cos(pitch) * Math.cos(yaw),
      Math.sin(pitch),
      Math.cos(pitch) * Math.sin(yaw)
    );

    let up = new THREE.Vector3(
      -Math.sin(roll) * Math.sin(yaw),
      Math.cos(roll),
      Math.sin(roll) * Math.cos(yaw)
    );

    axis = new THREE.Vector3(axis.z, axis.y, -axis.x);
    up = new THREE.Vector3(up.x, up.z, -up.y);

    axis.normalize();
    up.normalize();

    const right = new THREE.Vector3().crossVectors(axis, up).normalize();
    up = new THREE.Vector3().crossVectors(right, axis).normalize();

    const m = new THREE.Matrix4();
    m.makeBasis(axis, up, right);

    const q = new THREE.Quaternion().setFromRotationMatrix(m);

    payload.setRotationFromQuaternion(q);

    forwardArrow.setDirection(axis);
    upArrow.setDirection(up);
  }, [imuData]);

  return (
    <main className="min-h-screen w-full bg-background flex flex-col">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex justify-between items-center">
          <Link href="/render">
            <div className="flex items-center gap-2 text-primary font-bold text-xl">
              <Flame className="w-5 h-5" />
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
            {connected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {connected ? "IMU Connected" : "IMU Disconnected"}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/render">
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

              <div
                ref={mountRef}
                className="absolute inset-0 top-9"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
