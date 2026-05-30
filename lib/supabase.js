const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

function headers(extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export async function dbGet(table, filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).map(([k, v]) => [k, `eq.${v}`])
  );
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function dbInsert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function dbPatch(table, filters = {}, data = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).map(([k, v]) => [k, `eq.${v}`])
  );
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
