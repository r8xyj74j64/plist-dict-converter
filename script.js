function readPlistFile(callback) {
    const fileInput = document.getElementById("plistFile");
    const file = fileInput.files[0];
    if (!file) {
        alert("plistファイルを選択してください");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const data = plist.parse(text);
        callback(data);
    };
    reader.readAsText(file);
}

function convertCSV() {
    readPlistFile((data) => {
        let lines = ["shortcut,phrase"];

        data.forEach(entry => {
            const shortcut = entry.shortcut || "";
            const phrase = entry.phrase || "";
            lines.push(`${shortcut},${phrase}`);
        });

        download("dictionary.csv", lines.join("\n"));
    });
}

function convertGboard() {

    readPlistFile((data) => {
        let lines = [
            "# Gboard Dictionary version:2",
            "# Gboard Dictionary format:shortcut\tword\tlanguage_tag\tpos_tag"
        ];

        data.forEach(entry => {
            const shortcut = entry.shortcut || "";
            const phrase = entry.phrase || "";
            lines.push(`${shortcut}\t${phrase}\tja-JP`);
        });

        const zip = new JSZip();
        zip.file("dictionary.txt", lines.join("\n"));

        zip.generateAsync({ type: "blob" }).then(function(content) {
            downloadBlob("gboard_dictionary.zip", content);
        });
    });
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
