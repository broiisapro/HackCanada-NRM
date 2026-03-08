# Pyros — 3-Minute Presentation Script (HackCanada 2026)

**Total: ~3 minutes | 3 speakers | ~60 seconds each**

---

## Speaker 1 — Hardware *(~60 sec)*

"Hi, I'm [Name], and I'll walk you through the hardware side of Pyros.

Pyros is a wildfire detection system. On the hardware side we use two main pieces: an **ESP32** and a **Raspberry Pi** camera.

The **ESP32** runs our orientation and motion sensing. It’s wired to an **MPU6050** — that’s our accelerometer and gyroscope — and a **QMC5883L** compass. We run a **Madgwick filter** on the ESP32 to fuse that data into clean **yaw, pitch, and roll**. Those values are sent over **Bluetooth Serial** at **20 hertz** — so every 50 milliseconds — to whatever machine is running our stack. That stream drives the **3D IMU visualization** on the dashboard so operators can see sensor orientation in real time.

We have a **Flask server** — `imu_server.py` — that connects to the ESP32 on the serial port, reads that stream in a background thread, and exposes **GET /api/imu-data** and **GET /api/imu-health**. The Next.js app proxies those with **force-dynamic** so the dashboard never gets cached IMU data; it’s always live.

The **Raspberry Pi camera** is there for imagery. Right now we use it for **upload-and-analyze**: you capture or upload a spectrum image, and that image goes into our AI pipeline. The goal later is to pipe a **live spectral feed** from the Pi into the same pipeline so we get continuous readings instead of one-off uploads.

So in short: ESP32 for real-time orientation over Bluetooth, Pi for spectral imagery, and a small Flask bridge so the web app always has fresh hardware data."

---

## Speaker 2 — Gemini + ElevenLabs *(~60 sec)*

"I'm [Name], and I'll cover how we use **Gemini** and **ElevenLabs** to close the loop from detection to emergency response.

**Spectral analysis** is done with **Gemini 2.5 Flash**. We send the unknown spectrum image plus five reference spectra — continuous, hydrogen, sodium, calcium, mercury — and a strict prompt that uses *which* lines, *how many*, and *where* on the spectrum. That avoids false positives: for example, we only treat **hydrogen** from the references as combustible. Gemini returns which gases match, line observations, and a confidence score. We map that to a **base risk level** — low, medium, high, or critical — and then we **elevate risk using weather**: Open-Meteo gives us temperature, humidity, wind speed and direction; we compute a dryness index and bump risk when conditions favor spread, like high wind and low humidity.

When fire is detected above our confidence threshold, we run an **alert pipeline**: we log the event, optionally hit a webhook, and use **Claude Sonnet 4** to draft a short, urgent alert for first responders — time, gases, risk, and recommended action.

For **emergency outreach** we use **ElevenLabs**. The user hits **Call Emergency** on the dashboard. That triggers an **outbound call** via ElevenLabs and Twilio. We create an agent with a **get_current_status** tool that POSTs to our webhook. The webhook returns the *current* risk, confidence, gases, indicators, and a **weather summary** — for example, '18 degrees, 45% humidity, 25 km/h NW wind, dry.' So the voice agent doesn’t just read a static script; it can pull **live** detection and weather and relay that to the person on the line. That’s how we close the loop: from spectrum → Gemini → weather-aware risk → Claude-drafted alert → ElevenLabs voice call with real-time context."

---

## Speaker 3 — Scalability, Front-End, Manufacturing & Business *(~60 sec)*

"I'm [Name], and I'll tie this together on **scalability**, the **front-end**, **manufacturing**, and the **business** side.

The **front-end** is a **Next.js** app with a clear information hierarchy. The **Overview** shows weather, status, confidence, risk level, detected gases, a chart over time, the AI-drafted alert, and a **Call Emergency** button when risk is high or critical. The **Heatmap** is a Canada map with reading locations and a wind arrow so you see where the reading is and what the conditions are. We have **Analytics**, an **Event Log**, a **Render** view with the **3D IMU** from the ESP32, **Upload & Analyze** for spectral images, and **Settings**. Reading locations are shared and **seeded** so the server-side weather fetch and the map pin always refer to the same place — no desync.

For **scalability**: the IMU and health endpoints are **force-dynamic** so we don’t cache live data. The ElevenLabs agent uses a **webhook tool** for status; that endpoint can sit behind any host, so we’re serverless-friendly. Alerts can go to a configurable **webhook**, so you can plug in incident systems or dashboards without changing code.

On **manufacturing**: we’re using **off-the-shelf** parts — ESP32, MPU6050, QMC5883L, Raspberry Pi, and a Pi camera. No custom PCB for the demo; that keeps cost and lead time low and makes it easy to replicate or pilot with partners.

On the **business** side: the value proposition is **early detection**. We’re not replacing responders; we’re giving them **earlier**, **context-aware** warnings — spectral signatures plus weather — and a one-click path to an **AI-drafted alert** and an **automated call** that can deliver live status. That’s relevant for **municipalities**, **forestry**, **parks**, and **emergency coordination** — anyone who needs to see fire risk before it’s visible and act on it fast. Next steps for us are **live spectral feed**, more gas signatures, a stronger fire-weather index, and **field testing** with real users and responders.

So: scalable front-end and APIs, hardware you can actually build and ship, and a business case built on early warning and closing the loop with first responders."

---

## Quick reference (from codebase)

| Area | Key files / concepts |
|------|------------------------|
| Hardware | `imu_server.py`, ESP32 MPU6050 + QMC5883L, Madgwick, Bluetooth 20Hz, Flask :5001 |
| Gemini | `web/lib/analyze-image.ts` — Gemini 2.5 Flash, reference spectra, combustible-only, weather risk escalation |
| Claude | `web/lib/pipeline.ts` — alert drafting for first responders |
| ElevenLabs | `web/lib/elevenlabs.ts` — agent with `get_current_status` tool, `web/app/api/elevenlabs-tool/route.ts` |
| Front-end | Next.js Overview, Heatmap, Analytics, Event Log, Render (3D IMU), Upload & Analyze, Settings |
| Weather | `web/lib/weather.ts` — Open-Meteo, dryness index, summary for voice |

---

*See fire before it spreads.*
