import { domToCanvas } from 'modern-screenshot';
import { jsPDF } from 'jspdf';

async function waitForPaint(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
  }
}

/**
 * Use modern-screenshot instead of html2canvas — Tailwind v4 emits `oklab()` / `oklch()`
 * in stylesheets, which html2canvas cannot parse (throws and can surface as broken captures).
 */
async function elementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  await waitForPaint();
  return domToCanvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    timeout: 45000,
  });
}

async function sheetToPdfBlob(element: HTMLElement): Promise<Blob> {
  const canvas = await elementToCanvas(element);
  const imgData = canvas.toDataURL('image/png', 0.92);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');
  return pdf.output('blob');
}

/** Save blob as file download (same blob instance can be uploaded first). */
export function triggerPdfBlobDownload(blob: Blob, downloadName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = downloadName.endsWith('.pdf') ? downloadName : `${downloadName}.pdf`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export async function downloadPrescriptionPdf(element: HTMLElement, downloadName: string): Promise<void> {
  const blob = await sheetToPdfBlob(element);
  triggerPdfBlobDownload(blob, downloadName);
}

export async function prescriptionPdfBlob(element: HTMLElement): Promise<Blob> {
  return sheetToPdfBlob(element);
}

export function printPrescription(element: HTMLElement): void {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1200');
  if (!w) {
    window.alert('Please allow pop-ups to print the prescription.');
    return;
  }
  w.document.write(`<!doctype html><html><head><title>Prescription</title>
    <style>
      @page { size: A4; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      img { width: 100%; height: auto; display: block; }
    </style></head><body></body></html>`);

  void elementToCanvas(element)
    .then((canvas) => {
      const dataUrl = canvas.toDataURL('image/png');
      const img = w.document.createElement('img');
      img.src = dataUrl;
      img.onload = () => {
        w?.focus();
        w?.print();
      };
      w.document.body.appendChild(img);
    })
    .catch(() => {
      w?.close();
      window.alert('Could not prepare print preview. Try Save PDF instead.');
    });
}
