// Enhanced document analysis using the sophisticated new system
async function analyzeDocument(imageUrl, accountSid, authToken, userContext = {}) {
    try {
        console.log('🧠 Starting Enhanced Document Analysis...');
        
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }
        
        // Download image from Twilio
        console.log('📸 Downloading image from:', imageUrl);
        const mediaResponse = await fetch(imageUrl, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
            }
        });
        
        if (!mediaResponse.ok) {
            throw new Error(`Failed to download image: ${mediaResponse.status}`);
        }
        
        // Get image data
        const mediaBuffer = await mediaResponse.arrayBuffer();
        const bufferSize = mediaBuffer.byteLength;
        const contentType = mediaResponse.headers.get('content-type') || 'image/jpeg';
        console.log(`📊 Image received: ${(bufferSize / 1024 / 1024).toFixed(2)} MB, type: ${contentType}`);
        
        // Make sure content type is supported
        if (!contentType.startsWith('image/')) {
            throw new Error(`Unsupported file type: ${contentType}`);
        }
        
        // Check if image is too large (OpenAI limit is ~20MB for base64)
        if (bufferSize > 10 * 1024 * 1024) { // 10MB limit for safety
            throw new Error('Image too large. Please send a smaller image.');
        }
        
        // Optimize base64 encoding with memory management
        const optimizationResult = optimizeBase64Encoding(mediaBuffer);
        const mediaBase64 = optimizationResult.base64;
        
        // Generate optimization recommendations
        const recommendations = getOptimizationRecommendations(
            bufferSize, 
            contentType, 
            optimizationResult.encodingTimeMs
        );
        
        // Log metrics and recommendations
        logImageMetrics({
            ...optimizationResult,
            recommendations
        });
        
        const dataUrl = `data:${contentType};base64,${mediaBase64}`;
        console.log(`✅ Image optimized: ${contentType}, base64 length: ${mediaBase64.length.toLocaleString()}`);
        
        // Step 1: Extract German text using GPT-4 Vision
        const extractionPrompt = `Extract all German text from this document image. Return ONLY the German text content without any commentary, translation, or analysis. Preserve the original formatting and structure.`;

        console.log('📝 Extracting German text from image...');
        
        // Create OpenAI API task for text extraction
        const textExtractionTask = async () => {
            const openaiStartTime = Date.now();
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: extractionPrompt
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: dataUrl,
                                        detail: 'high' // Higher detail for better text extraction
                                    }
                                }
                            ]
                        }
                    ],
                    temperature: 0.1, // Very low temperature for consistent text extraction
                    max_tokens: 2000
                })
            });

            console.log(`📡 Text extraction response status: ${response.status}`);
            const data = await response.json();
            const openaiResponseTime = Date.now() - openaiStartTime;
            
            if (!response.ok) {
                console.error('❌ OpenAI Text Extraction Error:', JSON.stringify(data.error));
                recordOpenAICall(openaiResponseTime, false);
                throw new Error(data.error?.message || 'OpenAI text extraction failed');
            }
            
            recordOpenAICall(openaiResponseTime, true);
            return data;
        };
        
        // Extract text from image
        const extractionData = await openaiQueue.add(textExtractionTask);
        
        if (!extractionData.choices || !extractionData.choices[0]?.message?.content) {
            throw new Error('Failed to extract text from document');
        }
        
        const germanText = extractionData.choices[0].message.content.trim();
        console.log('✅ German text extracted successfully');
        console.log(`📄 Extracted text length: ${germanText.length} characters`);
        
        // Step 2: Use Enhanced Document Analyzer
        console.log('🎯 Starting enhanced analysis...');
        const EnhancedDocumentAnalyzer = require('../lib/enhanced-document-analyzer');
        const analyzer = new EnhancedDocumentAnalyzer();
        
        // Prepare image metadata
        const imageMetadata = {
            size: bufferSize,
            type: contentType,
            optimizationUsed: optimizationResult.method,
            recommendations: recommendations
        };
        
        // Analyze the document using our sophisticated system
        const analysisResult = await analyzer.analyzeDocument(germanText, userContext, imageMetadata);
        
        autoLogStats();
        
        if (analysisResult.success && analysisResult.analysis?.formattedMessage) {
            console.log('✅ Enhanced analysis completed successfully');
            console.log(`📊 Classification: ${analysisResult.classification.documentName} (${(analysisResult.classification.confidence * 100).toFixed(1)}%)`);
            console.log(`⚡ Expert used: ${analysisResult.classification.responseModule}`);
            console.log(`🚨 Urgency: ${analysisResult.classification.urgencyLevel}`);
            
            // Return the formatted WhatsApp message
            return analysisResult.analysis.formattedMessage;
        }
        
        // Fallback if enhanced analysis fails
        if (analysisResult.fallbackAnalysis) {
            console.log('⚠️ Using fallback analysis');
            return analysisResult.fallbackAnalysis.message;
        }
        
        throw new Error('Enhanced analysis failed to produce results');

    } catch (error) {
        console.error('❌ Enhanced analysis error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Return user-friendly error message
        return `🔸 *عربست* | ❌ *خطأ في التحليل* 🔸

عذراً، حدث خطأ أثناء تحليل الوثيقة.

*السبب المحتمل:*
${error.message.includes('too large') ? '• الصورة كبيرة جداً - أرسل صورة أصغر' : ''}
${error.message.includes('Unsupported') ? '• نوع الملف غير مدعوم - أرسل صورة JPG أو PNG' : ''}
${error.message.includes('API') ? '• مشكلة مؤقتة في الخدمة - حاول مرة أخرى' : ''}
${error.message.includes('extract') ? '• لم أتمكن من قراءة النص - تأكد أن الصورة واضحة' : ''}

🔄 *جرب مرة أخرى بعد قليل*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }
}

// Import database functions
const { checkUserCanAnalyze, recordUsage, getPaymentRequiredMessage } = require('../lib/database');
const { 
    hasGDPRConsent, 
    recordGDPRConsent, 
    parseConsentResponse,
    GDPR_CONSENT_MESSAGE,
    GDPR_CONSENT_GRANTED_MESSAGE,
    GDPR_CONSENT_DENIED_MESSAGE
} = require('../lib/gdpr-consent');
const { recordRequest, recordOpenAICall, autoReport } = require('../lib/performance-monitor');
const { openaiQueue, autoLogStats } = require('../lib/queue-manager');
const { optimizeBase64Encoding, getOptimizationRecommendations, logImageMetrics } = require('../lib/image-optimizer');
const { behaviorTracker, BEHAVIOR_EVENTS } = require('../lib/behavior-tracker');

// Main webhook handler  
module.exports = async (req, res) => {
    const requestStartTime = Date.now();
    console.log('🚀 Webhook v5.1 - With Performance Monitoring');
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).send('OK');
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({
            service: "3rbst Platform Webhook",
            status: "online",
            version: "5.0-database",
            features: ["WhatsApp Business API", "GPT-4 Vision Mini", "User Tracking", "Payment Integration"],
            timestamp: new Date().toISOString()
        });
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { From, Body, MessageSid, NumMedia, MediaUrl0 } = req.body;

        if (!From || !MessageSid) {
            return res.status(400).json({ error: 'Invalid webhook data' });
        }

        const fromNumber = From.replace('whatsapp:', '');
        const hasMedia = NumMedia && parseInt(NumMedia) > 0;

        console.log(`📱 Message from: ${fromNumber}`);
        console.log(`📸 Has media: ${hasMedia}`);

        // Track incoming message behavior
        await behaviorTracker.trackBehavior(fromNumber, BEHAVIOR_EVENTS.MESSAGE_RECEIVED, {
            has_media: hasMedia,
            message_body: Body,
            media_count: parseInt(NumMedia) || 0,
            message_sid: MessageSid
        });

        // Initialize Twilio
        const twilio = require('twilio');
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

        if (!accountSid || !authToken) {
            console.error('⚠️ Twilio credentials missing');
            return res.status(500).json({ error: 'Twilio not configured' });
        }

        const client = twilio(accountSid, authToken);
        let responseMessage;

        // Check GDPR consent first
        const consentGiven = await hasGDPRConsent(fromNumber);
        
        // Check if this is a consent response
        const consentResponse = parseConsentResponse(Body);
        
        if (consentResponse !== null) {
            // User is responding to GDPR consent
            await recordGDPRConsent(fromNumber, consentResponse);
            
            // Track consent behavior
            await behaviorTracker.trackBehavior(
                fromNumber, 
                consentResponse ? BEHAVIOR_EVENTS.CONSENT_GIVEN : BEHAVIOR_EVENTS.CONSENT_DENIED,
                { consent_response: consentResponse, method: 'whatsapp' }
            );
            
            if (consentResponse === true) {
                responseMessage = GDPR_CONSENT_GRANTED_MESSAGE;
            } else {
                responseMessage = GDPR_CONSENT_DENIED_MESSAGE;
            }
        } else if (!consentGiven) {
            // User hasn't given GDPR consent yet
            responseMessage = GDPR_CONSENT_MESSAGE;
        } else if (hasMedia && MediaUrl0) {
            // Check if user can analyze documents - optimized version returns user object
            const userStatus = await checkUserCanAnalyze(fromNumber);
            
            if (!userStatus.canAnalyze) {
                // User has no credits left - send payment message
                responseMessage = getPaymentRequiredMessage(fromNumber);
            } else {
                // Document analysis
                console.log(`📄 Processing document for ${fromNumber} (${userStatus.isFree ? 'FREE' : 'PAID'})...`);
                
                try {
                    // Send immediate confirmation
                    const confirmationMessage = `🔸 *عربست* | 🤖 *جاري التحليل...* 

✅ *تم استقبال الوثيقة بنجاح!*

🧠 جاري تحليل الوثيقة...
⏱️ سيتم الرد خلال 10-30 ثانية

${userStatus.isFree ? '🎁 *هذه وثيقتك المجانية*' : `💎 *الرصيد المتبقي: ${userStatus.remainingCredits - 1}*`}

*من فضلك انتظر...*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

                    // Send confirmation first
                    console.log('✅ Sending confirmation message...');
                    await client.messages.create({
                        body: confirmationMessage,
                        from: whatsappNumber,
                        to: From
                    });
                    
                    // Record start time for processing metrics
                    const startTime = Date.now();
                    
                    // Now analyze the document with enhanced system
                    const userContextForAnalysis = {
                        phoneNumber: fromNumber,
                        isFreeUser: userStatus.isFree,
                        remainingCredits: userStatus.remainingCredits,
                        previousDocuments: userStatus.user?.document_count || 0,
                        firstTimeUser: (userStatus.user?.document_count || 0) === 0
                    };
                    
                    responseMessage = await analyzeDocument(MediaUrl0, accountSid, authToken, userContextForAnalysis);
                    
                    // Record usage in database - pass user object to avoid additional DB query
                    const processingTime = Date.now() - startTime;
                    await recordUsage(fromNumber, MessageSid, userStatus.isFree, 'document', responseMessage, processingTime, userStatus.user);
                    
                    // Track detailed document analysis behavior
                    await behaviorTracker.trackDocumentAnalysis(fromNumber, {
                        imageSizeMB: 'N/A', // Will be populated inside analyzeDocument function
                        processingTime: processingTime,
                        isFree: userStatus.isFree,
                        imageType: 'N/A', // Will be populated inside analyzeDocument function
                        success: true,
                        queueWaitTime: null, // Could be enhanced to track actual queue time
                        encodingMethod: 'enhanced', // New enhanced analysis method
                        optimizationApplied: true, // Enhanced analysis always applies optimizations
                        analysisResult: responseMessage,
                        creditStatus: userStatus.remainingCredits,
                        analysisType: 'enhanced_document_analysis'
                    });
                    
                } catch (error) {
                    console.error('❌ Document analysis error:', error);
                    
                    // Track error behavior
                    const errorType = error.message.includes('too large') ? 'image_too_large' : 
                                    error.message.includes('Unsupported') ? 'unsupported_format' :
                                    error.message.includes('timeout') ? 'processing_timeout' : 'general_error';
                    
                    await behaviorTracker.trackError(fromNumber, errorType, {
                        message: error.message,
                        context: 'document_analysis',
                        impact: 'high',
                        recoveryAction: 'user_retry_suggested'
                    });
                    
                    responseMessage = `🔸 *عربست* | ❌ *خطأ*

عذراً، حدث خطأ في معالجة الوثيقة.

*جرب:*
• أرسل صورة واضحة
• تأكد أن حجم الصورة أقل من 5MB
• استخدم صيغة JPG أو PNG

🔄 *حاول مرة أخرى*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
                }
            }
        } else {
            // Check for payment requests
            const bodyLower = (Body || '').toLowerCase();
            if (bodyLower.includes('شراء') || bodyLower.includes('رصيد') || bodyLower.includes('دفع') || 
                bodyLower.includes('buy') || bodyLower.includes('payment') || bodyLower.includes('credit')) {
                
                // Track payment inquiry behavior
                await behaviorTracker.trackPaymentBehavior(fromNumber, 'inquiry', {
                    inquiry_type: 'pricing_request',
                    message_content: bodyLower,
                    inquiry_language: bodyLower.includes('شراء') ? 'arabic' : 'english'
                });
                
                responseMessage = `🔸 *عربست* | 💳 *شراء الرصيد*

╔══════════════════════════╗
║ 💰 *خطط الدفع المتاحة* ║
╚══════════════════════════╝

🟢 *€7* - 5 وثائق (€1.40 للوثيقة)
🔵 *€15* - 15 وثيقة (€1 للوثيقة)  
🟡 *€25* - غير محدود شهرياً

💳 *للشراء الآمن عبر PayPal:*
أرسل رقم الخطة التي تريدها:

• *5* للخطة الأساسية (€7)
• *15* للخطة المتقدمة (€15)
• *25* للخطة غير المحدودة (€25)

⚡ *تفعيل فوري بعد الدفع*
🔒 *دفع آمن 100% عبر PayPal*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            } else {
                // Text/greeting message
                responseMessage = `🔸 *عربست* | 🤖 *AI POWERED* 🔸

*مرحباً! أنا عربست، مساعدك الذكي للوثائق الألمانية* 👋

╔══════════════════════════╗
║ 📋 *كيف أساعدك؟* ║
╚══════════════════════════╝

أرسل صورة أي وثيقة ألمانية وسأحللها لك فوراً:

✅ *وثائق الضرائب* (Finanzamt)
✅ *الرسائل القانونية* (Gericht/Polizei)  
✅ *المستندات الطبية* (Krankenkasse)
✅ *الفواتير والمطالبات* (Rechnung/Mahnung)
✅ *أي وثيقة رسمية أخرى*

💡 *تحليل سريع وواضح!*

📸 *أرسل الصورة الآن!*

💳 *للحصول على رصيد إضافي، أرسل "شراء رصيد"*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI* - تحليل ذكي للوثائق الألمانية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            }
        }

        // Send response
        const sentMessage = await client.messages.create({
            body: responseMessage,
            from: whatsappNumber,
            to: From
        });

        console.log('✅ Response sent:', sentMessage.sid);
        
        // Record successful request performance
        const requestTime = Date.now() - requestStartTime;
        recordRequest(requestTime, true);
        autoReport();

        return res.status(200).json({
            success: true,
            messageSid: sentMessage.sid,
            version: "5.1-optimized",
            processingTimeMs: requestTime
        });

    } catch (error) {
        console.error('❌ Webhook error:', error);
        
        // Record failed request performance
        const requestTime = Date.now() - requestStartTime;
        recordRequest(requestTime, false);
        autoReport();
        
        return res.status(200).json({
            success: true,
            error: "Error handled gracefully",
            version: "5.1-optimized",
            processingTimeMs: requestTime
        });
    }
};