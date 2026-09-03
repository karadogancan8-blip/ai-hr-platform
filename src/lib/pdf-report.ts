import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportElementToPdf(element: HTMLElement, fileName: string) {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
    ),
  );

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const image = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;

  let remaining = imageHeight;
  let offset = 0;

  pdf.addImage(image, "PNG", 0, offset, pageWidth, imageHeight);
  remaining -= pageHeight;

  while (remaining > 2) {
    offset -= pageHeight;
    pdf.addPage();
    pdf.addImage(image, "PNG", 0, offset, pageWidth, imageHeight);
    remaining -= pageHeight;
  }

  const safeName = fileName.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-");
  pdf.save(safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`);
}
