const { getStore } = require('@netlify/blobs');

// Simple server-side password check using an env var.
// Set ADMIN_PASSWORD in Netlify site settings → Environment variables.
// Falls back to 'admin123' for initial setup (change it immediately!).
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

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Check admin password from header
  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const store = getStore('reviews');

    // Get ordered index
    let index = [];
    try {
      const raw = await store.get('__index__');
      if (raw) index = JSON.parse(raw);
    } catch (_) {}

    // Fetch each review in parallel
    const reviews = (
      await Promise.all(
        index.map(async (id) => {
          try {
            const raw = await store.get(String(id));
            return raw ? JSON.parse(raw) : null;
          } catch (_) {
            return null;
          }
        })
      )
    ).filter(Boolean);

    return { statusCode: 200, headers, body: JSON.stringify(reviews) };
  } catch (err) {
    console.error('get-reviews error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
