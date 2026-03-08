import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import google.generativeai as generativeai
from dotenv import load_dotenv

load_dotenv()

GEMINI_MODEL = "gemini-2.5-flash"
OUTPUT_DIR = Path(__file__).parent / "output"

# Step 1: Gemini ONLY identifies elements from spectral lines — no fire assessment
PROMPT = (
    "You are a spectroscopy expert. This image shows emission line spectra. "
    "Your ONLY job is to identify which elements or gases are present based on "
    "the visible emission line positions and colors.\n\n"
    "Known emission line signatures:\n"
    "- Hydrogen (H): violet ~410nm, blue ~434nm, cyan ~486nm, red ~656nm (Balmer series)\n"
    "- Helium (He): yellow ~588nm, blue ~447nm, violet ~402nm, red ~668nm\n"
    "- Sodium (Na): bright yellow doublet ~589nm\n"
    "- Calcium (Ca): violet ~393nm, ~397nm, blue ~423nm, green ~527nm\n"
    "- Mercury (Hg): violet ~405nm, blue ~436nm, green ~546nm, yellow ~578nm\n"
    "- Lithium (Li): bright red ~671nm\n"
    "- Neon (Ne): many red/orange lines 585-703nm\n"
    "- Potassium (K): violet ~404nm, red ~766nm, ~770nm\n"
    "- Iron (Fe): dense clusters of lines across visible spectrum\n"
    "- Carbon (C): red ~658nm, violet ~427nm\n"
    "- Nitrogen (N): red/orange lines ~575nm, ~648nm, ~744nm\n"
    "- Oxygen (O): green ~533nm, red ~615nm, ~645nm\n\n"
    "Look at the exact positions, colors, spacing, and number of emission lines. "
    "Match them against the known signatures above.\n\n"
    "Return a JSON object ONLY. No text, no markdown, no code fences.\n"
    "Fields:\n"
    "- elements (array of strings): identified elements/gases, e.g. [\"Hydrogen\", \"Helium\"]\n"
    "- line_observations (array of strings): describe each visible line, e.g. "
    "[\"violet line at ~410nm\", \"cyan line at ~486nm\", \"red line at ~656nm\"]\n"
    "- confidence (float 0-1): how confident you are in the identification"
)

RETRY_PROMPT = (
    "You must return only a raw JSON object. No markdown, no code fences, no explanation. "
    "Fields: elements (array of strings), line_observations (array of strings), confidence (float 0-1)."
)

# Step 2: Our code determines fire risk from identified elements
# Flammable/combustible elements and gases
FLAMMABLE = {
    "hydrogen", "h", "h2",
    "methane", "ch4",
    "carbon monoxide", "co",
    "propane", "c3h8",
    "ethane", "c2h6",
    "ethylene", "c2h4",
    "acetylene", "c2h2",
    "butane", "c4h10",
    "ammonia", "nh3",
    "carbon", "c",
    "phosphorus", "p",
    "sodium", "na",
    "potassium", "k",
    "lithium", "li",
    "magnesium", "mg",
}

# Elements that indicate combustion byproducts (post-fire or active fire)
COMBUSTION_INDICATORS = {
    "carbon", "c",
    "nitrogen", "n",  # NOx from combustion
    "carbon monoxide", "co",
}


def _assess_fire_risk(elements: list[str]) -> dict:
    lower_elements = [e.lower().strip() for e in elements]

    flammable_found = [e for e in elements if e.lower().strip() in FLAMMABLE]
    combustion_found = [e for e in elements if e.lower().strip() in COMBUSTION_INDICATORS]

    has_flammable = len(flammable_found) > 0
    has_combustion = len(combustion_found) > 0

    if has_flammable and has_combustion:
        risk_level = "critical"
    elif has_flammable:
        risk_level = "high"
    elif has_combustion:
        risk_level = "medium"
    else:
        risk_level = "low"

    fire_risk = risk_level in ("high", "critical")

    reasons = []
    if flammable_found:
        reasons.append(f"Flammable: {', '.join(flammable_found)}")
    if combustion_found:
        reasons.append(f"Combustion indicators: {', '.join(combustion_found)}")
    if not reasons:
        reasons.append("No flammable gases or combustion byproducts detected")

    return {
        "fire_detected": fire_risk,
        "risk_level": risk_level,
        "flammable_gases": flammable_found,
        "combustion_indicators": combustion_found,
        "risk_reasons": reasons,
    }


def _call_gemini(image_bytes: bytes, prompt: str, mime_type: str = "image/jpeg") -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set")

    generativeai.configure(api_key=api_key)
    model = generativeai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content([
        {"mime_type": mime_type, "data": image_bytes},
        prompt,
    ])
    return response.text.strip()


def _mime_type(image_path: str) -> str:
    ext = Path(image_path).suffix.lower()
    return "image/png" if ext == ".png" else "image/jpeg"


def _parse_json(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return json.loads(text)


def analyze_image(image_path: str) -> dict:
    image_bytes = Path(image_path).read_bytes()
    timestamp = datetime.now(timezone.utc).isoformat()

    mime = _mime_type(image_path)
    try:
        raw = _call_gemini(image_bytes, PROMPT, mime)
        try:
            data = _parse_json(raw)
        except (json.JSONDecodeError, ValueError):
            raw = _call_gemini(image_bytes, RETRY_PROMPT, mime)
            try:
                data = _parse_json(raw)
            except (json.JSONDecodeError, ValueError) as e:
                result = {
                    "fire_detected": None,
                    "error": f"Gemini returned malformed JSON after retry: {e}",
                    "timestamp": timestamp,
                    "image_path": image_path,
                }
                _write_output(result)
                return result
    except Exception as e:
        result = {
            "fire_detected": None,
            "error": f"API call failed: {e}",
            "timestamp": timestamp,
            "image_path": image_path,
        }
        _write_output(result)
        return result

    # Gemini identifies elements; our code assesses fire risk
    elements = data.get("elements", [])
    observations = data.get("line_observations", [])
    gemini_confidence = data.get("confidence", 0.0)

    risk = _assess_fire_risk(elements)

    result = {
        "fire_detected": risk["fire_detected"],
        "gases_detected": elements,
        "confidence": gemini_confidence,
        "risk_level": risk["risk_level"],
        "indicators": observations + risk["risk_reasons"],
        "flammable_gases": risk["flammable_gases"],
        "combustion_indicators": risk["combustion_indicators"],
        "timestamp": timestamp,
        "image_path": image_path,
    }
    _write_output(result)
    return result


def _write_output(result: dict):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / "result.json"
    out_path.write_text(json.dumps(result, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Pyros Vision — spectral gas analysis for fire prediction")
    parser.add_argument("--image", required=True, help="Path to spectral emission line image")
    args = parser.parse_args()

    if not Path(args.image).exists():
        print(json.dumps({"error": f"Image not found: {args.image}"}))
        sys.exit(1)

    result = analyze_image(args.image)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
