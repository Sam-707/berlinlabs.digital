// Admin API for managing users and testing
require('dotenv').config();

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).send('OK');
    }
    
    // Simple admin authentication (improve this for production)
    const adminKey = req.headers.authorization;
    if (adminKey !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        if (req.method === 'POST') {
            const { action, phoneNumber, documentsCount, tier } = req.body;
            
            switch (action) {
                case 'grant_documents':
                    const count = parseInt(documentsCount) || 10;
                    
                    // Update or create user
                    const { data: user, error: userError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('phone_number', phoneNumber)
                        .single();
                    
                    if (userError && userError.code !== 'PGRST116') {
                        throw userError;
                    }
                    
                    if (user) {
                        // Update existing user
                        await supabase
                            .from('users')
                            .update({
                                documents_processed: 0,
                                subscription_tier: tier || 'premium',
                                last_activity: new Date().toISOString(),
                                credits: count
                            })
                            .eq('id', user.id);
                    } else {
                        // Create new user
                        await supabase
                            .from('users')
                            .insert([{
                                phone_number: phoneNumber,
                                whatsapp_number: phoneNumber,
                                subscription_tier: tier || 'premium',
                                documents_processed: 0,
                                is_active: true,
                                credits: count
                            }]);
                    }
                    
                    // Log admin action
                    await supabase
                        .from('document_logs')
                        .insert([{
                            whatsapp_number: phoneNumber,
                            document_type: 'admin_grant',
                            success: true,
                            created_at: new Date().toISOString(),
                            metadata: { 
                                admin_action: 'documents_granted',
                                count: count,
                                tier: tier || 'premium',
                                reason: 'admin_panel'
                            }
                        }]);
                    
                    return res.status(200).json({
                        success: true,
                        message: `Granted ${count} documents to ${phoneNumber}`,
                        phoneNumber,
                        documentsGranted: count,
                        tier: tier || 'premium'
                    });
                
                case 'reset_user':
                    await supabase
                        .from('users')
                        .update({
                            documents_processed: 0,
                            subscription_tier: 'free',
                            last_activity: new Date().toISOString()
                        })
                        .eq('phone_number', phoneNumber);
                    
                    return res.status(200).json({
                        success: true,
                        message: `Reset user ${phoneNumber} to free tier`
                    });
                
                case 'get_user':
                    const { data: userData, error: getUserError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('phone_number', phoneNumber)
                        .single();
                    
                    if (getUserError) throw getUserError;
                    
                    return res.status(200).json({
                        success: true,
                        user: userData
                    });
                
                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }
        }
        
        if (req.method === 'GET') {
            // Get all users for admin dashboard
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (usersError) throw usersError;
            
            return res.status(200).json({
                success: true,
                users: users,
                count: users.length
            });
        }
        
    } catch (error) {
        console.error('❌ Admin API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};