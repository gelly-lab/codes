# codes

## RPA capture (Python, 画像保存のみ)

`rpa_capture.py` はページ送りしながらスクリーンショットを保存します。
**OCR機能はありません。**

### Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install pyautogui pillow pynput mss
```

### Run

1. 書籍アプリ/ブラウザを開いて位置を固定
2. `pick_region.py` で `REGION` を取得
3. `rpa_capture.py` の `REGION` を更新
4. 実行

```bash
python rpa_capture.py
```

Outputs:
- `output/images/page_0001.png` ...

## REGIONを2クリックで取得

```bash
python pick_region.py
```

- 1回目クリック: 本文領域の左上
- 2回目クリック: 本文領域の右下
- 出力された `REGION = (left, top, width, height)` を `rpa_capture.py` に貼り付け

## マルチディスプレイの注意

- `rpa_capture.py` / `pick_region.py` は Windows で DPI aware を有効化して、座標ズレを減らしています。
- 左モニタは負のx座標になることがあります（例: 左 1920x1080 / 右 2560x1080 のとき、左画面はおおむね `-1920` 〜 `-1`）。
- `pick_region.py` は起動時に `virtual_screen=(left, top, width, height)` を表示します。
- `rpa_capture.py` は `REGION` が仮想デスクトップ範囲外ならエラーで停止します。

## トラブルシュート

- `python pick_region.py` 実行時に `Switch to the reader window...` が出る場合は、
  `pick_region.py` の中身が別ファイルになっている可能性があります。
- 正常な `pick_region.py` は OCR/Tesseract を使いません。

PowerShellで確認:

```powershell
Get-Content .\pick_region.py -TotalCount 20
```
