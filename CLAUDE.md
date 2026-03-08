# Pyros - Wildfire Detection Dashboard

## Project Overview
Wildfire detection system using a Raspberry Pi camera + ESP32 IMU sensor with a Next.js web dashboard.

## Architecture

### Hardware
- **ESP32** with MPU6050 (accelerometer/gyro) + QMC5883L (compass) + Madgwick filter
- Sends `yaw,pitch,roll` over Bluetooth Serial at 20Hz (50ms interval)
- Bluetooth name: `ESP32_IMU`
- Serial port: `/dev/cu.ESP32_IMU` (macOS), `COM3` (Windows)

### Backend - IMU Server (`imu_server.py`)
- Flask server on `localhost:5000`
- Reads ESP32 Bluetooth serial in a daemon thread
- Endpoints: `GET /api/imu-data`, `GET /api/imu-health`
- CORS enabled for all origins
- Python venv: `model/tf_env/` (Python 3.9.6)

### Frontend - Web Dashboard (`web/`)
- Next.js 16.1.6 on `localhost:3000`
- API routes proxy to Flask (IMPORTANT: must use `export const dynamic = 'force-dynamic'`)
- Dashboard at `/render/dashboard` - Three.js 3D IMU visualization
- Polls `/api/imu-data` every 50ms (connected) or 2s (disconnected)
- Fire detection via Gemini 2.5 Flash spectral analysis
- Alert drafting via Claude Sonnet 4

## Running
```bash
# Both servers (recommended)
./start_both_servers.sh

# Or separately:
# Terminal 1: ./start_imu_server.sh
# Terminal 2: cd web && npm run dev
```

## Key Files
- `imu_server.py` - Flask IMU server
- `start_both_servers.sh` - Combined launcher with health checks
- `web/app/api/imu-data/route.ts` - Next.js proxy to Flask (force-dynamic)
- `web/app/api/imu-health/route.ts` - Health check proxy (force-dynamic)
- `web/app/(app)/render/dashboard/page.tsx` - 3D IMU viewer
- `web/app/context/app-context.tsx` - Global fire detection state
- `web/lib/analyze-image.ts` - Gemini spectral analysis
- `web/lib/pipeline.ts` - Alert pipeline (Claude API)

## Important Conventions
- Next.js API routes that proxy to external servers MUST export `dynamic = 'force-dynamic'` to prevent static optimization/caching
- IMU server logs go to `/tmp/imu_server.log` when run via start_both_servers.sh
- Python dependencies: flask, flask-cors, pyserial (installed in model/tf_env)
