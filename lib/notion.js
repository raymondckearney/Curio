const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

const CONTACTS_DB    = 'de84f105-7ff5-4452-b19d-d8cdfb60b575';
const ENGAGEMENTS_DB = 'a82b74df-8c5f-4228-a97b-147bbcefcf7b';
const FOLLOWUPS_DB   = '38a6d23f-ef72-4bdc-ae34-04d6df203060';

function headers() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

async function notionFetch(path, method = 'GET', body) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function queryDB(dbId, filter) {
  const data = await notionFetch(`/databases/${dbId}/query`, 'POST', {
    filter,
    page_size: 1,
  });
  return data.results || [];
}

async function updatePage(pageId, properties) {
  return notionFetch(`/pages/${pageId}`, 'PATCH', { properties });
}

async function createPage(dbId, properties) {
  return notionFetch('/pages', 'POST', {
    parent: { database_id: dbId },
    properties,
  });
}

function dateStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().split('T')[0];
}

function title(text) {
  return { title: [{ text: { content: String(text) } }] };
}

function richText(text) {
  return { rich_text: [{ text: { content: String(text) } }] };
}

function select(name) {
  return { select: { name: String(name) } };
}

function date(isoDate) {
  return { date: { start: isoDate } };
}

// ─── Step 1: Update Contact ───────────────────────────────────────────────────
async function updateContact({ email, profileType }) {
  if (!email) return null;
  const pages = await queryDB(CONTACTS_DB, {
    property: 'Email',
    email: { equals: email },
  });
  if (!pages.length) {
    console.warn(`[notion] No contact found for email: ${email}`);
    return null;
  }
  await updatePage(pages[0].id, {
    'MindPrint Profile': select(profileType),
    'Assessment Status': select('Completed'),
    'Last Contacted':    date(dateStr(0)),
  });
  return pages[0];
}

// ─── Step 2: Increment Engagement Completed Assessments ──────────────────────
async function incrementEngagement(engagementId) {
  if (!engagementId) return { engagementPage: null, complete: false, company: null };
  const pages = await queryDB(ENGAGEMENTS_DB, {
    property: 'Engagement ID',
    rich_text: { equals: engagementId },
  });
  if (!pages.length) {
    console.warn(`[notion] No engagement found for ID: ${engagementId}`);
    return { engagementPage: null, complete: false, company: null };
  }
  const page = pages[0];
  const props = page.properties;
  const company    = props['Company']?.rich_text?.[0]?.plain_text || null;
  const current    = props['Completed Assessments']?.number || 0;
  const total      = props['Participants']?.number || 0;
  const newCount   = current + 1;
  await updatePage(page.id, { 'Completed Assessments': { number: newCount } });
  return { engagementPage: page, complete: total > 0 && newCount >= total, company };
}

// ─── Step 3a: Standard per-assessment follow-up ───────────────────────────────
async function createCheckInTask({ participantName, company }) {
  return createPage(FOLLOWUPS_DB, {
    'Task':     title(`Review MindPrint result — ${participantName}`),
    'Contact':  richText(participantName),
    ...(company ? { 'Company': richText(company) } : {}),
    'Type':     select('Check In'),
    'Priority': select('Medium'),
    'Status':   select('To Do'),
    'Due Date': date(dateStr(2)),
  });
}

// ─── Step 3b: Engagement-complete follow-up (conditional) ────────────────────
async function createEngagementCompleteTask({ engagementId }) {
  return createPage(FOLLOWUPS_DB, {
    'Task':     title(`All assessments complete — prepare session materials for ${engagementId}`),
    'Priority': select('High'),
    'Status':   select('To Do'),
    'Type':     select('Other'),
    'Due Date': date(dateStr(0)),
  });
}

// ─── Step 4: Post-generate follow-up ─────────────────────────────────────────
async function createSendLinksTask({ engagementId, participantCount }) {
  return createPage(FOLLOWUPS_DB, {
    'Task':     title(`Send assessment links — ${engagementId} (${participantCount} participant${participantCount !== 1 ? 's' : ''})`),
    'Priority': select('High'),
    'Status':   select('To Do'),
    'Type':     select('Send Assessment Link'),
    'Due Date': date(dateStr(0)),
  });
}

// ─── Orchestrator called from consume ────────────────────────────────────────
export async function syncAssessmentToNotion({ row, result_payload }) {
  if (!process.env.NOTION_API_KEY) return;

  const name          = row.name || 'Unknown';
  const email         = row.email || null;
  const engagementId  = row.engagement_id || null;
  const company       = row.company || null;
  const profileType   = (typeof result_payload === 'object' ? result_payload?.type : result_payload) || 'Unknown';

  let resolvedCompany = company;

  await Promise.allSettled([
    // Step 1
    updateContact({ email, profileType }).catch(err =>
      console.error('[notion] step1 contact update failed:', err)
    ),

    // Steps 2 + 3a + 3b chained (need engagement result before 3b)
    (async () => {
      const { complete, company: engCompany } = await incrementEngagement(engagementId).catch(err => {
        console.error('[notion] step2 engagement update failed:', err);
        return { complete: false, company: null };
      });

      if (engCompany) resolvedCompany = engCompany;

      await createCheckInTask({ participantName: name, company: resolvedCompany }).catch(err =>
        console.error('[notion] step3a check-in task failed:', err)
      );

      if (complete) {
        await createEngagementCompleteTask({ engagementId }).catch(err =>
          console.error('[notion] step3b engagement-complete task failed:', err)
        );
      }
    })(),
  ]);
}

export async function setContactLinkSent({ email }) {
  if (!process.env.NOTION_API_KEY) return null;
  if (!email) return null;
  const pages = await queryDB(CONTACTS_DB, {
    property: 'Email',
    email: { equals: email },
  });
  if (!pages.length) {
    console.warn(`[notion] No contact found for email: ${email}`);
    return null;
  }
  await updatePage(pages[0].id, {
    'Assessment Status': select('Link Sent'),
  });
  return pages[0];
}

export { createSendLinksTask };
