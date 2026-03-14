const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const review = JSON.parse(event.body);
    if (!review || !review.id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid review data' }) };
    }

    const store = getStore('reviews');

    // Save individual review by its ID
    await store.set(String(review.id), JSON.stringify(review));

    // Update the index list of review IDs
    let index = [];
    try {
      const raw = await store.get('__index__');
      if (raw) index = JSON.parse(raw);
    } catch (_) {}

    if (!index.includes(review.id)) {
      index.unshift(review.id); // newest first
      await store.set('__index__', JSON.stringify(index));
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('save-review error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
