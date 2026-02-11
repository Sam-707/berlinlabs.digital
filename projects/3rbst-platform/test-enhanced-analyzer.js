const EnhancedDocumentAnalyzer = require('./lib/enhanced-document-analyzer');

async function testEnhancedAnalyzer() {
    const analyzer = new EnhancedDocumentAnalyzer();

    // Test with realistic JobCenter document text
    const testText = `JobCenter Gelsenkirchen
Team 123 Leistungsabteilung

Sehr geehrte Frau/Herr Ahmed,

wir haben festgestellt, dass Sie im Zeitraum vom Januar 2024 bis März 2024 eine Überzahlung von Bürgergeld in Höhe von 1.153,00 Euro erhalten haben.

Der Grund für die Überzahlung ist eine nicht gemeldete Beschäftigung.

Hiermit fordern wir Sie auf, zu diesem Sachverhalt bis zum 15.09.2024 eine schriftliche Stellungnahme abzugeben.

Rückforderung: 1.153,00 Euro
Bearbeitungsnummer: AZ-12345/2024`;

    console.log('🧪 Testing enhanced document analysis system...');
    console.log('📄 Test document length:', testText.length, 'characters\n');

    try {
        const userContext = { 
            phoneNumber: '+491234567890', 
            firstTimeUser: false,
            previousDocuments: 3
        };
        
        const result = await analyzer.analyzeDocument(testText, userContext);

        console.log('✅ Test successful!\n');
        console.log('📊 **Analysis Results:**');
        console.log('Classification:', result.classification.documentName);
        console.log('Confidence:', (result.classification.confidence * 100).toFixed(1) + '%');
        console.log('Expert module:', result.classification.responseModule);
        console.log('Urgency:', result.classification.urgencyLevel);
        console.log('Emotional context:', result.classification.emotionalContext);
        
        console.log('\n📄 **Extracted Information:**');
        console.log('Amounts found:', result.classification.extractedInfo.amounts.length);
        result.classification.extractedInfo.amounts.forEach((amt, i) => {
            console.log(`  Amount ${i+1}: €${amt.formatted} (${amt.context})`);
        });
        
        console.log('Dates found:', result.classification.extractedInfo.dates.length);
        result.classification.extractedInfo.dates.forEach((date, i) => {
            console.log(`  Date ${i+1}: ${date.original} (${date.context}, ${date.isPast ? 'PAST' : 'FUTURE'})`);
        });
        
        console.log('People found:', result.classification.extractedInfo.people.length);
        result.classification.extractedInfo.people.forEach((person, i) => {
            console.log(`  Person ${i+1}: ${person}`);
        });
        
        console.log('\n📝 **Response Analysis:**');
        console.log('Message length:', result.analysis.messageLength, 'characters');
        console.log('Estimated read time:', result.analysis.estimatedReadTime, 'minutes');
        
        console.log('\n📱 **WhatsApp Formatted Response:**');
        console.log('━'.repeat(50));
        console.log(result.analysis.formattedMessage.substring(0, 600) + '...');
        console.log('━'.repeat(50));
        
        console.log('\n🎯 **Performance Metrics:**');
        console.log('Processing time:', result.metadata.processingTime + 'ms');
        console.log('Expert used:', result.metadata.expertUsed);
        console.log('Metrics:', JSON.stringify(result.metadata.metrics, null, 2));
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

testEnhancedAnalyzer();