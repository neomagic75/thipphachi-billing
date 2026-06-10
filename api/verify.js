const crypto = require('crypto');
const cookie = require('cookie');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionToken = cookies.tp_session;
  const authSecret = process.env.AUTH_SECRET;

  if (!sessionToken || !authSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [payload, signature] = sessionToken.split('.');
  const expectedSignature = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');

  if (signature === expectedSignature) {
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) {
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.status(200).json({ success: true, role: data.role });
  } else {
    return res.status(401).json({ error: 'Invalid signature' });
  }
};
