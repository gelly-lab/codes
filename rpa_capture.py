"""Simple RPA: page-turning and screenshot capture (no OCR)."""
from __future__ import annotations

import platform
import time
from pathlib import Path

import pyautogui
from mss import mss
from PIL import Image

OUTPUT_DIR = Path("output")
IMAGES_DIR = OUTPUT_DIR / "images"

# (left, top, width, height) in virtual-screen coordinates.
# Multi-display example: left monitor can have negative x.
REGION = (100, 200, 800, 900)

PAGES = 50
PAGE_KEY = "pagedown"
WAIT_SECONDS = 1.5


def enable_windows_dpi_awareness() -> None:
    """Align coordinate systems on Windows for multi-display + scaling setups."""
    if platform.system() != "Windows":
        return

    try:
        import ctypes

        user32 = ctypes.windll.user32
        # Per-monitor v2 (-4) is preferred on modern Windows.
        awareness_context = ctypes.c_void_p(-4)
        if not user32.SetProcessDpiAwarenessContext(awareness_context):
            user32.SetProcessDPIAware()
    except Exception:
        # Keep running even if API is unavailable.
        pass


def ensure_dirs() -> None:
    """Prepare output directories for images."""
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def check_region_inside_virtual_screen(sct: mss, region: tuple[int, int, int, int]) -> None:
    """Validate REGION against virtual desktop bounds."""
    left, top, width, height = region
    if width <= 0 or height <= 0:
        raise ValueError(f"REGION の width/height は正数が必要です: {region}")

    monitor = sct.monitors[0]  # full virtual screen
    v_left = monitor["left"]
    v_top = monitor["top"]
    v_right = v_left + monitor["width"]
    v_bottom = v_top + monitor["height"]

    r_right = left + width
    r_bottom = top + height

    if left < v_left or top < v_top or r_right > v_right or r_bottom > v_bottom:
        raise ValueError(
            "REGION が仮想デスクトップ範囲外です。"
            f"\nREGION={region}"
            f"\nvirtual_screen=({v_left}, {v_top}, {monitor['width']}, {monitor['height']})"
            "\nWindowsで拡大率を使っている場合は、pick_region.py と rpa_capture.py の両方を最新版に更新してください。"
        )


def capture_region(sct: mss, region: tuple[int, int, int, int]) -> Image.Image:
    """Capture with MSS for robust multi-display support."""
    left, top, width, height = region
    shot = sct.grab({"left": left, "top": top, "width": width, "height": height})
    return Image.frombytes("RGB", shot.size, shot.rgb)


def main() -> None:
    enable_windows_dpi_awareness()
    ensure_dirs()

    with mss() as sct:
        check_region_inside_virtual_screen(sct, REGION)

        print("Switch to the reader window. Starting in 3 seconds...")
        time.sleep(3)

        for index in range(1, PAGES + 1):
            pyautogui.press(PAGE_KEY)
            time.sleep(WAIT_SECONDS)

            screenshot = capture_region(sct, REGION)
            image_path = IMAGES_DIR / f"page_{index:04d}.png"
            screenshot.save(image_path)
            print(f"Captured page {index} -> {image_path}")


if __name__ == "__main__":
    main()
