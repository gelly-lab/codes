"""クリック2点でREGION(left, top, width, height)を取得する補助スクリプト。"""
from __future__ import annotations

import platform
from dataclasses import dataclass

from mss import mss
from pynput import mouse


@dataclass
class Point:
    x: int
    y: int


points: list[Point] = []


def enable_windows_dpi_awareness() -> None:
    """Align coordinate systems on Windows for multi-display + scaling setups."""
    if platform.system() != "Windows":
        return

    try:
        import ctypes

        user32 = ctypes.windll.user32
        awareness_context = ctypes.c_void_p(-4)
        if not user32.SetProcessDpiAwarenessContext(awareness_context):
            user32.SetProcessDPIAware()
    except Exception:
        pass


def on_click(x: float, y: float, button: mouse.Button, pressed: bool) -> bool | None:
    """左クリックが押された瞬間だけ記録し、2点で終了する。"""
    if not pressed or button != mouse.Button.left:
        return None

    pt = Point(int(x), int(y))
    points.append(pt)
    index = len(points)
    label = "左上" if index == 1 else "右下"
    print(f"{index}/2 {label}: ({pt.x}, {pt.y})")

    if len(points) >= 2:
        return False
    return None


def to_region(p1: Point, p2: Point) -> tuple[int, int, int, int]:
    """クリック順が逆でも使えるように正規化する。"""
    left = min(p1.x, p2.x)
    top = min(p1.y, p2.y)
    width = abs(p2.x - p1.x)
    height = abs(p2.y - p1.y)
    return left, top, width, height


def main() -> None:
    enable_windows_dpi_awareness()

    print("[pick_region.py] REGION 取得モード")
    print("左クリックで2点を選択してください。")
    print("1点目: 左上 / 2点目: 右下（順番が逆でもOK）")

    with mss() as sct:
        monitor = sct.monitors[0]
        print(
            "virtual_screen="
            f"({monitor['left']}, {monitor['top']}, {monitor['width']}, {monitor['height']})"
        )

    with mouse.Listener(on_click=on_click) as listener:
        listener.join()

    if len(points) < 2:
        print("2点取得できませんでした。再実行してください。")
        return

    region = to_region(points[0], points[1])
    print("\n--- RESULT ---")
    print(f"REGION = {region}")
    print("rpa_capture.py の REGION にそのまま貼り付けできます。")


if __name__ == "__main__":
    main()
