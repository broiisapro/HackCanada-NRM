# About Pyros

**Pyros** is a wildfire detection system built for **HackCanada 2026** by a team of student innovators. It combines spectral imaging, AI, real-time weather, and autonomous emergency outreach to give first responders earlier, context-aware warnings.

---

## Inspiration

Climate change is increasing the frequency and intensity of wildfires worldwide. We were motivated by a simple idea: **early detection is our best defense.** We wanted to build something that could:

- Detect fire risk *before* flames are visible, using atmospheric signatures (flammable gases, combustion byproducts).
- Put that signal in context—the same gas reading in rain vs. in 40 km/h winds and 12% humidity should mean very different things.
- Close the loop by not only alerting humans but arming them with concise, AI-drafted alerts and even initiating emergency calls with live, weather-aware context.

We believe autonomous technology can provide the early warnings needed to save lives, protect wildlife, and preserve forests. Pyros is our attempt to make that real: spectral analysis + weather + AI, end to end.

---

## What it does

- **Spectral analysis** — You upload an image (e.g. from a spectral lens or camera); Pyros uses **Gemini 2.5 Flash** with reference spectra to identify combustible gases (e.g. hydrogen) and combustion indicators. It returns a risk level (low / medium / high / critical), confidence, and line observations.

- **Weather-aware risk** — For the reading’s location (Canadian cities with lat/lon), Pyros fetches **Open-Meteo** data (temperature, humidity, wind speed/direction) and computes a **dryness index** \( \in [0,1] \). Risk can be *elevated* when conditions favor spread (e.g. high wind + low humidity + dry + flammable gas → critical). Weather is shown on the Overview and fed into the emergency call agent.

- **Dashboard** — A **Next.js** app provides an **Overview** (weather card, status, confidence, risk, gases, chart over time, AI-drafted alert, “Call Emergency” button), a **Heatmap** (Canada map with hot spots, reading pin, wind arrow), **Analytics**, **Event Log**, **Render** (3D IMU from ESP32), **Upload & Analyze**, and **Settings**. Polling keeps monitor status, history, and call logs up to date.

- **Alert pipeline** — When fire is detected above a confidence threshold, Pyros logs the event, optionally notifies a webhook, and uses **Claude Sonnet 4** to draft a short alert for first responders (time, gases, risk, recommended action).

- **Emergency calls** — The user can trigger an outbound call via **ElevenLabs**. The AI agent uses a **get_current_status** tool that hits our webhook; the webhook returns current risk, confidence, gases, indicators, and a **weather summary** (e.g. “18°C, 45% humidity, 25 km/h NW wind, dry”) so the agent can relay context-aware reports to responders.

---

## How we built it

1. **Hardware & ingestion** — **ESP32** with MPU6050 (accel/gyro) and QMC5883L (compass), Madgwick filter, streaming yaw/pitch/roll over Bluetooth at 20 Hz. **Raspberry Pi** camera for imagery. **Flask** server (`imu_server.py`) on `localhost:5000` reads the ESP32 serial and exposes `GET /api/imu-data` and `GET /api/imu-health`. Next.js API routes proxy these with `dynamic = 'force-dynamic'` so the dashboard always gets live data.

2. **Spectral analysis (Gemini)** — User uploads an image; we send it with five reference spectra (continuous, hydrogen, sodium, calcium, mercury) to **Gemini 2.5 Flash**. The model returns which combustible gases (if any) match, with line observations and confidence. We map that to a base risk level from flammable gases and combustion indicators.

3. **Weather enrichment (Open-Meteo)** — For the reading’s location (from a weighted Canadian city list with lat/lon), we call **Open-Meteo** for current temperature, humidity, wind speed/direction. We compute a dryness index and optionally elevate risk when conditions favor spread. Weather is stored with the result and shown on the Overview and passed to the ElevenLabs agent.

4. **Dashboard (Next.js)** — Overview (weather at top, status, stats, chart, AI alert, Call Emergency), Heatmap (Canada map, reading location, wind arrow), Analytics, Event Log, Render (3D IMU), Upload & Analyze, Settings. Shared **reading locations** and a **seeded** random pick (e.g. by timestamp) keep the heatmap pin and server-side weather location in sync.

5. **Alert pipeline (Claude)** — When fire is detected above a confidence threshold, we log the event, optionally notify a webhook, and use **Claude Sonnet 4** to draft a short alert for first responders.

