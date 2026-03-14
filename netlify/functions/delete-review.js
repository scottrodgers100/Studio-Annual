const { getStore } = require('@netlify/blobs');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { id } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id' }) };

    const store = getStore('reviews');
    await store.delete(String(id));

    // Remove from index
    let index = [];
    try {
      const raw = await store.get('__index__');
      if (raw) index = JSON.parse(raw);
    } catch (_) {}
    const newIndex = index.filter(i => String(i) !== String(id));
    await store.set('__index__', JSON.stringify(newIndex));

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('delete-review error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
