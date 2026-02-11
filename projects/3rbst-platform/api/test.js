// Simple test endpoint to check what's failing
module.exports = async (req, res) => {
    console.log('🧪 Test endpoint called');
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).send('OK');
    }

    try {
        // Test 1: Environment variables
        console.log('🔑 Testing environment variables...');
        const hasOpenAI = !!process.env.OPENAI_API_KEY;
        const hasTwitter = !!process.env.TWILIO_ACCOUNT_SID;
        
        console.log('OpenAI key present:', hasOpenAI);
        console.log('Twilio key present:', hasTwitter);
        
        if (hasOpenAI) {
            console.log('OpenAI key starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
        }
        
        // Test 2: OpenAI API call
        let openaiTest = { success: false, error: 'Not tested' };
        if (hasOpenAI) {
            console.log('🤖 Testing OpenAI API call...');
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o',
                        messages: [{ role: 'user', content: 'Say "test successful" in Arabic' }],
                        temperature: 0.4,
                        max_tokens: 50
                    })
                });

                const data = await response.json();
                console.log('OpenAI response status:', response.status);
                
                if (data.error) {
                    console.error('OpenAI error:', data.error);
                    openaiTest = { success: false, error: data.error.message };
                } else if (data.choices && data.choices[0]?.message?.content) {
                    console.log('OpenAI response:', data.choices[0].message.content);
                    openaiTest = { success: true, response: data.choices[0].message.content };
                } else {
                    openaiTest = { success: false, error: 'Unexpected response format' };
                }
            } catch (error) {
                console.error('OpenAI fetch error:', error);
                openaiTest = { success: false, error: error.message };
            }
        }
        
        // Return test results
        return res.status(200).json({
            timestamp: new Date().toISOString(),
            environment: {
                openai_key_present: hasOpenAI,
                twilio_key_present: hasTwitter,
                node_version: process.version
            },
            openai_test: openaiTest,
            status: 'Test completed'
        });
        
    } catch (error) {
        console.error('❌ Test error:', error);
        return res.status(500).json({
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
};