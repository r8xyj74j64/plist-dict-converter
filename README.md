# plist-dict-converter

iOSユーザー辞書（.plist）を **CSV形式** または **Gboard辞書形式（dictionary.txt）** に変換する Webアプリです。  
ブラウザだけで動作します

## ✨ 機能

- `.plist` ファイルを読み込み
- `phrase`（単語）と `shortcut`（よみ）を抽出
- **CSV形式** に変換してダウンロード
- **Gboard辞書形式（dictionary.txt）** に変換
- Gboard形式は ZIP にまとめてダウンロード
- すべてブラウザ内で処理（サーバー不要）

## 📁 対応形式

### 入力
- iOSユーザー辞書（`.plist`）

### 出力
- CSV（`shortcut,phrase`）
- Gboard辞書形式（`dictionary.txt` を含む ZIP）

## 🛠 使用ライブラリ

- [plist.js](https://github.com/TooTallNate/plist.js)
- [JSZip](https://stuk.github.io/jszip/)

## 🚀 使い方

1. Webページを開く  
2. `.plist` ファイルを選択  
3. 「CSVに変換」または「Gboard形式に変換」をクリック  
4. 出力ファイルをダウンロード

## 📄 ライセンス

このプロジェクトは **MIT License** のもとで公開されています。  
自由に利用・改変・再配布できますが、著作権表示は保持してください。

