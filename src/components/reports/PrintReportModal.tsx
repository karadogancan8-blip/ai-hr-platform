"use client";

import { useEffect } from "react";
import { Printer, X } from "lucide-react";
import { CandidatePDFReport, type CandidatePDFReportProps } from "@/components/reports/CandidatePDFReport";

type PrintReportModalProps = CandidatePDFReportProps & {
  open: boolean;
  onClose: () => void;
};

export function PrintReportModal({ open, onClose, ...report }: PrintReportModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="print-overlay fixed inset-0 z-[80] flex flex-col bg-slate-900/50">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body { background: #ffffff !important; }
          .print-chrome { display: none !important; }
          .print-overlay {
            position: static !important;
            inset: auto !important;
            background: #ffffff !important;
            display: block !important;
            height: auto !important;
          }
          .print-scroll {
            overflow: visible !important;
            height: auto !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .print-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          body * { visibility: hidden; }
          #candidate-print-root, #candidate-print-root * { visibility: visible; }
          #candidate-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="print-chrome flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Yazdır / PDF</p>
          <p className="text-sm font-medium text-slate-800">
            {report.resume.name} · A4 executive rapor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744]"
          >
            <Printer className="h-4 w-4" />
            Yazdır / PDF olarak kaydet
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="print-scroll flex-1 overflow-y-auto bg-[#e8eef4] p-4 sm:p-8">
        <div className="print-sheet mx-auto w-[210mm] max-w-full overflow-hidden rounded-sm bg-white shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
          <CandidatePDFReport {...report} />
        </div>
        <p className="print-chrome mx-auto mt-4 max-w-xl text-center text-xs text-slate-600">
          Yazdır penceresinde hedef olarak “PDF olarak kaydet” veya “Microsoft Print to PDF” seçin.
        </p>
      </div>
    </div>
  );
}
