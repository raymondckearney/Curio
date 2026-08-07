// Logs each native MindPrint™ Assessment submission to the "Mindprint™ Quiz
// Responses" Notion database. Independent from lib/notion.js — same
// raw-fetch API convention this codebase already uses for Notion, but a
// separate database and a separate concern (that file's writes are about
// contact/engagement/follow-up tracking, not quiz responses).
//
// Database schema (as configured in Notion): Name (title), Email (email),
// Company (text), Current Role (text), Why Score / What Score / How Score
// (number). The database ID must be shared with the integration behind
// NOTION_API_KEY in Notion (••• menu on the database → Connections) or
// every write here will fail with a 404/403 even with a valid key.

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const QUIZ_RESPONSES_DB = '34f0f9d7-599d-802c-920f-d471ec9e70e3';

function title(text) {
  return { title: [{ text: { content: String(text).slice(0, 2000) } }] };
}

function richText(text) {
  return { rich_text: [{ text: { content: String(text).slice(0, 2000) } }] };
}

function emailProp(value) {
  return { email: value ? String(value) : null };
}

function numberProp(value) {
  return { number: typeof value === 'number' ? value : null };
}

export async function logQuizResponseToNotion({ name, email, company, role, whyScore, whatScore, howScore }) {
  if (!process.env.NOTION_API_KEY) return;

  const res = await fetch(`${NOTION_API}/pages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: QUIZ_RESPONSES_DB },
      properties: {
        'Name': title(name),
        'Email': emailProp(email),
        'Company': richText(company),
        'Current Role': richText(role),
        'Why Score': numberProp(whyScore),
        'What Score': numberProp(whatScore),
        'How Score': numberProp(howScore),
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion create page failed (${res.status}): ${text}`);
  }
}
