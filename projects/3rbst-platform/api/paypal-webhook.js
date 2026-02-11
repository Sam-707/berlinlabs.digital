// 3rbst Platform PayPal Webhook Handler
// Handles PayPal IPN (Instant Payment Notifications) and order processing

const { capturePayment, logPaymentTransaction } = require('./paypal-payment');
const { updateUserCredits, getPaymentSuccessMessage } = require('../lib/database');
const twilio = require('twilio');

// Initialize Twilio client
function getTwilioClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured');
    }
    
    return twilio(accountSid, authToken);
}

// Send success notification to user via WhatsApp
async function sendPaymentSuccessNotification(whatsappNumber, paymentData) {
    try {
        const client = getTwilioClient();
        const whatsappPhone = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
        
        const successMessage = getPaymentSuccessMessage(paymentData);
        
        const message = await client.messages.create({
            body: successMessage,
            from: whatsappPhone,
            to: `whatsapp:${whatsappNumber}`
        });
        
        console.log(`✅ Payment success notification sent to ${whatsappNumber}: ${message.sid}`);
        return { success: true, messageSid: message.sid };
        
    } catch (error) {
        console.error('❌ Failed to send payment notification:', error);
        return { success: false, error: error.message };
    }
}

// Handle successful payment return
async function handlePaymentSuccess(orderId, whatsappNumber) {
    try {
        console.log(`🔄 Processing successful payment for order: ${orderId}`);
        
        // Capture the payment
        const captureResult = await capturePayment(orderId);
        
        if (!captureResult.success) {
            throw new Error(`Payment capture failed: ${captureResult.error}`);
        }
        
        // Log transaction in database
        const logResult = await logPaymentTransaction(captureResult);
        
        if (!logResult.success) {
            console.warn('⚠️ Payment successful but logging failed:', logResult.error);
        }
        
        // Update user credits
        const creditsUpdated = await updateUserCredits(
            captureResult.whatsapp_number,
            captureResult.documents,
            captureResult.tier,
            captureResult.order_id
        );
        
        if (!creditsUpdated) {
            console.warn('⚠️ Payment successful but credits not updated');
        }
        
        // Send WhatsApp notification
        const notificationResult = await sendPaymentSuccessNotification(
            captureResult.whatsapp_number, 
            captureResult
        );
        
        console.log(`✅ Payment processing completed for ${captureResult.whatsapp_number}`);
        
        return {
            success: true,
            payment: captureResult,
            notification: notificationResult,
            transaction_log: logResult
        };
        
    } catch (error) {
        console.error('❌ Payment success handling failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Handle payment cancellation
async function handlePaymentCancel(whatsappNumber) {
    try {
        const client = getTwilioClient();
        const whatsappPhone = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
        
        const cancelMessage = `🔸 *عربست* | 😔 *تم إلغاء الدفع*

╔══════════════════════════╗
║ 🚫 *تم إلغاء العملية* ║
╚══════════════════════════╝

لا مشكلة! يمكنك المحاولة مرة أخرى في أي وقت.

💡 *المتاح الآن:*
• وثيقة مجانية واحدة للتجربة

📸 *أرسل صورة وثيقتك الآن*

أو أرسل "أريد شراء رصيد" للحصول على المزيد

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI* - دائماً في خدمتك
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        
        const message = await client.messages.create({
            body: cancelMessage,
            from: whatsappPhone,
            to: `whatsapp:${whatsappNumber}`
        });
        
        console.log(`📨 Payment cancellation message sent to ${whatsappNumber}`);
        return { success: true, messageSid: message.sid };
        
    } catch (error) {
        console.error('❌ Failed to send cancellation message:', error);
        return { success: false, error: error.message };
    }
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            service: '3rbst PayPal Webhook',
            status: 'online',
            endpoints: ['/api/paypal-webhook', '/api/paypal-success', '/api/paypal-cancel'],
            timestamp: new Date().toISOString()
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('📨 PayPal webhook received');
        console.log('📝 Headers:', req.headers);
        console.log('📝 Body:', req.body);

        // PayPal IPN verification would go here in production
        // For now, we'll handle the basic webhook events
        
        const { event_type, resource } = req.body;
        
        if (event_type === 'CHECKOUT.ORDER.APPROVED') {
            // Order approved, but not yet captured
            console.log(`✅ PayPal order approved: ${resource.id}`);
            
            return res.status(200).json({
                success: true,
                message: 'Order approval received',
                order_id: resource.id
            });
            
        } else if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            // Payment completed
            console.log(`💰 PayPal payment completed: ${resource.id}`);
            
            // Extract whatsapp number from custom_id
            const customData = JSON.parse(resource.custom_id || '{}');
            const whatsappNumber = customData.whatsapp_number;
            
            if (whatsappNumber) {
                const result = await handlePaymentSuccess(resource.supplementary_data.related_ids.order_id, whatsappNumber);
                
                return res.status(200).json({
                    success: true,
                    message: 'Payment processed',
                    result: result
                });
            }
            
        } else {
            console.log(`ℹ️ Unhandled PayPal webhook event: ${event_type}`);
        }
        
        return res.status(200).json({
            success: true,
            message: 'Webhook received',
            event_type: event_type
        });
        
    } catch (error) {
        console.error('❌ PayPal webhook processing error:', error);
        return res.status(500).json({
            error: 'Webhook processing failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};