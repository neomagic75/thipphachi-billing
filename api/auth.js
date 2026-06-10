const crypto = require('crypto');
const cookie = require('cookie');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pin } = req.body || {};
  const correctPin = process.env.THIPPHACHI_PIN;
  const authSecret = process.env.AUTH_SECRET;

  if (!correctPin || !authSecret) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (pin === correctPin) {
    // Generate signature
    const payload = JSON.stringify({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 24 * 30 }); // 30 days
    const signature = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');
    const sessionToken = `${payload}.${signature}`;

    // Set cookie
    res.setHeader('Set-Cookie', cookie.serialize('tp_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    }));

    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ error: 'Invalid PIN' });
  }
};
