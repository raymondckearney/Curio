// Server-only. Turns an uploaded file into model input. PDFs go to the
// Messages API as a document block; DOCX text is pulled from the zip's
// word/document.xml with jszip (already a dependency, so no new package);
// TXT is decoded as UTF-8.
import JSZip from 'jszip';

// Vercel rejects request bodies over 4.5 MB, and base64 adds about a third,
// so 3 MB is the largest file that reliably fits.
export const MAX_FILE_BYTES = 3 * 1024 * 1024;
export const MAX_TEXT_CHARS = 150000;

export const byteLengthOfBase64 = b64 => Math.floor((String(b64).replace(/=+$/, '').length * 3) / 4);

function decodeXmlText(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

export async function docxToText(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const file = zip.file('word/document.xml');
  if (!file) throw new Error('This Word file has no readable document text.');
  const xml = await file.async('string');
  // One line per paragraph; tabs and line breaks inside a paragraph kept.
  return xml
    .split(/<\/w:p>/)
    .map(p => decodeXmlText(p.replace(/<w:tab\/>/g, '\t').replace(/<w:br[^>]*\/>/g, '\n').replace(/<[^>]+>/g, '')))
    .map(l => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Returns { blocks } (Messages API content blocks) or { error }.
export async function documentBlocks({ text, file }) {
  if (typeof text === 'string' && text.trim()) {
    return { blocks: [{ type: 'text', text: `WORK DOCUMENT (pasted text):\n"""\n${text.trim().slice(0, MAX_TEXT_CHARS)}\n"""` }] };
  }
  if (!file || typeof file.base64 !== 'string' || !file.base64) return { error: 'Paste the document text or choose a file.' };
  if (byteLengthOfBase64(file.base64) > MAX_FILE_BYTES) return { error: 'That file is over 3 MB. Paste the text instead, or upload a smaller file.' };
  const name = String(file.name || '').toLowerCase();
  const type = String(file.mediaType || '').toLowerCase();
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return { blocks: [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: file.base64 } }, { type: 'text', text: 'The attached PDF is the work document.' }] };
  }
  const buf = Buffer.from(file.base64, 'base64');
  if (name.endsWith('.docx') || type.includes('wordprocessingml')) {
    try {
      const t = await docxToText(buf);
      if (!t) return { error: 'That Word file has no text to read.' };
      return { blocks: [{ type: 'text', text: `WORK DOCUMENT (from ${file.name}):\n"""\n${t.slice(0, MAX_TEXT_CHARS)}\n"""` }] };
    } catch {
      return { error: 'That Word file could not be read. Save it as .docx or PDF, or paste the text.' };
    }
  }
  if (name.endsWith('.txt') || type.startsWith('text/')) {
    const t = buf.toString('utf8').trim();
    if (!t) return { error: 'That file is empty.' };
    return { blocks: [{ type: 'text', text: `WORK DOCUMENT (from ${file.name}):\n"""\n${t.slice(0, MAX_TEXT_CHARS)}\n"""` }] };
  }
  return { error: 'Upload a PDF, Word (.docx), or text file.' };
}
