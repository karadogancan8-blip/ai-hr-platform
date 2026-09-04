import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function downloadElementPdf(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const heightMm = (canvas.height * maxW) / canvas.width;
  const widthMm = heightMm > maxH ? (canvas.width * maxH) / canvas.height : maxW;
  const drawH = heightMm > maxH ? maxH : heightMm;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, widthMm, drawH);
  pdf.save(filename);
}
