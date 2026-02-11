// Database utility for user tracking and usage limits
const { createClient } = require('@supabase/supabase-js');
const { recordDatabaseQuery } = require('./performance-monitor');

let supabaseClient = null;

// Simple in-memory cache for user data (10 minute TTL)
const userCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

function getCachedUser(phoneNumber) {
    const cached = userCache.get(phoneNumber);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`📋 Using cached user data for ${phoneNumber}`);
        return cached.data;
    }
    return null;
}

function setCachedUser(phoneNumber, userData) {
    userCache.set(phoneNumber, {
        data: userData,
        timestamp: Date.now()
    });
    
    // Clean up expired cache entries every 100 cache sets
    if (userCache.size % 100 === 0) {
        const now = Date.now();
        for (const [key, value] of userCache.entries()) {
            if (now - value.timestamp > CACHE_TTL) {
                userCache.delete(key);
            }
        }
    }
}

function getSupabaseClient() {
    if (!supabaseClient) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.warn('⚠️ Supabase credentials not configured. Running without user tracking.');
            return null;
        }
        
        supabaseClient = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client initialized');
    }
    
    return supabaseClient;
}

/**
 * Get or create a user record by phone number
 * @param {string} phoneNumber - WhatsApp phone number (without whatsapp: prefix)
 * @returns {Object|null} User record or null if database not available
 */
async function getOrCreateUser(phoneNumber) {
    const client = getSupabaseClient();
    if (!client) return null;
    
    try {
        console.log(`🔍 Looking up user: ${phoneNumber}`);
        
        // First try to get existing user
        const { data: existingUser, error: fetchError } = await client
            .from('users')
            .select('*')
            .eq('phone_number', phoneNumber)
            .single();
            
        if (existingUser && !fetchError) {
            console.log('👤 Existing user found:', existingUser.id);
            
            // Update last active
            await client
                .from('users')
                .update({ last_active_at: new Date().toISOString() })
                .eq('id', existingUser.id);
                
            return existingUser;
        }
        
        // Create new user if not found
        console.log('👤 Creating new user');
        const { data: newUser, error: createError } = await client
            .from('users')
            .insert([{
                phone_number: phoneNumber,
                free_documents_used: 0,
                paid_documents_used: 0,
                total_credits: 1, // 1 free document
                last_active_at: new Date().toISOString()
            }])
            .select()
            .single();
            
        if (createError) {
            console.error('❌ Error creating user:', createError);
            return null;
        }
        
        console.log('✅ New user created:', newUser.id);
        return newUser;
        
    } catch (error) {
        console.error('❌ Database error in getOrCreateUser:', error);
        return null;
    }
}

/**
 * Check if user can analyze a document (has credits or free usage left)
 * Optimized version that combines user lookup and credit check in one operation
 * @param {string} phoneNumber - WhatsApp phone number
 * @returns {Object} { canAnalyze: boolean, isFree: boolean, remainingCredits: number, message?: string, user: Object }
 */
