// GDPR Consent Management for 3rbst WhatsApp Bot
// Ensures compliance with EU data protection regulations

const GDPR_CONSENT_MESSAGE = `🔸 *عربست* | 🇪🇺 *موافقة معالجة البيانات*

مرحباً! 👋 قبل أن نبدأ، نحتاج إلى موافقتك على معالجة بياناتك وفقاً لقانون حماية البيانات الأوروبي (GDPR):

╔══════════════════════════╗
║ 📋 *ما نفعله ببياناتك* ║
╚══════════════════════════╝

✅ *نحلل المستندات التي ترسلها*
✅ *نحذف المستندات تلقائياً بعد 24 ساعة*
✅ *نحتفظ برقم هاتفك لتتبع الاستخدام*
✅ *جميع البيانات تبقى في الاتحاد الأوروبي*

╔══════════════════════════╗
║ 🔒 *حقوقك في البيانات* ║
╚══════════════════════════╝

• *الحصول على نسخة* من بياناتك
• *تصحيح* البيانات الخاطئة
• *حذف* جميع بياناتك
• *الاعتراض* على المعالجة

📖 *سياسة الخصوصية الكاملة:* 3rbst.com/privacy

╔══════════════════════════╗
║ ✅ *للموافقة والمتابعة* ║
╚══════════════════════════╝

أرسل: *موافق* أو *yes* أو *agree*

❌ *للرفض:* أرسل *لا* أو *no*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI* - ملتزمون بحماية خصوصيتك
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const GDPR_CONSENT_GRANTED_MESSAGE = `🔸 *عربست* | ✅ *تم تسجيل موافقتك*

شكراً لك! تم تسجيل موافقتك على معالجة البيانات.

╔══════════════════════════╗
║ 🎉 *مرحباً بك في عربست* ║
╚══════════════════════════╝

🎁 *لديك وثيقة مجانية واحدة للتجربة*

📸 *أرسل صورة أي وثيقة ألمانية الآن:*

✅ *وثائق الضرائب* (Finanzamt)
✅ *الرسائل القانونية* (Gericht/Polizei)  
✅ *المستندات الطبية* (Krankenkasse)
✅ *الفواتير والمطالبات* (Rechnung/Mahnung)
✅ *أي وثيقة رسمية أخرى*

💡 *تحليل سريع وواضح بالعربية!*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI* - تحليل ذكي للوثائق الألمانية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const GDPR_CONSENT_DENIED_MESSAGE = `🔸 *عربست* | ❌ *تم رفض الموافقة*

نحترم قرارك بعدم الموافقة على معالجة البيانات.

للأسف، لا يمكننا تقديم خدمة تحليل الوثائق بدون موافقتك على معالجة البيانات، حيث أن ذلك مطلوب قانونياً.

╔══════════════════════════╗
║ 🤔 *إذا غيرت رأيك* ║
╚══════════════════════════╝

يمكنك إرسال *موافق* في أي وقت للبدء في استخدام الخدمة.

📖 *لمزيد من المعلومات:* 3rbst.com/privacy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI* - نحترم خصوصيتك
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

/**
 * Check if user has given GDPR consent
 * @param {string} phoneNumber - WhatsApp phone number
 * @returns {Promise<boolean>} True if consent given
 */
async function hasGDPRConsent(phoneNumber) {
    try {
        const { getSupabaseClient } = require('./database');
        const client = getSupabaseClient();
        
        if (!client) {
            // If database not available, assume consent for now
            console.log('⚠️ Database not available - assuming GDPR consent');
            return true;
        }
        
        const { data: user } = await client
            .from('users')
            .select('gdpr_consent_given, gdpr_consent_date')
            .eq('phone_number', phoneNumber)
            .single();
            
        return user?.gdpr_consent_given === true;
        
    } catch (error) {
        console.error('❌ Error checking GDPR consent:', error);
        // Default to requiring consent on error
        return false;
    }
}

/**
 * Record GDPR consent for user
 * @param {string} phoneNumber - WhatsApp phone number
 * @param {boolean} consentGiven - Whether consent was given
 * @returns {Promise<boolean>} Success status
 */
async function recordGDPRConsent(phoneNumber, consentGiven) {
    try {
        const { getSupabaseClient, getOrCreateUser } = require('./database');
        const client = getSupabaseClient();
        
        if (!client) {
            console.log('⚠️ Database not available - GDPR consent not recorded');
            return true;
        }
        
        // Get or create user first
        const user = await getOrCreateUser(phoneNumber);
        if (!user) {
            console.error('❌ Cannot record GDPR consent - user not found');
            return false;
        }
        
        // Update consent status
        const { error } = await client
            .from('users')
            .update({
                gdpr_consent_given: consentGiven,
                gdpr_consent_date: new Date().toISOString(),
                gdpr_consent_ip: 'whatsapp', // WhatsApp doesn't provide IP
                last_active_at: new Date().toISOString()
            })
            .eq('id', user.id);
            
        if (error) {
            console.error('❌ Error recording GDPR consent:', error);
            return false;
        }
        
        console.log(`✅ GDPR consent recorded for ${phoneNumber}: ${consentGiven}`);
        return true;
        
    } catch (error) {
        console.error('❌ Error recording GDPR consent:', error);
        return false;
    }
}

/**
 * Check if message is a consent response
 * @param {string} message - User message
 * @returns {boolean|null} True for consent, false for denial, null for not a consent message
 */
function parseConsentResponse(message) {
    if (!message || typeof message !== 'string') return null;
    
    const msg = message.toLowerCase().trim();
    
    // Consent keywords (Arabic and English)
    const consentKeywords = ['موافق', 'yes', 'agree', 'نعم', 'أوافق', 'موافقة', 'ok'];
    const denialKeywords = ['لا', 'no', 'refuse', 'رفض', 'أرفض', 'لا أوافق'];
    
    // Check for consent
    if (consentKeywords.some(keyword => msg.includes(keyword))) {
        return true;
    }
    
    // Check for denial
    if (denialKeywords.some(keyword => msg.includes(keyword))) {
        return false;
    }
    
    // Not a consent response
    return null;
}

module.exports = {
    GDPR_CONSENT_MESSAGE,
    GDPR_CONSENT_GRANTED_MESSAGE,
    GDPR_CONSENT_DENIED_MESSAGE,
    hasGDPRConsent,
    recordGDPRConsent,
    parseConsentResponse
};