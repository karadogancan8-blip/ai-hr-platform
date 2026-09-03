import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

export async function exportElementToPdf(element: HTMLElement, fileName: string) {
  try {
    element.querySelectorAll("img").forEach((image) => image.remove());

    const canvas = await withTimeout(
      html2canvas(element, {
        scale: 1.5,
        useCORS: false,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 1200,
        foreignObjectRendering: false,
        width: element.scrollWidth || 794,
        height: Math.max(element.scrollHeight, 400),
        windowWidth: 794,
        onclone(clonedDoc) {
          clonedDoc.querySelectorAll("img").forEach((image) => image.remove());
        },
      }),
      12000,
      "PDF oluşturma zaman aşımına uğradı. Sayfayı yenileyip tekrar deneyin.",
    );

    let dataUrl: string;
    try {
      dataUrl = canvas.toDataURL("image/png");
    } catch {
      throw new Error("PDF görseli oluşturulamadı (tarayıcı güvenlik kısıtı). Logoyu kaldırıp tekrar deneyin.");
    }

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * pageWidth) / canvas.width;

    let remaining = imageHeight;
    let offset = 0;
    pdf.addImage(dataUrl, "PNG", 0, offset, pageWidth, imageHeight);
    remaining -= pageHeight;
    while (remaining > 2) {
      offset -= pageHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, offset, pageWidth, imageHeight);
      remaining -= pageHeight;
    }

    const safeName = fileName.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-");
    pdf.save(safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF indirilemedi.";
    throw new Error(message);
  }
}
