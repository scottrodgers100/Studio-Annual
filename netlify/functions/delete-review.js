const https = require('https');

const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function jsonbinGet() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${BIN_ID}/latest`,
      method: 'GET',
      headers: { 'X-Master-Key': MASTER_KEY, 'X-Bin-Versioning': 'false' },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({}); } });
    });
    req.on('error', reject);
    req.end();
  });
}

function jsonbinPut(body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${BIN_ID}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-Master-Key': MASTER_KEY,
        'X-Bin-Versioning': 'false',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({}); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'DELETE') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { id } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id' }) };

    const current = await jsonbinGet();
    const records = (current.record || []).filter(r => String(r.id) !== String(id));
    await jsonbinPut(records);

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('delete-review error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
