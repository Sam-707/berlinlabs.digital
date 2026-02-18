// BERLINLABS.DIGITAL - Contact Form Endpoint
// Vercel serverless function for contact form submissions
// Stores leads in Supabase with service role authentication

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
    const { name, email, inquiryType, message } = req.body;

    // Validation: Check required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validation: Inquiry type (optional but must be valid if provided)
    const validInquiryTypes = ['Pilot Program', 'Advisory', 'Experiment Feedback', 'General Inquiry'];
    if (inquiryType && !validInquiryTypes.includes(inquiryType)) {
      return res.status(400).json({ error: 'Invalid inquiry type' });
    }

    // Insert lead into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        lead_type: 'contact',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        inquiry_type: inquiryType || 'General Inquiry',
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
      message: 'Contact form submitted successfully'
    });

  } catch (error) {
    // Handle unexpected errors
    console.error('Contact API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
