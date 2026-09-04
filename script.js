/* ==========================================================
   対応形式: plist（iOSユーザー辞書） / CSV / Gboard辞書（txt, zip）
   共通の内部表現: [{ shortcut, phrase }, ...]
   ========================================================== */

function detectTypeFromName(filename) {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".plist")) return "plist";
    if (lower.endsWith(".csv")) return "csv";
    if (lower.endsWith(".txt")) return "gboard";
    return null;
}

/* ---------------- パース処理 ---------------- */

function parsePlistText(text) {
    const data = plist.parse(text);
    if (!Array.isArray(data)) {
        throw new Error("plistの構造が配列形式ではありません（辞書エントリの配列を想定しています）");
    }
    return data.map(entry => ({
        shortcut: entry.shortcut || "",
        phrase: entry.phrase || ""
    }));
}

function parseCsvLine(line) {
    // シンプルなクォート対応CSVパーサ（1行分）
    const fields = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
            if (char === '"') {
                if (line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ",") {
                fields.push(current);
                current = "";
            } else {
                current += char;
            }
        }
    }
    fields.push(current);
    return fields;
}

function parseCsvText(text) {
    const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim() !== "");
    if (lines.length === 0) return [];

    let startIndex = 0;
    const firstFields = parseCsvLine(lines[0]).map(f => f.trim().toLowerCase());
    // ヘッダー行（shortcut,phrase もしくは phrase,shortcut）ならスキップ
    if (firstFields.includes("shortcut") || firstFields.includes("phrase")) {
        startIndex = 1;
    }

    const shortcutIdx = firstFields.indexOf("shortcut");
    const phraseIdx = firstFields.indexOf("phrase");
    const useHeaderOrder = startIndex === 1 && shortcutIdx !== -1 && phraseIdx !== -1;

    const records = [];
    for (let i = startIndex; i < lines.length; i++) {
        const fields = parseCsvLine(lines[i]);
        if (fields.length < 2) continue;

        let shortcut, phrase;
        if (useHeaderOrder) {
            shortcut = fields[shortcutIdx] || "";
            phrase = fields[phraseIdx] || "";
        } else {
            // デフォルト列順: shortcut,phrase
            shortcut = fields[0] || "";
            phrase = fields[1] || "";
        }
        records.push({ shortcut: shortcut.trim(), phrase: phrase.trim() });
    }
    return records;
}

function parseGboardText(text) {
    const lines = text.split(/\r\n|\n|\r/);
    const records = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "" || trimmed.startsWith("#")) continue;

        const cols = line.split("\t");
        if (cols.length < 2) continue;

        const shortcut = (cols[0] || "").trim();
        const phrase = (cols[1] || "").trim();
        records.push({ shortcut, phrase });
    }
    return records;
}

function parseByType(type, text) {
    if (type === "plist") return parsePlistText(text);
    if (type === "csv") return parseCsvText(text);
    if (type === "gboard") return parseGboardText(text);
    throw new Error("未対応の入力形式です");
}

/* ---------------- 出力生成処理 ---------------- */

function buildPlistText(records) {
    const plistData = records.map(r => ({
        phrase: r.phrase || "",
        shortcut: r.shortcut || ""
    }));
    return plist.build(plistData);
}

function csvEscapeField(field) {
    const str = String(field ?? "");
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function buildCsvText(records) {
    const lines = ["shortcut,phrase"];
    records.forEach(r => {
        lines.push(`${csvEscapeField(r.shortcut)},${csvEscapeField(r.phrase)}`);
    });
    return lines.join("\n");
}

function buildGboardText(records) {
    const lines = [
        "# Gboard Dictionary version:2",
        "# Gboard Dictionary format:shortcut\tword\tlanguage_tag\tpos_tag"
    ];
    records.forEach(r => {
        lines.push(`${r.shortcut || ""}\t${r.phrase || ""}\tja-JP`);
    });
    return lines.join("\n");
}

/* ---------------- ファイル入出力 ---------------- */

function readSelectedFile() {
    const fileInput = document.getElementById("dictFile");
    const file = fileInput.files[0];
    if (!file) {
        throw new Error("ファイルを選択してください");
    }
    const type = detectTypeFromName(file.name);
    if (!type) {
        throw new Error("対応していないファイル形式です（.plist / .csv / .txt のいずれかを選択してください）");
    }
    return { file, type };
}

function download(filename, text) {
    const element = document.createElement("a");
    element.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    element.download = filename;
    element.click();
}

function downloadBlob(filename, blob) {
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    element.click();
}

function getSelectedOutputFormat() {
    const radios = document.getElementsByName("outputFormat");
    for (const radio of radios) {
        if (radio.checked) return radio.value;
    }
    return "plist";
}

function showError(message) {
    document.getElementById("errorMsg").textContent = message || "";
}

/* ---------------- メイン変換処理 ---------------- */

function convert() {
    showError("");

    let file, inputType;
    try {
        ({ file, type: inputType } = readSelectedFile());
    } catch (err) {
        showError(err.message);
        return;
    }

    const outputType = getSelectedOutputFormat();

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const text = e.target.result;
            const records = parseByType(inputType, text);

            if (records.length === 0) {
                showError("辞書エントリが見つかりませんでした。入力ファイルの内容を確認してください。");
                return;
            }

            if (outputType === "plist") {
                const out = buildPlistText(records);
                download("dictionary.plist", out);
            } else if (outputType === "csv") {
                const out = buildCsvText(records);
                download("dictionary.csv", out);
            } else if (outputType === "gboard") {
                const out = buildGboardText(records);
                const zip = new JSZip();
                zip.file("dictionary.txt", out);
                zip.generateAsync({ type: "blob" }).then(content => {
                    downloadBlob("gboard_dictionary.zip", content);
                });
            }
        } catch (err) {
            showError("変換中にエラーが発生しました: " + err.message);
        }
    };
    reader.onerror = function () {
        showError("ファイルの読み込みに失敗しました");
    };
    reader.readAsText(file);
}

/* 選択したファイルの形式をリアルタイム表示 */
document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("dictFile");
    const detectedTypeEl = document.getElementById("detectedType");

    fileInput.addEventListener("change", () => {
        showError("");
        const file = fileInput.files[0];
        if (!file) {
            detectedTypeEl.textContent = "";
            return;
        }
        const type = detectTypeFromName(file.name);
        const labels = { plist: "plist（iOSユーザー辞書）", csv: "CSV", gboard: "Gboard辞書（txt）" };
        detectedTypeEl.textContent = type
            ? `検出した入力形式: ${labels[type]}`
            : "対応していない形式です";
    });
});
