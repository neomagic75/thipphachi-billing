const { createClient } = require('@supabase/supabase-js');
const cookie = require('cookie');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const authSecret = process.env.AUTH_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { room } = req.query;
    
    if (!room) {
      // Return all units if no specific room is requested
      const { data, error } = await supabase
        .from('thipphachi_units')
        .select('*')
        .order('room_number');
      
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ units: data });
    }

    // Fetch specific room
    const { data, error } = await supabase
      .from('thipphachi_units')
      .select('*')
      .eq('room_number', room)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ unit: data || null });
  }

  if (req.method === 'POST') {
    // Check auth cookie for POST to ensure only the landlord can update the unit data
    const cookies = cookie.parse(req.headers.cookie || '');
    const authCookie = cookies.auth_token;
    
    if (authCookie !== authSecret) {
      return res.status(401).json({ error: 'Unauthorized: Admin PIN required to access unit data.' });
    }

    const { room_number, tenant_name, elec_last_reading, water_last_reading, base_rent } = req.body;
    
    if (!room_number) {
      return res.status(400).json({ error: 'room_number is required' });
    }

    const { data, error } = await supabase
      .from('thipphachi_units')
      .upsert({ 
        room_number,
        tenant_name,
        elec_last_reading,
        water_last_reading,
        base_rent,
        updated_at: new Date().toISOString()
      }, { onConflict: 'room_number' })
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, unit: data[0] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
