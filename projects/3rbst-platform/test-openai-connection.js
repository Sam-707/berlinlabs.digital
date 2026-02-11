// Quick test to verify OpenAI connection
require('dotenv').config();

async function testOpenAI() {
    console.log('🧪 Testing OpenAI API connection...');
    
    if (!process.env.OPENAI_API_KEY) {
        console.log('❌ OpenAI API key not found in environment');
        return;
    }
    
    console.log('✅ OpenAI API key found');
    console.log('🔑 Key starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
    
    try {
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
                        role: 'user', 
                        content: 'Say "API connection test successful" in Arabic' 
                    }
                ],
                temperature: 0.4,
                max_tokens: 100
            })
        });

        const data = await response.json();
        console.log('📊 OpenAI Response Status:', response.status);
        
        if (data.error) {
            console.error('❌ OpenAI Error:', JSON.stringify(data.error, null, 2));
        } else if (data.choices && data.choices[0]?.message?.content) {
            console.log('✅ OpenAI Response:', data.choices[0].message.content);
            console.log('🎉 OpenAI API connection is working!');
        } else {
            console.log('⚠️ Unexpected response format:', JSON.stringify(data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
    }
}

testOpenAI();