async function checkUserCanAnalyze(phoneNumber) {
    const client = getSupabaseClient();
    if (!client) {
        // If database not available, allow analysis but without tracking
        return { 
            canAnalyze: true, 
            isFree: true, 
            remainingCredits: 999,
            message: 'Database not configured - unlimited access',
            user: null
        };
    }
    
    try {
        console.log(`🔍 Checking user status: ${phoneNumber}`);
        
        // Check cache first
        const cachedUser = getCachedUser(phoneNumber);
        if (cachedUser) {
            // Record cache hit
            recordDatabaseQuery(0, true);
            // Calculate credits and determine status from cached data
            const usedDocuments = cachedUser.free_documents_used + cachedUser.paid_documents_used;
            const remainingCredits = cachedUser.total_credits - usedDocuments;
            
            // Check if user has free documents left
            if (cachedUser.free_documents_used < 1) {
                return {
                    canAnalyze: true,
                    isFree: true,
                    remainingCredits: cachedUser.total_credits,
                    message: 'Free document available (cached)',
                    user: cachedUser
                };
            }
            
            // Check if user has paid credits
            if (remainingCredits > 0) {
                return {
                    canAnalyze: true,
                    isFree: false,
                    remainingCredits: remainingCredits,
                    message: 'Paid credit available (cached)',
                    user: cachedUser
                };
            }
            
            // No credits left
            return {
                canAnalyze: false,
                isFree: false,
                remainingCredits: 0,
                message: 'No credits remaining - need to purchase more (cached)',
                user: cachedUser
            };
        }
        
        // Cache miss - fetch from database
        const dbStartTime = Date.now();
        const { data: existingUser, error: fetchError } = await client
            .from('users')
            .select('*')
            .eq('phone_number', phoneNumber)
            .single();
        recordDatabaseQuery(Date.now() - dbStartTime, false);
            
        let user = existingUser;
        
        if (!existingUser || fetchError) {
            // Create new user if not found
            console.log('👤 Creating new user with optimized query');
            const { data: newUser, error: createError } = await client
                .from('users')
                .insert([{
                    phone_number: phoneNumber,
                    free_documents_used: 0,
                    paid_documents_used: 0,
                    total_credits: 1, // 1 free document
                    last_active_at: new Date().toISOString()
                }])
                .select()
                .single();
                
            if (createError) {
                console.error('❌ Error creating user:', createError);
                return {
                    canAnalyze: false,
                    isFree: false,
                    remainingCredits: 0,
                    message: 'Unable to create user account',
                    user: null
                };
            }
            
            user = newUser;
            console.log('✅ New user created:', newUser.id);
        } else {
            // Update last active timestamp asynchronously (don't await)
            client
                .from('users')
                .update({ last_active_at: new Date().toISOString() })
                .eq('id', user.id)
                .then(() => console.log('📊 Last active timestamp updated'))
                .catch(err => console.log('⚠️ Failed to update timestamp:', err));
        }
        
        // Cache the user data
        setCachedUser(phoneNumber, user);
        
        // Calculate credits and determine status
        const usedDocuments = user.free_documents_used + user.paid_documents_used;
        const remainingCredits = user.total_credits - usedDocuments;
        
        // Check if user has free documents left
        if (user.free_documents_used < 1) {
            return {
                canAnalyze: true,
                isFree: true,
                remainingCredits: user.total_credits,
                message: 'Free document available',
                user: user
            };
        }
        
        // Check if user has paid credits
        if (remainingCredits > 0) {
            return {
                canAnalyze: true,
                isFree: false,
                remainingCredits: remainingCredits,
                message: 'Paid credit available',
                user: user
            };
        }
        
        // No credits left
        return {
            canAnalyze: false,
            isFree: false,
            remainingCredits: 0,
            message: 'No credits remaining - need to purchase more',
            user: user
        };
        
    } catch (error) {
        console.error('❌ Error checking user credits:', error);
        return { 
            canAnalyze: false, 
            isFree: false, 
            remainingCredits: 0,
            message: 'Database error - cannot verify credits',
            user: null
        };
    }
}

/**
 * Record a document analysis usage - optimized version
 * @param {string} phoneNumber - WhatsApp phone number  
 * @param {string} messageSid - Twilio message SID
 * @param {boolean} isFree - Whether this was a free analysis
 * @param {string} documentType - Type of document analyzed
 * @param {string} analysisResult - The analysis result (truncated for storage)
 * @param {number} processingTimeMs - Processing time in milliseconds
 * @param {Object} user - User object from checkUserCanAnalyze (optional optimization)
 * @returns {boolean} Success status
 */
