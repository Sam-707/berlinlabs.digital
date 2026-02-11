// API endpoint to serve the branded demo UI

export default function handler(req, res) {
    // Return the branded HTML interface
    res.status(200).send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3rbst - Live Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #0b141a;
            direction: rtl;
            padding: 20px;
        }
        
        .phone-container {
            max-width: 380px;
            margin: 0 auto;
            background: #0b141a;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            border: 2px solid #202c33;
        }
        
        .header {
            background: linear-gradient(135deg, #202c33 0%, #2a3942 100%);
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 2px solid #00a884;
        }
        
        .avatar {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: linear-gradient(135deg, #00a884, #00d4aa);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0, 168, 132, 0.3);
        }
        
        .contact-info h3 {
            color: #e9edef;
            font-size: 17px;
            font-weight: 600;
            margin-bottom: 2px;
        }
        
        .contact-info p {
            color: #00a884;
            font-size: 12px;
            font-weight: 500;
        }
        
        .chat {
            height: 600px;
            background: #0b141a;
            padding: 20px;
            overflow-y: auto;
        }
        
        .message {
            background: linear-gradient(135deg, #1a2832 0%, #253342 100%);
            border-radius: 20px;
            padding: 20px;
            border: 1px solid #00a884;
            box-shadow: 0 4px 16px rgba(0, 168, 132, 0.1);
            position: relative;
            overflow: hidden;
        }
        
        .message::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #00a884, #00d4aa);
        }
        
        .brand-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid #374151;
        }
        
        .brand-logo {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .brand-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #00a884, #00d4aa);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
        }
        
        .brand-name {
            color: #00a884;
            font-size: 18px;
            font-weight: 700;
        }
        
        .ai-badge {
            background: rgba(0, 168, 132, 0.1);
            border: 1px solid #00a884;
            border-radius: 20px;
            padding: 4px 12px;
            color: #00a884;
            font-size: 11px;
            font-weight: 600;
        }
        
        .greeting {
            color: #e9edef;
            font-size: 16px;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .greeting .brand-mention {
            color: #00a884;
            font-weight: 600;
        }
        
        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 16px;
        }
        
        .typing-dot {
            width: 8px;
            height: 8px;
            background: #00a884;
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }
        
        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.5;
            }
            30% {
                transform: translateY(-10px);
                opacity: 1;
            }
        }
        
        .time {
            color: #8696a0;
            font-size: 11px;
            text-align: left;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="phone-container">
        <div class="header">
            <div class="avatar">ع</div>
            <div class="contact-info">
                <h3>عربست - 3rbst</h3>
                <p>AI تحليل الوثائق الألمانية</p>
            </div>
        </div>
        
        <div class="chat">
            <div class="message">
                <div class="brand-header">
                    <div class="brand-logo">
                        <div class="brand-icon">ع</div>
                        <div class="brand-name">عربست</div>
                    </div>
                    <div class="ai-badge">AI POWERED</div>
                </div>
                
                <div class="greeting">
                    مرحباً! أرسل لي صورة أي وثيقة ألمانية وسأقوم بتحليلها فوراً من خلال <span class="brand-mention">نظام عربست الذكي</span>
                </div>
                
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                
                <div class="time">الآن</div>
            </div>
        </div>
    </div>
</body>
</html>`);
}