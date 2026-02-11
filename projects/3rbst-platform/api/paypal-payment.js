// 3rbst Platform PayPal Payment Integration
// Handles payment processing for document analysis packages

const paypal = require('@paypal/checkout-server-sdk');

// PayPal Environment Setup
function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials not configured');
    }
    
    // Use sandbox for testing, live for production
    if (process.env.NODE_ENV === 'production') {
        return new paypal.core.LiveEnvironment(clientId, clientSecret);
    } else {
        return new paypal.core.SandboxEnvironment(clientId, clientSecret);
    }
}

// PayPal Client
function client() {
    return new paypal.core.PayPalHttpClient(environment());
}

// Payment Plans Configuration
const PAYMENT_PLANS = {
    basic: {
        id: 'basic',
        name: '5 Dokumente',
        description: '5 deutsche Dokumente analysieren',
        price: '7.00',
        currency: 'EUR',
        documents: 5,
        tier: 'basic'
    },
    premium: {
        id: 'premium', 
        name: '15 Dokumente',
        description: '15 deutsche Dokumente analysieren',
        price: '15.00',
        currency: 'EUR',
        documents: 15,
        tier: 'premium'
    },
    unlimited: {
        id: 'unlimited',
        name: 'Unbegrenzt (30 Tage)',
        description: 'Unbegrenzte Dokumentenanalyse für 30 Tage',
        price: '25.00',
        currency: 'EUR',
        documents: 999999,
        tier: 'unlimited',
        duration_days: 30
    }
};

// Create Payment Order
async function createPaymentOrder(planId, whatsappNumber, userMetadata = {}) {
    try {
        const plan = PAYMENT_PLANS[planId];
        if (!plan) {
            throw new Error(`Invalid payment plan: ${planId}`);
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            application_context: {
                brand_name: '3rbst Platform',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW',
                return_url: `${process.env.WEBHOOK_URL}/api/paypal-success`,
                cancel_url: `${process.env.WEBHOOK_URL}/api/paypal-cancel`
            },
            purchase_units: [{
                reference_id: `3rbst-${planId}-${Date.now()}`,
                description: plan.description,
                custom_id: JSON.stringify({
                    whatsapp_number: whatsappNumber,
                    plan_id: planId,
                    tier: plan.tier,
                    documents: plan.documents,
                    user_metadata: userMetadata
                }),
                amount: {
                    currency_code: plan.currency,
                    value: plan.price,
                    breakdown: {
                        item_total: {
                            currency_code: plan.currency,
                            value: plan.price
                        }
                    }
                },
                items: [{
                    name: plan.name,
                    description: plan.description,
                    unit_amount: {
                        currency_code: plan.currency,
                        value: plan.price
                    },
                    quantity: '1',
                    category: 'DIGITAL_GOODS'
                }]
            }]
        });

        const response = await client().execute(request);
        
        console.log(`✅ PayPal order created: ${response.result.id} for ${whatsappNumber}`);
        
        return {
            success: true,
            order_id: response.result.id,
            approval_url: response.result.links.find(link => link.rel === 'approve').href,
            plan: plan,
            whatsapp_number: whatsappNumber
        };

    } catch (error) {
        console.error('❌ PayPal order creation failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Capture Payment (after user approval)
async function capturePayment(orderId) {
    try {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        
        const response = await client().execute(request);
        const order = response.result;
        
        if (order.status === 'COMPLETED') {
            // Extract custom data
            const customData = JSON.parse(order.purchase_units[0].custom_id);
            
            console.log(`✅ Payment captured: ${orderId} for ${customData.whatsapp_number}`);
            
            return {
                success: true,
                order_id: orderId,
                transaction_id: order.purchase_units[0].payments.captures[0].id,
                amount: order.purchase_units[0].amount.value,
                currency: order.purchase_units[0].amount.currency_code,
                whatsapp_number: customData.whatsapp_number,
                plan_id: customData.plan_id,
                tier: customData.tier,
                documents: customData.documents,
                payer_email: order.payer.email_address,
                payer_name: order.payer.name
            };
        } else {
            throw new Error(`Payment not completed. Status: ${order.status}`);
        }

    } catch (error) {
        console.error('❌ PayPal payment capture failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Generate Payment Links for WhatsApp
function generatePaymentMessage(whatsappNumber) {
    const plans = Object.values(PAYMENT_PLANS);
    
    let message = `💳 **Upgrade auf Premium**\n\n`;
    message += `Wähle dein Paket:\n\n`;
    
    plans.forEach(plan => {
        const perDoc = (parseFloat(plan.price) / plan.documents).toFixed(2);
        message += `💎 **${plan.name}** - €${plan.price}\n`;
        message += `   ${plan.description}\n`;
        message += `   (€${perDoc} pro Dokument)\n\n`;
    });
    
    message += `🔗 **PayPal-Links werden generiert...**\n\n`;
    message += `Antworte mit:\n`;
    message += `• "BASIC" für 5 Dokumente (€7)\n`;
    message += `• "PREMIUM" für 15 Dokumente (€15)\n`;
    message += `• "UNLIMITED" für unbegrenzt (€25)\n\n`;
    message += `💯 Sofortige Aktivierung nach Zahlung!`;
    
    return message;
}

// Database integration for payment tracking
async function initSupabase() {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
        throw new Error('Supabase credentials not configured');
    }
    
    return createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// Log payment transaction
async function logPaymentTransaction(paymentData) {
    try {
        const supabase = await initSupabase();
        
        const { data, error } = await supabase
            .from('payment_transactions')
            .insert([{
                whatsapp_number: paymentData.whatsapp_number,
                plan_id: paymentData.plan_id,
                tier: paymentData.tier,
                amount: parseFloat(paymentData.amount),
                currency: paymentData.currency,
                paypal_order_id: paymentData.order_id,
                paypal_transaction_id: paymentData.transaction_id,
                payer_email: paymentData.payer_email,
                payer_name: `${paymentData.payer_name?.given_name || ''} ${paymentData.payer_name?.surname || ''}`.trim(),
                documents_purchased: paymentData.documents,
                status: 'completed',
                processed_at: new Date().toISOString()
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        // Update user subscription
        await supabase
            .from('users')
            .update({
                subscription_tier: paymentData.tier,
                subscription_updated: new Date().toISOString(),
                subscription_expires: paymentData.tier === 'unlimited' ? 
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
            })
            .eq('whatsapp_number', paymentData.whatsapp_number);
            
        console.log(`✅ Payment transaction logged: ${paymentData.order_id}`);
        return { success: true, transaction: data };
        
    } catch (error) {
        console.error('❌ Payment logging failed:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    createPaymentOrder,
    capturePayment,
    generatePaymentMessage,
    logPaymentTransaction,
    PAYMENT_PLANS
};