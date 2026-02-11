// 3rbst Platform PayPal Cancel Handler
// Handles cancelled payment returns from PayPal

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { token } = req.query;
        
        console.log(`❌ PayPal payment cancelled - Order: ${token}`);

        // Return cancellation page
        const cancelHtml = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Zahlung abgebrochen - 3rbst Platform</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0; 
                    padding: 20px; 
                    background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%);
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
                .cancel-icon {
                    font-size: 80px;
                    color: #ff6b6b;
                    margin-bottom: 20px;
                }
                h1 { 
                    color: #ff6b6b;
                    margin-bottom: 10px;
                    font-size: 28px;
                }
                .subtitle {
                    color: #666;
                    margin-bottom: 30px;
                    font-size: 18px;
                }
                .info-box {
                    background: #fff3cd;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border-left: 4px solid #ffc107;
                }
                .retry-btn {
                    background: #4CAF50;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 50px;
                    text-decoration: none;
                    display: inline-block;
                    margin: 10px;
                    font-weight: bold;
                    font-size: 16px;
                    transition: background 0.3s;
                }
                .retry-btn:hover {
                    background: #45a049;
                }
                .whatsapp-btn {
                    background: #25D366;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 50px;
                    text-decoration: none;
                    display: inline-block;
                    margin: 10px;
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
                <div class="cancel-icon">😔</div>
                <h1>Zahlung abgebrochen</h1>
                <div class="subtitle">Deine Zahlung wurde nicht abgeschlossen</div>
                
                <div class="info-box">
                    <h3>💡 Kein Problem!</h3>
                    <p>Du kannst jederzeit wieder upgraden.<br>
                       Dein kostenloses Dokument ist weiterhin verfügbar.</p>
                </div>
                
                <a href="https://wa.me/${process.env.TWILIO_WHATSAPP_NUMBER?.replace('whatsapp:+', '') || '14155238886'}?text=BEZAHLEN" 
                   class="retry-btn">
                   💳 Erneut versuchen
                </a>
                
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
                // Auto-close after 8 seconds if opened in popup
                setTimeout(() => {
                    if (window.opener) {
                        window.close();
                    }
                }, 8000);
                
                // Send cancel event to parent window if in iframe
                if (window.parent !== window) {
                    window.parent.postMessage({
                        type: 'PAYMENT_CANCELLED',
                        order_id: '${token}',
                        timestamp: new Date().toISOString()
                    }, '*');
                }
            </script>
        </body>
        </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(cancelHtml);
        
    } catch (error) {
        console.error('❌ PayPal cancel handler error:', error);
        return res.status(500).json({
            error: 'Cancel handler error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};