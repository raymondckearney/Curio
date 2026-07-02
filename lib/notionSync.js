const NOTION_DB_ID = 'de84f105-7ff5-4452-b19d-d8cdfb60b575';

function notionHeaders() {
  return {
    'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
}

async function findContactByEmail(email) {
  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({
      filter: { property: 'Email', email: { equals: email } },
      page_size: 1,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] || null;
}

export async function syncContactToNotion({ name, email, source }) {
  if (!process.env.NOTION_API_KEY) return;
  const dateStr = new Date().toISOString().slice(0, 10);
  const note = `Account created ${dateStr} via ${source}`;
  const isPurchase = source.includes('purchase') || source.includes('invite');

  try {
    const existing = await findContactByEmail(email);

    if (existing) {
      const currentNotes = existing.properties?.Notes?.rich_text?.[0]?.plain_text || '';
      const updates = {
        Notes: { rich_text: [{ text: { content: `${currentNotes}${currentNotes ? '\n' : ''}${note}`.slice(0, 2000) } }] },
      };
      if (isPurchase) {
        updates.Type = { select: { name: 'Client' } };
      }
      await fetch(`https://api.notion.com/v1/pages/${existing.id}`, {
        method: 'PATCH',
        headers: notionHeaders(),
        body: JSON.stringify({ properties: updates }),
      });
    } else {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders(),
        body: JSON.stringify({
          parent: { database_id: NOTION_DB_ID },
          properties: {
            'Full Name': { title: [{ text: { content: name || '' } }] },
            'Email': { email },
            'Type': { select: { name: isPurchase ? 'Client' : 'Prospect' } },
            'Assessment Status': { select: { name: 'Not Sent' } },
            'Notes': { rich_text: [{ text: { content: note } }] },
          },
        }),
      });
    }
  } catch (err) {
    console.error('[notionSync] failed:', err.message);
  }
}
