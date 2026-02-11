const { DocumentClassifier } = require('./lib/document-classifier');

const classifier = new DocumentClassifier();

const testText = `JobCenter Gelsenkirchen
Team 123 Leistungsabteilung

Sehr geehrte Frau/Herr Ahmed,

wir haben festgestellt, dass Sie im Zeitraum vom Januar 2024 bis März 2024 eine Überzahlung von Bürgergeld in Höhe von 1.153,00 Euro erhalten haben.

Der Grund für die Überzahlung ist eine nicht gemeldete Beschäftigung.

Hiermit fordern wir Sie auf, zu diesem Sachverhalt bis zum 15.09.2024 eine schriftliche Stellungnahme abzugeben.

Rückforderung: 1.153,00 Euro
Bearbeitungsnummer: AZ-12345/2024`;

console.log('🔍 Debug: Classification process\n');

// Test preprocessing
const processedText = testText.toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');

console.log('Original text (first 150 chars):', testText.substring(0, 150));
console.log('Processed text (first 150 chars):', processedText.substring(0, 150));

// Check key words
console.log('\n🔍 Keyword detection:');
console.log('Contains "jobcenter":', processedText.includes('jobcenter'));
console.log('Contains "überzahlung":', processedText.includes('uberzahlung'));
console.log('Contains "rückforderung":', processedText.includes('ruckforderung'));
console.log('Contains "stellungnahme":', processedText.includes('stellungnahme'));
console.log('Contains "bürgergeld":', processedText.includes('burgergeld'));

// Test amounts extraction
console.log('\n💰 Amount extraction:');
const amounts = classifier.extractAmounts(testText);
amounts.forEach((amt, i) => {
    console.log(`Amount ${i+1}: €${amt.amount} (formatted: ${amt.formatted}, context: ${amt.context})`);
});

// Test dates extraction  
console.log('\n📅 Date extraction:');
const dates = classifier.extractDatesWithContext(testText);
dates.forEach((date, i) => {
    console.log(`Date ${i+1}: ${date.original} (context: ${date.context}, isPast: ${date.isPast})`);
});

// Test full classification
console.log('\n🎯 Full classification:');
const result = classifier.classifyDocument(testText);
console.log('Document type:', result.documentName);
console.log('Confidence:', (result.confidence * 100).toFixed(1) + '%');
console.log('Urgency:', result.urgencyLevel);
console.log('Response module:', result.responseModule);
console.log('Extracted amounts:', result.extractedInfo.amounts.length);
console.log('Extracted dates:', result.extractedInfo.dates.length);