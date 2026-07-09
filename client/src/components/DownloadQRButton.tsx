import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";

export function DownloadQRButton({ url, label }: { url: string; label: string }) {
  const handleDownload = () => {
    const source = document.getElementById(`qr-canvas-${label}`) as HTMLCanvasElement | null;
    if (!source) return;

    const out = document.createElement("canvas");
    out.width = 400;
    out.height = 440;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 440);
    ctx.drawImage(source, 0, 0, 400, 400);
    ctx.fillStyle = "#333";
    ctx.font = "14px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(url.length > 35 ? url.slice(0, 32) + "..." : url, 200, 425);

    out.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${label.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  };

  return (
    <>
      <div className="absolute left-[-9999px] top-0" aria-hidden="true">
        <QRCodeCanvas id={`qr-canvas-${label}`} value={url} size={400} />
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
        data-testid={`download-qr-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <Download className="w-3.5 h-3.5" /> Download
      </button>
    </>
  );
}
