// Force a real download of a (possibly cross-origin, signed) file URL.
// Falls back to opening the URL in a new tab if the blob fetch is blocked.
export async function downloadFile(url, filename = "download") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objUrl), 1500);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default downloadFile;
