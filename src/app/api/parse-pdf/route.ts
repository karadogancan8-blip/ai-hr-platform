import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { sanitizeCvText } from "@/lib/cv-text";

export const runtime = "nodejs";
export const maxDuration = 30;

async function extractPdfText(buffer: Buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text ?? "";
  } catch {
    const { extractText } = await import("unpdf");
    const result = await extractText(new Uint8Array(buffer), { mergePages: true });
    const extracted = result.text;
    return Array.isArray(extracted) ? extracted.join("\n") : String(extracted ?? "");
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ text: "", error: "file required" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = sanitizeCvText(await extractPdfText(buffer));
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: "", error: "parse-failed" });
  }
}
