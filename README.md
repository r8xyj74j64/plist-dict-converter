# plist-dict-converter

iOSユーザー辞書（.plist）・CSV・Gboard辞書形式（dictionary.txt）を
**相互に変換**できるWebアプリです。
ブラウザだけで動作します。

## ✨ 機能

- `.plist` / `.csv` / `.txt`（Gboard辞書）のいずれかを読み込み
- ファイル拡張子から入力形式を自動判定
- `shortcut`（よみ）と `phrase`（単語）を抽出
- 出力形式を選んで **plist・CSV・Gboard辞書のどれにでも変換可能**
- Gboard形式は ZIP にまとめてダウンロード
- すべてブラウザ内で処理（サーバー不要）

## 📁 対応形式（すべて相互変換可能）

| 形式 | 入力 | 出力 |
|---|---|---|
| iOSユーザー辞書（`.plist`） | ✅ | ✅ |
| CSV（`shortcut,phrase`） | ✅ | ✅ |
| Gboard辞書形式（`dictionary.txt` を含む ZIP） | ✅（`.txt`単体） | ✅（ZIP） |

## 🛠 使用ライブラリ

- [plist.js](https://github.com/TooTallNate/plist.js)
- [JSZip](https://stuk.github.io/jszip/)

## 🚀 使い方

1. Webページを開く
2. 変換したいファイル（`.plist` / `.csv` / `.txt`）を選択
3. 検出された入力形式が表示される
4. 変換後の形式（plist / CSV / Gboard）を選択
5. 「変換してダウンロード」をクリック
6. 出力ファイルをダウンロード

## 📄 ライセンス

このプロジェクトは **MIT License** のもとで公開されています。
自由に利用・改変・再配布できますが、著作権表示は保持してください。
