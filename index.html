const https = require('https');

const JSONBIN_KEY = process.env.JSONBIN_MASTER_KEY;
const JSONBIN_ID = process.env.JSONBIN_BIN_ID;
const ADMIN_PW = process.env.ADMIN_PASSWORD || 'admin123';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PW) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const records = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.jsonbin.io',
        path: `/v3/b/${JSONBIN_ID}/latest`,
        method: 'GET',
        headers: {
          'X-Master-Key': JSONBIN_KEY,
          'X-Bin-Versioning': 'false',
        },
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.record || []);
          } catch(e) {
            resolve([]);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    return { statusCode: 200, headers, body: JSON.stringify(records) };
  } catch (err) {
    console.error('get-reviews error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