6. **Emergency calls (ElevenLabs)** — User triggers an outbound call; the agent uses a **get_current_status** tool that returns current risk, gases, indicators, and a weather summary string for natural speech. Gemini is also used for the voice agent for the voice agent for efficiency. 

---

## Challenges we ran into

- **API and key confusion** — We first used OpenWeatherMap’s Current Weather API; later tried One Call 3.0 (different product, different key). We hit 503s and unclear errors. We **switched to Open-Meteo**: same data we need (temp, humidity, wind), no API key, and a clear JSON contract. That simplified both implementation and ops.

- **Keeping heatmap and backend in sync** — The “reading” is placed on a Canadian city at random (weighted). We needed the *same* location for weather fetch (server) and for the pin on the map (client). We introduced a shared **reading locations** list with lat/lon and a **seeded** random pick (e.g. by timestamp) so server and client agree without passing the location in the request.

- **Risk logic that respects weather** — Defining when to bump risk (e.g. high → critical) so it’s consistent and explainable took iteration. We codified rules like: base high + (wind \( \geq \) 30 km/h or humidity &lt; 25%) + dry → critical, and appended short weather explanations to the indicators so the UI and the emergency agent stay aligned.

- **Real-time and caching** — Next.js was caching proxy responses to the IMU server. We had to set **`export const dynamic = 'force-dynamic'`** on those API routes so the dashboard always gets fresh data. We also avoid reusing stale weather when we need current conditions for risk and for the call agent.

---

## Accomplishments that we're proud of

- **End-to-end pipeline** — From image upload → spectral classification → weather fetch → risk escalation → dashboard display → AI-drafted alert → optional emergency call with live weather context. Everything is wired and working in one flow.

- **Weather in the loop** — Same spectral reading can mean different risk depending on atmosphere. We’re proud that Pyros doesn’t just “detect gas”; it combines gas + wind + humidity + dryness so the risk level and the voice agent’s report are both context-aware.

- **No-key weather** — Switching to Open-Meteo gave us reliable, open data without API key setup or subscription confusion. That makes the project easier to run and demo.

- **Unified reading location** — One seeded pick drives both the server-side weather fetch and the client-side heatmap pin, so the map and the “Weather (fire spread factors)” card always refer to the same place.

- **Voice agent with tools** — The ElevenLabs agent can pull real-time status and weather from our webhook and speak it naturally to first responders. That felt like a real “close the loop” moment.

---

## What we learned

- **Spectral fingerprinting** — How emission spectra identify gases (e.g. Balmer series for hydrogen: lines around \( \lambda \approx 410,\,434,\,486,\,656\,\text{nm} \)), and why *which* lines, *how many*, and *where* on the spectrum all matter to avoid false positives (e.g. sodium’s yellow doublet vs. hydrogen).

- **Fire weather** — Wind speed, humidity, and a simple dryness index (combining temperature and relative humidity) are critical. We encode it as a scalar \( \in [0,1] \) and use it to escalate risk when the atmosphere favors spread.

- **Full-stack + hardware** — Integrating Raspberry Pi camera and ESP32 IMU with Flask and Next.js, plus multiple external APIs (Gemini, Claude, Open-Meteo, ElevenLabs). Keeping real-time data flowing and the UI in sync with server-side state required clear contracts and careful handling of optional data.

- **Voice AI in emergencies** — Exposing a small “tool” endpoint that returns current risk, gases, and a **weather summary** made the agent’s reports much more useful for responders than a static script.

---

## What's next for Pyros

- **Live spectral feed** — Pipe imagery from the Raspberry Pi camera (or other hardware) into the analysis pipeline in real time instead of manual uploads, so the dashboard reflects a continuous stream of readings.

- **More gas signatures** — Extend reference spectra and prompts to detect additional combustible or combustion-byproduct species beyond hydrogen, and refine confidence and risk rules.

- **Stronger fire-weather index** — Replace or augment our simple dryness index with a more standard metric (e.g. FWI or similar) where data and licensing allow, and tune risk escalation rules accordingly.

- **Field testing** — Deploy hardware and dashboard in a controlled or partner setting to validate detection and alert flow with real users and responders.

- **Accessibility and i18n** — Improve dashboard accessibility and explore localization so Pyros can be used in more regions and languages.

---

*See fire before it spreads.*
