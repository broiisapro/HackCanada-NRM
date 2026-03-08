import os
import shutil
import time
import urllib.request
import urllib.error
import json
from pathlib import Path

from dotenv import load_dotenv
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from vision import analyze_image

load_dotenv()

INPUT_DIR = Path(__file__).parent / "input"
PROCESSED_DIR = INPUT_DIR / "processed"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}

WEB_API_URL = os.environ.get("WEB_API_URL", "http://localhost:3000")


def _post_result(result: dict) -> None:
    url = f"{WEB_API_URL.rstrip('/')}/api/ingest"
    body = json.dumps(result).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"[pyros-vision] Posted result to web → HTTP {resp.status}")
    except urllib.error.URLError as e:
        print(f"[pyros-vision] Warning: could not reach web API at {url}: {e.reason}")


class ImageHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return

        path = Path(event.src_path)
        if path.suffix.lower() not in IMAGE_SUFFIXES:
            return

        # Brief delay to ensure the file is fully written
        time.sleep(0.5)

        print(f"[pyros-vision] New image detected: {path.name}")
        try:
            result = analyze_image(str(path))
            print(f"[pyros-vision] Result: fire_detected={result.get('fire_detected')}, "
                  f"risk_level={result.get('risk_level')}, confidence={result.get('confidence')}")
            _post_result(result)
        except Exception as e:
            print(f"[pyros-vision] Error processing {path.name}: {e}")
            return

        dest = PROCESSED_DIR / path.name
        shutil.move(str(path), str(dest))
        print(f"[pyros-vision] Moved to processed/: {path.name}")


def main():
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[pyros-vision] Watching {INPUT_DIR} for new JPEG images... (Ctrl+C to stop)")

    handler = ImageHandler()
    observer = Observer()
    observer.schedule(handler, str(INPUT_DIR), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()
    print("[pyros-vision] Stopped.")


if __name__ == "__main__":
    main()