async function recordUsage(phoneNumber, messageSid, isFree, documentType = 'unknown', analysisResult = '', processingTimeMs = 0, user = null) {
    const client = getSupabaseClient();
    if (!client) {
        console.log('⚠️ Database not available - usage not recorded');
        return true; // Don't fail if database unavailable
    }
    
    try {
        // Use provided user object to avoid additional database query
        if (!user) {
            user = await getOrCreateUser(phoneNumber);
        }
        
        if (!user) {
            console.error('❌ Cannot record usage - user not found');
            return false;
        }
        
        // Perform both operations in parallel for better performance
        const operations = [];
        
        // Insert usage log
        operations.push(
            client
                .from('usage_logs')
                .insert([{
                    user_id: user.id,
                    phone_number: phoneNumber,
                    message_sid: messageSid,
                    document_type: documentType,
                    analysis_result: analysisResult.substring(0, 1000), // Truncate to avoid storage issues
                    was_free: isFree,
                    processing_time_ms: processingTimeMs
                }])
        );
        
        // Update user usage counters
        const updateData = isFree 
            ? { free_documents_used: user.free_documents_used + 1 }
            : { paid_documents_used: user.paid_documents_used + 1 };
            
        operations.push(
            client
                .from('users')
                .update(updateData)
                .eq('id', user.id)
        );
        
        // Execute both operations in parallel
        const [logResult, updateResult] = await Promise.all(operations);
        
        if (logResult.error) {
            console.error('❌ Error recording usage log:', logResult.error);
            return false;
        }
        
        if (updateResult.error) {
            console.error('❌ Error updating user usage:', updateResult.error);
            return false;
        }
        
        console.log(`✅ Usage recorded for ${phoneNumber}: ${isFree ? 'FREE' : 'PAID'} (${processingTimeMs}ms)`);
        
        // Invalidate cache since user data has changed
        userCache.delete(phoneNumber);
        console.log(`🗑️ Cache invalidated for ${phoneNumber}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error recording usage:', error);
        return false;
    }
}

/**
 * Get user statistics
 * @param {string} phoneNumber - WhatsApp phone number
 * @returns {Object|null} User stats or null
 */
async function getUserStats(phoneNumber) {
    const client = getSupabaseClient();
    if (!client) return null;
    
    try {
        const user = await getOrCreateUser(phoneNumber);
        if (!user) return null;
        
        const { data: recentUsage } = await client
            .from('usage_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
            
        return {
            user,
            recentUsage: recentUsage || []
        };
        
    } catch (error) {
        console.error('❌ Error getting user stats:', error);
        return null;
    }
}

/**
 * Generate payment required message
 * @param {string} phoneNumber - WhatsApp phone number
 * @returns {string} Formatted payment message
 */
function getPaymentRequiredMessage(phoneNumber) {
    return `🔸 *عربست* | 💳 *تم استهلاك الرصيد المجاني*

╔══════════════════════════╗
║ 🚫 *نفد رصيدك المجاني* ║
╚══════════════════════════╝

لقد استخدمت وثيقتك المجانية بنجاح!
للمتابعة، يرجى شراء رصيد إضافي:

╔══════════════════════════╗
║ 💰 *خطط الدفع* ║
╚══════════════════════════╝

🟢 *€7* - 5 وثائق (€1.40 للوثيقة)
🔵 *€15* - 15 وثيقة (€1 للوثيقة)  
🟡 *€25* - غير محدود شهرياً

💳 *للشراء:*
أرسل "أريد شراء رصيد" وسنرسل لك رابط الدفع

⚡ *دفع آمن عبر PayPal*
✅ *تفعيل فوري بعد الدفع*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI* - تحليل ذكي للوثائق الألمانية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

/**
 * Update user credits after successful payment
 * @param {string} phoneNumber - WhatsApp phone number
 * @param {number} creditsToAdd - Number of credits to add
 * @param {string} tier - Subscription tier (basic, premium, unlimited)
 * @param {string} orderId - PayPal order ID for reference
 * @returns {boolean} Success status
 */
async function updateUserCredits(phoneNumber, creditsToAdd, tier = 'paid', orderId = null) {
    const client = getSupabaseClient();
    if (!client) {
        console.log('⚠️ Database not available - credits not updated');
        return true; // Don't fail if database unavailable
    }
    
    try {
        const user = await getOrCreateUser(phoneNumber);
        if (!user) {
            console.error('❌ Cannot update credits - user not found');
            return false;
        }
        
        const expiresAt = tier === 'unlimited' ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
        
        // Update user credits
        const { error } = await client
            .from('users')
            .update({
                total_credits: user.total_credits + creditsToAdd,
                subscription_tier: tier,
                subscription_updated: new Date().toISOString(),
                subscription_expires: expiresAt,
                last_active_at: new Date().toISOString()
            })
            .eq('id', user.id);
            
        if (error) {
            console.error('❌ Error updating user credits:', error);
            return false;
        }
        
        console.log(`✅ Credits updated for ${phoneNumber}: +${creditsToAdd} (tier: ${tier})`);
        
        // Invalidate cache since user data has changed
        userCache.delete(phoneNumber);
        console.log(`🗑️ Cache invalidated for ${phoneNumber} after credit update`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error updating user credits:', error);
        return false;
    }
}

/**
 * Generate success message after payment
 * @param {string} phoneNumber - WhatsApp phone number
 * @param {Object} paymentData - Payment data from PayPal
 * @returns {string} Formatted success message
 */
function getPaymentSuccessMessage(paymentData) {
    const { plan_id, documents, amount, tier } = paymentData;
    
    return `🔸 *عربست* | ✅ *تم الدفع بنجاح!*

╔══════════════════════════╗
║ 🎉 *تم تفعيل رصيدك* ║
╚══════════════════════════╝

📦 *الخطة المشتراة:* ${plan_id === 'basic' ? '5 وثائق' : plan_id === 'premium' ? '15 وثيقة' : 'غير محدود شهرياً'}
💰 *المبلغ المدفوع:* €${amount}
📄 *عدد الوثائق:* ${documents === 999999 ? 'غير محدود' : documents}
⏰ *صالح حتى:* ${tier === 'unlimited' ? '30 يوم من الآن' : 'حسب الاستخدام'}

🚀 *أرسل صورة أي وثيقة ألمانية الآن!*

✅ *وثائق الضرائب* (Finanzamt)
✅ *الرسائل القانونية* (Gericht/Polizei)
✅ *المستندات الطبية* (Krankenkasse)
✅ *الفواتير والمطالبات* (Rechnung/Mahnung)

📸 *ارسل الصورة وسأحللها فوراً*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI* - أهلاً بك في عضوية ${tier}
*دقة • سرعة • احترافية*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

module.exports = {
    getSupabaseClient,
    getOrCreateUser,
    checkUserCanAnalyze,
    recordUsage,
    getUserStats,
    getPaymentRequiredMessage,
    updateUserCredits,
    getPaymentSuccessMessage
};