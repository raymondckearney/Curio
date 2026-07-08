const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

function headers(extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    ...extra,
  };
}

export async function createSignedUrl(bucket, path, expiresInSeconds = 60) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ expiresIn: expiresInSeconds }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return `${SUPABASE_URL}/storage/v1${data.signedURL}`;
}

export async function uploadObject(bucket, path, buffer, contentType = 'application/pdf') {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': contentType, 'x-upsert': 'true' }),
    body: buffer,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
