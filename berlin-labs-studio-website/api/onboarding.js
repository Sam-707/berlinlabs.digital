// BERLINLABS.DIGITAL - Onboarding Form Endpoint
// Vercel serverless function for MenuFlows pilot applications
// Stores onboarding leads in Supabase with service role authentication

require('dotenv').config();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');

    // Initialize Supabase with service role key (server-side only)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Extract form data
    const { name, restaurantName, email, phone, location, message } = req.body;

    // Validation: Check required fields
    if (!name || !restaurantName || !email || !location || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validation: Phone format (optional but must be valid if provided)
    if (phone) {
      // Remove spaces, dashes, parentheses - just check if it looks like a phone number
      const phoneClean = phone.replace(/[\s\-\(\)]/g, '');
      if (phoneClean.length < 6 || !/^\+?[0-9]{6,15}$/.test(phoneClean)) {
        return res.status(400).json({ error: 'Invalid phone format' });
      }
    }

    // Insert lead into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        lead_type: 'onboarding',
        name: name.trim(),
        restaurant_name: restaurantName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        location: location.trim(),
        message: message.trim(),
        source_url: req.headers.referer || '',
        referrer: req.headers.referrer || '',
        user_agent: req.headers['user-agent'] || '',
        status: 'new'
      })
      .select()
      .single();

    // Handle Supabase errors
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to save lead' });
    }

    // Success response
    return res.status(200).json({
      success: true,
      leadId: data.id,
      message: 'Onboarding application submitted successfully'
    });

  } catch (error) {
    // Handle unexpected errors
    console.error('Onboarding API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
