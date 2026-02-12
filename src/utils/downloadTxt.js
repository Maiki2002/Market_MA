function toCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const raw = String(value);
  const escaped = raw.replace(/"/g, '""');
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

function collectHeaders(rows) {
  const headers = [];
  const seen = new Set();

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
        headers.push(key);
      }
    });
  });

  return headers;
}

export function downloadRowsAsTxt(filename, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    window.alert("No hay datos para descargar.");
    return;
  }

  const headers = collectHeaders(rows);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(",")),
  ];

  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
