// 3rbst Platform PayPal Success Handler
// Handles successful payment returns from PayPal

const { capturePayment, logPaymentTransaction } = require('./paypal-payment');

// Handle successful payment return (duplicate function to avoid circular dependency)
async function handlePaymentSuccess(orderId) {
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
        
        console.log(`✅ Payment processing completed for ${captureResult.whatsapp_number}`);
        
        return {
            success: true,
            payment: captureResult,
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

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { token, PayerID } = req.query;
        
        if (!token) {
            return res.status(400).json({ 
                error: 'Missing payment token' 
            });
        }

        console.log(`✅ PayPal success callback - Order: ${token}, Payer: ${PayerID}`);

        // Return success page
        const successHtml = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Zahlung erfolgreich - 3rbst Platform</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0; 
                    padding: 20px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #333;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container { 
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                    text-align: center; 
                    max-width: 500px;
                    width: 100%;
                }
                .success-icon {
                    font-size: 80px;
                    color: #4CAF50;
                    margin-bottom: 20px;
                }
                h1 { 
                    color: #4CAF50;
                    margin-bottom: 10px;
                    font-size: 28px;
                }
                .subtitle {
                    color: #666;
                    margin-bottom: 30px;
                    font-size: 18px;
                }
                .order-id {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 10px;
                    font-family: monospace;
                    margin: 20px 0;
                    word-break: break-all;
                }
                .next-steps {
                    background: #e3f2fd;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border-left: 4px solid #2196F3;
                }
                .whatsapp-btn {
                    background: #25D366;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 50px;
                    text-decoration: none;
                    display: inline-block;
                    margin: 20px 0;
                    font-weight: bold;
                    font-size: 16px;
                    transition: background 0.3s;
                }
                .whatsapp-btn:hover {
                    background: #128C7E;
                }
                .footer {
                    color: #888;
                    font-size: 14px;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">✅</div>
                <h1>Zahlung erfolgreich!</h1>
                <div class="subtitle">Dein Premium-Paket wurde aktiviert</div>
                
                <div class="order-id">
                    <strong>Bestellung:</strong> ${token}
                </div>
                
                <div class="next-steps">
                    <h3>🚀 Nächste Schritte:</h3>
                    <p>1. Du erhältst eine Bestätigung per WhatsApp<br>
                       2. Sende jetzt dein erstes Dokument!<br>
                       3. Genieße die professionelle Analyse</p>
                </div>
                
                <a href="https://wa.me/${process.env.TWILIO_WHATSAPP_NUMBER?.replace('whatsapp:+', '') || '14155238886'}" 
                   class="whatsapp-btn">
                   📱 Zu WhatsApp
                </a>
                
                <div class="footer">
                    <p><strong>3rbst Platform</strong> - Professionelle Dokumentenanalyse</p>
                    <p>Bei Fragen: hello@3rbst.com</p>
                </div>
            </div>

            <script>
                // Auto-close after 10 seconds if opened in popup
                setTimeout(() => {
                    if (window.opener) {
                        window.close();
                    }
                }, 10000);
                
                // Send success event to parent window if in iframe
                if (window.parent !== window) {
                    window.parent.postMessage({
                        type: 'PAYMENT_SUCCESS',
                        order_id: '${token}',
                        timestamp: new Date().toISOString()
                    }, '*');
                }
            </script>
        </body>
        </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(successHtml);
        
    } catch (error) {
        console.error('❌ PayPal success handler error:', error);
        
        const errorHtml = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fehler - 3rbst Platform</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
                .error { color: #f44336; }
            </style>
        </head>
        <body>
            <h1 class="error">⚠️ Fehler bei der Zahlungsverarbeitung</h1>
            <p>Es gab ein Problem bei der Verarbeitung deiner Zahlung.</p>
            <p>Bitte kontaktiere uns: hello@3rbst.com</p>
            <a href="https://wa.me/${process.env.TWILIO_WHATSAPP_NUMBER?.replace('whatsapp:+', '') || '14155238886'}">
                📱 WhatsApp Support
            </a>
        </body>
        </html>
        `;
        
        res.setHeader('Content-Type', 'text/html');
        return res.status(500).send(errorHtml);
    }
};