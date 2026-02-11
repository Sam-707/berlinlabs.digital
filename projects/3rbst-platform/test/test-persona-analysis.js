// Test script for improved persona-based document analysis
require('dotenv').config({ path: '../.env' });

// Mock the analyzeDocument function to test without sending real WhatsApp messages
async function analyzeDocument(imageUrl) {
    try {
        console.log('🧠 Testing improved persona-based analysis...');
        console.log('📸 Image URL:', imageUrl);
        
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        const prompt = `You are عربست (3rbst) AI - an expert German document analyst helping Arabic speakers navigate German bureaucracy.

TASK: Analyze this German document with deep expertise and cultural understanding.

PERSONA INSTRUCTIONS:
- Detect the document type first (tax, legal, medical, social services, insurance, etc.)
- Choose the appropriate persona voice:
  * TAX/FINANCIAL: Speak as an experienced accountant friend who's helped many people
  * LEGAL: Speak as a smart legal advisor who knows how to solve problems
  * MEDICAL: Speak as a caring family doctor who prioritizes health
  * GOVERNMENT/SOCIAL: Speak as a helpful community guide who knows the system
  * INSURANCE: Speak as a protective insurance expert
  * OTHER: Speak as a knowledgeable friend who's seen this before

ANALYSIS REQUIREMENTS:
1. READ the document completely and understand its PURPOSE
2. IDENTIFY key information: amounts, dates, deadlines, requirements
3. EXPLAIN what the person needs to DO in practical steps
4. WARN about any risks, deadlines, or important consequences
5. PROVIDE insider tips that only an expert would know

OUTPUT FORMAT:

🔸 *عربست* | 🤖 *AI POWERED* 🔸

[PERSONA GREETING - match the document type with appropriate tone]

╔══════════════════════════╗
║ 🔍 *ما هذه الوثيقة؟* ║
╚══════════════════════════╝

[Explain what this document IS and WHY they received it - be specific]

╔══════════════════════════╗
║ 💰 *الأرقام المهمة* ║
╚══════════════════════════╝

[List all important amounts, dates, reference numbers, periods - be accurate]

╔══════════════════════════╗
║ ⚡ *ماذا تفعل الآن؟* ║  
╚══════════════════════════╝

[Step-by-step action plan - be specific about WHERE to go, WHAT to bring, WHEN to do it]

╔══════════════════════════╗
║ ⚠️ *تحذيرات خطيرة* ║
╚══════════════════════════╝

[Critical warnings about deadlines, penalties, or consequences - only if present]

╔══════════════════════════╗
║ 💡 *نصائح الخبراء* ║
╚══════════════════════════╝

[Insider tips, tricks, or advice that would help - based on document type]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI* | تحليل خبير للوثائق الألمانية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL INSTRUCTIONS:
- Write in natural, conversational Arabic - like explaining to a friend
- Be accurate with numbers, dates, and official names
- Focus on ACTIONABLE advice, not just translation
- Show expertise - explain WHY things are important
- Be empathetic but professional
- If you can't read something clearly, say so honestly`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { 
                        role: 'system', 
                        content: prompt 
                    },
                    { 
                        role: 'user', 
                        content: [
                            { 
                                type: 'text', 
                                text: 'أحتاج مساعدتك في فهم هذه الوثيقة الألمانية. حلل الوثيقة بخبرة وأعطني نصائح عملية حول ما يجب أن أفعله. استخدم الشخصية المناسبة لنوع الوثيقة.' 
                            },
                            { 
                                type: 'image_url', 
                                image_url: { 
                                    url: imageUrl, 
                                    detail: 'high' 
                                } 
                            }
                        ]
                    }
                ],
                temperature: 0.4,
                max_tokens: 3000
            })
        });

        const data = await response.json();
        console.log('📊 OpenAI Response Status:', response.status);

        if (data.error) {
            console.error('❌ OpenAI Error:', JSON.stringify(data.error, null, 2));
            return null;
        }

        if (data.choices && data.choices[0]?.message?.content) {
            const analysis = data.choices[0].message.content;
            console.log('✅ Analysis completed successfully');
            console.log('\n=== ANALYSIS RESULT ===');
            console.log(analysis);
            console.log('=== END RESULT ===\n');
            
            return analysis;
        }

        throw new Error('No content in response');

    } catch (error) {
        console.error('❌ Analysis error:', error);
        return null;
    }
}

// Test with a sample document URL
async function runTest() {
    console.log('🧪 Starting persona analysis test...\n');
    
    // You can test with any public image URL of a German document
    const testImageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gAfQ29tcHJlc3NlZCBieSBqcGVnLXJlY29tcHJlc3P/2wCEAAQEBAQEBAQEBAQGBgUGBggHBwcHCAwJCQkJCQwTCwwLCwwLExAMDAwMDBAYEBAYJiIeHiYwMDAuLyIxMDMuMTcBBAQEBAQEBAQEBAYGBQYGCAcHBwcIDAkJCQkJDBMLCwsLCwsTEAwMDAwMEBgQEBgmIh4eJjAwMC4vIjEwMy4xN//AABEIAQABAAMBIgACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APH6ACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD//9k=';
    
    const result = await analyzeDocument(testImageUrl);
    
    if (result) {
        console.log('🎉 Test completed successfully!');
        console.log('📊 Analysis quality: High - Persona-based response generated');
    } else {
        console.log('❌ Test failed - No analysis generated');
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
    // If URL provided as argument, use it
    runTest(args[0]);
} else {
    // Run with sample data
    runTest();
}

console.log('\n🔧 Usage: node test-persona-analysis.js [image-url]');
console.log('💡 Tip: Use a real German document image URL for better testing');