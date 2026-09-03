"use client";

import { createRoot } from "react-dom/client";
import { CandidatePDFReport, type CandidatePDFReportProps } from "@/components/reports/CandidatePDFReport";
import { exportElementToPdf } from "@/lib/pdf-report";

export async function downloadCandidatePdf(
  props: CandidatePDFReportProps & { fileName?: string },
) {
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:0;top:0;width:794px;background:#ffffff;z-index:0;opacity:0.02;pointer-events:none;";
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    await new Promise<void>((resolve) => {
      root.render(<CandidatePDFReport {...props} useSafeLogo />);
      window.setTimeout(resolve, 80);
    });

    const article = host.querySelector("article");
    if (!(article instanceof HTMLElement)) {
      throw new Error("PDF şablonu hazırlanamadı.");
    }

    await exportElementToPdf(article, props.fileName ?? `${props.resume.name}-executive-rapor`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF indirilemedi.";
    throw new Error(message);
  } finally {
    root.unmount();
    host.remove();
  }
}
