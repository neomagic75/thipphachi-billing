const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const cookie = require('cookie');

// Middleware to check authentication
function isAuthenticated(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionToken = cookies.tp_session;
  const authSecret = process.env.AUTH_SECRET;

  if (!sessionToken || !authSecret) return false;

  const [payload, signature] = sessionToken.split('.');
  if (!payload || !signature) return false;

  const expectedSignature = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');

  if (signature !== expectedSignature) return false;

  const data = JSON.parse(payload);
  if (data.exp < Date.now()) return false;

  return true;
}

module.exports = async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Bypass RLS

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database misconfiguration' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (req.method === 'POST') {
    const { room_num, tenant_name, invoice_type, total_amount, details } = req.body;
    
    const { data, error } = await supabase
      .from('thipphachi_invoices')
      .insert([{ room_num, tenant_name, invoice_type, total_amount, details }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true, data });
  } 
  else if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('thipphachi_invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true, invoices: data });
  } 
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};
