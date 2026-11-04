import { z } from "zod";
import { draftSchema, parseImport, MAX_IMPORT_BYTES, type Draft } from "./notebook-data";

// Each JSON line is bounded before parsing. The complete backup has no aggregate
// limit; its size is proportional to the user's validated notebook records.
const MAX_LINE_BYTES = 512 * 1024;
const encoder = new TextEncoder();
const field = z.tuple([z.literal("field"), z.string().max(80), z.string().max(10000)]);
const observation = z.tuple([z.literal("observation"), draftSchema.shape.observations.element]);
const metadata = z.object({ schemaVersion: draftSchema.shape.schemaVersion, id: draftSchema.shape.id, type: draftSchema.shape.type, createdAt: draftSchema.shape.createdAt, updatedAt: draftSchema.shape.updatedAt, contentVersion: draftSchema.shape.contentVersion, title: draftSchema.shape.title });
const recordStart = z.tuple([z.literal("record"), metadata]);
const header = '["observatory-notebook",2]';
const invalid = () => new Error("Unsupported, incomplete or invalid notebook file. Nothing has been changed.");

/** Validate every frame and every record before the caller offers any write. */
export async function parseBackup(file: Blob): Promise<Draft[]> {
  // Legacy files retain their original strict aggregate limits.
  const prefix = await file.slice(0, 64).text();
  if (!prefix.startsWith(header + "\n")) {
    if (file.size > MAX_IMPORT_BYTES) throw new Error("Legacy JSON exceeds the 2 MB limit. Nothing changed.");
    return parseImport(await file.text());
  }
  const reader = file.stream().getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let buffer = "", started = false, completed = false;
  let current: { meta: z.infer<typeof metadata>; fields: Record<string, string>; observations: Draft["observations"] } | null = null;
  const records: Draft[] = [], ids = new Set<string>();
  const line = (text: string) => {
    if (encoder.encode(text).byteLength > MAX_LINE_BYTES) throw invalid();
    let frame: unknown;
    try { frame = JSON.parse(text); } catch { throw invalid(); }
    if (!started) { if (text !== header) throw invalid(); started = true; return; }
    if (completed || !Array.isArray(frame)) throw invalid();
    if (frame[0] === "record") {
      if (current) throw invalid();
      const parsed = recordStart.safeParse(frame); if (!parsed.success) throw invalid();
      current = { meta: parsed.data[1], fields: Object.create(null), observations: [] };
    } else if (frame[0] === "field") {
      const parsed = field.safeParse(frame); if (!current || !parsed.success || Object.hasOwn(current.fields, parsed.data[1])) throw invalid();
      current.fields[parsed.data[1]] = parsed.data[2];
    } else if (frame[0] === "observation") {
      const parsed = observation.safeParse(frame); if (!current || !parsed.success || current.observations.length >= 200) throw invalid();
      current.observations.push(parsed.data[1]);
    } else if (frame[0] === "end") {
      if (!current || frame.length !== 1) throw invalid();
      const parsed = draftSchema.safeParse({ ...current.meta, fields: current.fields, observations: current.observations });
      if (!parsed.success || ids.has(parsed.data.id)) throw invalid();
      records.push(parsed.data); ids.add(parsed.data.id); current = null;
    } else if (frame[0] === "complete") {
      if (current || frame.length !== 2 || frame[1] !== records.length) throw invalid();
      completed = true;
    } else throw invalid();
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let end: number;
      while ((end = buffer.indexOf("\n")) !== -1) { line(buffer.slice(0, end)); buffer = buffer.slice(end + 1); }
      if (encoder.encode(buffer).byteLength > MAX_LINE_BYTES) throw invalid();
      if (done) break;
    }
    if (buffer || !completed) throw invalid();
    return records;
  } catch { throw invalid(); } finally { reader.releaseLock(); }
}
