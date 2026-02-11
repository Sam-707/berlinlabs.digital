// Advanced German Document Classification System
// Transforms generic document reading into context-aware problem solving

const DOCUMENT_TYPES = {
    JOBCENTER_OVERPAYMENT: {
        id: 'jobcenter_overpayment',
        name: 'JobCenter Overpayment/Reclaim',
        urgency: 'high',
        responseModule: 'social_benefits_expert',
        keywords: {
            primary: ['jobcenter', 'ueberzahlung', 'rueckforderung', 'anhoerung', 'stellungnahme'],
            secondary: ['buergergeld', 'alg2', 'arbeitslosengeld', 'leistung'],
            amounts: ['erstattung', 'betrag', 'summe', 'euro', '€'],
            deadlines: ['frist', 'bis', 'spaetestens', 'datum']
        },
        emotionalContext: 'panic_reduction',
        commonConcerns: ['residency_impact', 'legal_trouble', 'language_barrier']
    },
    
    FINANZAMT_TAX: {
        id: 'finanzamt_tax',
        name: 'Tax Office Document',
        urgency: 'critical',
        responseModule: 'tax_expert',
        keywords: {
            primary: ['finanzamt', 'steuerbescheid', 'einkommensteuer', 'steuer'],
            secondary: ['mahnung', 'vollstreckung', 'pfändung', 'säumnis'],
            amounts: ['nachzahlung', 'erstattung', 'steuerschuld'],
            deadlines: ['zahlungsfrist', 'vollstreckung', 'einspruch']
        },
        emotionalContext: 'financial_anxiety',
        commonConcerns: ['deportation_fear', 'asset_seizure', 'bank_freeze']
    },
    
    COURT_SUMMONS: {
        id: 'court_summons',
        name: 'Court Document',
        urgency: 'critical',
        responseModule: 'legal_expert',
        keywords: {
            primary: ['amtsgericht', 'landgericht', 'ladung', 'termin'],
            secondary: ['klage', 'mahngericht', 'vollstreckung', 'urteil'],
            amounts: ['streitwert', 'kosten', 'schadenersatz'],
            deadlines: ['verhandlung', 'widerspruch', 'berufung']
        },
        emotionalContext: 'legal_panic',
        commonConcerns: ['deportation', 'criminal_record', 'lawyer_costs']
    },
    
    KRANKENKASSE_HEALTH: {
        id: 'krankenkasse_health',
        name: 'Health Insurance Document',
        urgency: 'medium',
        responseModule: 'health_expert',
        keywords: {
            primary: ['krankenkasse', 'versicherung', 'leistung', 'kranken'],
            secondary: ['beitrag', 'rechnung', 'kostenübernahme', 'antrag'],
            amounts: ['zuzahlung', 'erstattung', 'beitrag'],
            deadlines: ['antrag', 'widerspruch', 'zahlung']
        },
        emotionalContext: 'health_anxiety',
        commonConcerns: ['treatment_denial', 'insurance_loss', 'cost_coverage']
    },
    
    AUSLÄNDERBEHÖRDE_RESIDENCE: {
        id: 'auslanderbehorde_residence',
        name: 'Immigration Office Document',
        urgency: 'critical',
        responseModule: 'immigration_expert',
        keywords: {
            primary: ['ausländerbehörde', 'aufenthalt', 'verlängerung', 'visa'],
            secondary: ['abschiebung', 'duldung', 'niederlassung', 'einbürgerung'],
            amounts: ['gebühr', 'kosten', 'bußgeld'],
            deadlines: ['verlängerung', 'antrag', 'ausreise']
        },
        emotionalContext: 'deportation_fear',
        commonConcerns: ['family_separation', 'work_permit', 'document_renewal']
    },
    
    MIET_HOUSING: {
        id: 'miet_housing',
        name: 'Housing/Rent Document',
        urgency: 'high',
        responseModule: 'housing_expert',
        keywords: {
            primary: ['miete', 'vermieter', 'kündigung', 'wohnung'],
            secondary: ['nebenkosten', 'kaution', 'mieterhöhung', 'räumung'],
            amounts: ['miete', 'nebenkosten', 'kaution'],
            deadlines: ['kündigung', 'räumung', 'zahlung']
        },
        emotionalContext: 'housing_insecurity',
        commonConcerns: ['homelessness', 'family_displacement', 'deposit_loss']
    }
};

class DocumentClassifier {
    constructor() {
        this.confidenceThreshold = 0.7;
        this.keywordWeights = {
            primary: 1.0,
            secondary: 0.6,
            amounts: 0.3,
            deadlines: 0.4
        };
        // Special boost for document type combinations
        this.combinationBoost = {
            'jobcenter_uberzahlung': 0.8, // jobcenter + überzahlung
            'finanzamt_steuerbescheid': 0.8, // finanzamt + steuerbescheid
            'gericht_ladung': 0.8 // court + summons
        };
    }

    /**
     * Main classification method - determines document type and urgency
     * @param {string} germanText - Extracted German text from document
     * @param {Object} imageMetadata - Additional context from image analysis
     * @returns {Object} Classification result with confidence and context
     */
    classifyDocument(germanText, imageMetadata = {}) {
        console.log('🔍 Classifying German document...');
        
        // Preprocess text for better matching
        const normalizedText = this.preprocessText(germanText);
        
        // Score each document type
        const scores = {};
        const detectedInfo = {};
        
        for (const [typeKey, typeConfig] of Object.entries(DOCUMENT_TYPES)) {
            const score = this.calculateTypeScore(normalizedText, typeConfig);
            scores[typeKey] = score;
            
            // Store high-confidence detections for potential future use
            if (score.confidence > this.confidenceThreshold) {
                detectedInfo[typeKey] = score;
            }
        }
        
        // Find best match
        const bestMatch = Object.entries(scores)
            .sort(([,a], [,b]) => b.confidence - a.confidence)[0];
        
        const [bestType, bestScore] = bestMatch;
        const typeConfig = DOCUMENT_TYPES[bestType];
        
        // Extract critical information
        const extractedInfo = this.extractCriticalInfo(normalizedText, typeConfig);
        const urgencyAssessment = this.assessUrgency(extractedInfo, typeConfig);
        
        const result = {
            documentType: bestType,
            documentName: typeConfig.name,
            confidence: bestScore.confidence,
            urgencyLevel: urgencyAssessment.level,
            responseModule: typeConfig.responseModule,
            extractedInfo: extractedInfo,
            urgencyFactors: urgencyAssessment.factors,
            emotionalContext: typeConfig.emotionalContext,
            commonConcerns: typeConfig.commonConcerns,
            processingRecommendation: this.getProcessingRecommendation(bestType, bestScore.confidence)
        };
        
        console.log(`✅ Classified as: ${typeConfig.name} (${(bestScore.confidence * 100).toFixed(1)}% confidence)`);
        return result;
    }
    
    /**
     * Preprocess German text for better keyword matching
     */
    preprocessText(text) {
        return text.toLowerCase()
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^\w\s€]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    /**
     * Calculate confidence score for a document type
     */
    calculateTypeScore(text, typeConfig) {
        let totalScore = 0;
        let maxPossibleScore = 0;
        const matchedKeywords = [];
        
        // Check each keyword category
        for (const [category, keywords] of Object.entries(typeConfig.keywords)) {
            const weight = this.keywordWeights[category] || 0.5;
            const categoryMatches = [];
            
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    totalScore += weight;
                    categoryMatches.push(keyword);
                }
                maxPossibleScore += weight;
            }
            
            if (categoryMatches.length > 0) {
                matchedKeywords.push({
                    category: category,
                    matches: categoryMatches,
                    weight: weight
                });
            }
        }
        
        // Apply combination bonuses
        let combinationBonus = 0;
        if (typeConfig.id === 'jobcenter_overpayment') {
            const hasJobcenter = text.includes('jobcenter');
            const hasUberzahlung = text.includes('ueberzahlung') || text.includes('rueckforderung');
            if (hasJobcenter && hasUberzahlung) {
                combinationBonus = this.combinationBoost.jobcenter_uberzahlung;
            }
        }
        
        const baseConfidence = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
        const confidence = Math.min(1.0, baseConfidence + combinationBonus);
        
        return {
            confidence: confidence,
            rawScore: totalScore,
            combinationBonus: combinationBonus,
            matchedKeywords: matchedKeywords
        };
    }
    
    /**
     * Extract critical information specific to document type
     */
    extractCriticalInfo(text, typeConfig) {
        const info = {
            amounts: this.extractAmounts(text),
            dates: this.extractDatesWithContext(text),
            contacts: this.extractContacts(text),
            references: this.extractReferences(text),
            people: this.extractPersonNames(text)
        };
        
        // Add type-specific extraction
        if (typeConfig.id === 'jobcenter_overpayment') {
            info.jobCenterSpecific = {
                team: this.extractTeamInfo(text),
                overpaymentPeriod: this.extractOverpaymentPeriod(text),
                employmentMentioned: this.detectEmploymentMention(text)
            };
        } else if (typeConfig.id === 'finanzamt_tax') {
            info.taxSpecific = {
                taxYear: this.extractTaxYear(text),
                taxType: this.extractTaxType(text),
                assessmentType: this.extractAssessmentType(text)
            };
        }
        
        return info;
    }
    
    /**
     * Extract Euro amounts with context
     */
    extractAmounts(text) {
        // Enhanced regex for German currency format
        const amountRegex = /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+,\d{2})\s*(?:€|Euro|EUR)?/gi;
        const amounts = [];
        let match;
        
        while ((match = amountRegex.exec(text)) !== null) {
            const rawAmount = match[1];
            
            // Convert German format to JavaScript number
            let numericAmount;
            if (rawAmount.includes('.') && rawAmount.includes(',')) {
                // Format: 1.153,00 (German thousands separator + decimal)
                numericAmount = parseFloat(rawAmount.replace(/\./g, '').replace(',', '.'));
            } else if (rawAmount.includes(',')) {
                // Format: 1153,00 (German decimal separator)
                numericAmount = parseFloat(rawAmount.replace(',', '.'));
            } else {
                // Format: 1153 (no decimal)
                numericAmount = parseFloat(rawAmount);
            }
            
            // Only include valid amounts over €1
            if (numericAmount && numericAmount >= 1) {
                const context = this.getAmountContext(text, match.index, match[0].length);
                
                amounts.push({
                    amount: numericAmount,
                    formatted: rawAmount,
                    context: context,
                    position: match.index,
                    originalMatch: match[0]
                });
            }
        }
        
        // Remove duplicates and sort by amount descending
        const uniqueAmounts = amounts.filter((amount, index, self) => 
            self.findIndex(a => a.amount === amount.amount) === index
        );
        
        return uniqueAmounts.sort((a, b) => b.amount - a.amount);
    }
    
    /**
     * Extract dates with contextual meaning
     */
    extractDatesWithContext(text) {
        const dateRegex = /(\d{1,2}\.?\d{1,2}\.?\d{2,4})/g;
        const dates = [];
        let match;
        
        while ((match = dateRegex.exec(text)) !== null) {
            const dateStr = match[1];
            const context = this.getDateContext(text, match.index, match[0].length);
            const parsedDate = this.parseGermanDate(dateStr);
            
            if (parsedDate) {
                dates.push({
                    original: dateStr,
                    parsed: parsedDate,
                    context: context,
                    isPast: parsedDate < new Date(),
                    daysFromNow: Math.ceil((parsedDate - new Date()) / (1000 * 60 * 60 * 24)),
                    urgency: this.assessDateUrgency(parsedDate, context)
                });
            }
        }
        
        return dates.sort((a, b) => a.parsed - b.parsed); // Sort chronologically
    }
    
    /**
     * Get contextual words around an amount
     */
    getAmountContext(text, position, length) {
        const start = Math.max(0, position - 50);
        const end = Math.min(text.length, position + length + 50);
        const context = text.substring(start, end);
        
        // Look for key context words
        const contextWords = ['nachzahlung', 'erstattung', 'rückforderung', 'überzahlung', 
                             'strafe', 'bußgeld', 'kosten', 'gebühr', 'schuld'];
        
        for (const word of contextWords) {
            if (context.includes(word)) {
                return word;
            }
        }
        
        return 'amount';
    }
    
    /**
     * Get contextual meaning for dates
     */
    getDateContext(text, position, length) {
        const start = Math.max(0, position - 30);
        const end = Math.min(text.length, position + length + 30);
        const context = text.substring(start, end);
        
        const contextMapping = {
            'frist': 'deadline',
            'bis': 'deadline',
            'zahlung': 'payment_due',
            'termin': 'appointment',
            'verhandlung': 'hearing',
            'einspruch': 'appeal_deadline',
            'antrag': 'application_deadline'
        };
        
        for (const [keyword, meaning] of Object.entries(contextMapping)) {
            if (context.includes(keyword)) {
                return meaning;
            }
        }
        
        return 'date';
    }
    
    /**
     * Parse German date format to JavaScript Date
     */
    parseGermanDate(dateStr) {
        const cleaned = dateStr.replace(/[^0-9]/g, '');
        
        // Try different formats: DD.MM.YYYY, DD.MM.YY, DDMMYYYY
        const patterns = [
            { regex: /^(\d{2})(\d{2})(\d{4})$/, format: 'DDMMYYYY' },
            { regex: /^(\d{1,2})(\d{1,2})(\d{4})$/, format: 'DDMMYYYY' },
            { regex: /^(\d{1,2})(\d{1,2})(\d{2})$/, format: 'DDMMYY' }
        ];
        
        for (const pattern of patterns) {
            const match = cleaned.match(pattern.regex);
            if (match) {
                let day = parseInt(match[1]);
                let month = parseInt(match[2]);
                let year = parseInt(match[3]);
                
                if (pattern.format === 'DDMMYY') {
                    year = year > 50 ? 1900 + year : 2000 + year;
                }
                
                if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
                    return new Date(year, month - 1, day);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Assess urgency level based on dates and content
     */
    assessUrgency(extractedInfo, typeConfig) {
        const urgencyFactors = [];
        let urgencyLevel = typeConfig.urgency;
        
        // Check for past deadlines
        const pastDeadlines = extractedInfo.dates.filter(d => 
            d.isPast && (d.context === 'deadline' || d.context === 'payment_due')
        );
        
        if (pastDeadlines.length > 0) {
            urgencyFactors.push('past_deadlines');
            urgencyLevel = 'critical';
        }
        
        // Check for upcoming critical dates (within 7 days)
        const upcomingCritical = extractedInfo.dates.filter(d => 
            !d.isPast && d.daysFromNow <= 7 && d.urgency === 'high'
        );
        
        if (upcomingCritical.length > 0) {
            urgencyFactors.push('imminent_deadlines');
            urgencyLevel = urgencyLevel === 'medium' ? 'high' : urgencyLevel;
        }
        
        // Check for large amounts
        const largeAmounts = extractedInfo.amounts.filter(a => a.amount > 1000);
        if (largeAmounts.length > 0) {
            urgencyFactors.push('high_amounts');
        }
        
        // Check for enforcement keywords
        const enforcementKeywords = ['vollstreckung', 'pfändung', 'zwangsvollstreckung', 'gerichtsvollzieher'];
        // This would need the original text - simplified for now
        
        return {
            level: urgencyLevel,
            factors: urgencyFactors
        };
    }
    
    /**
     * Assess individual date urgency
     */
    assessDateUrgency(date, context) {
        const daysFromNow = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysFromNow < 0) return 'past_due';
        if (daysFromNow <= 3) return 'immediate';
        if (daysFromNow <= 7) return 'urgent';
        if (daysFromNow <= 14) return 'important';
        return 'future';
    }
    
    /**
     * Extract contact information (emails, phone numbers, departments)
     */
    extractContacts(text) {
        const contacts = [];
        
        // Email regex
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = text.match(emailRegex) || [];
        
        // Phone regex (German format)
        const phoneRegex = /(?:\+49|0)\s?\d{2,4}\s?\d{3,}\s?\d{3,}/g;
        const phones = text.match(phoneRegex) || [];
        
        // Team/Department references
        const teamRegex = /team\s?(\d+)/gi;
        const teams = text.match(teamRegex) || [];
        
        return {
            emails: emails,
            phones: phones,
            teams: teams.map(t => t.toLowerCase()),
            departments: this.extractDepartments(text)
        };
    }
    
    /**
     * Extract department/office names
     */
    extractDepartments(text) {
        const departments = [];
        const departmentKeywords = [
            'jobcenter', 'finanzamt', 'ausländerbehörde', 'krankenkasse',
            'amtsgericht', 'landgericht', 'sozialamt', 'arbeitsamt'
        ];
        
        for (const keyword of departmentKeywords) {
            if (text.includes(keyword)) {
                departments.push(keyword);
            }
        }
        
        return departments;
    }
    
    /**
     * Extract reference numbers (Aktenzeichen, etc.)
     */
    extractReferences(text) {
        const refRegex = /(?:az|aktenzeichen|zeichen|ref|nr)[\s.:]*([a-zA-Z0-9\/\-\.]+)/gi;
        const references = [];
        let match;
        
        while ((match = refRegex.exec(text)) !== null) {
            references.push({
                type: match[0].split(/[\s.:]/)[0].toLowerCase(),
                number: match[1],
                full: match[0]
            });
        }
        
        return references;
    }
    
    /**
     * Extract person names (basic implementation)
     */
    extractPersonNames(text) {
        // This is a simplified version - would need more sophisticated NER
        const namePatterns = [
            /(?:herr|frau|mr|mrs)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
            /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s+geboren)/gi
        ];
        
        const names = [];
        for (const pattern of namePatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                names.push(match[1]);
            }
        }
        
        return [...new Set(names)]; // Remove duplicates
    }
    
    /**
     * Extract JobCenter-specific information
     */
    extractTeamInfo(text) {
        const teamMatch = text.match(/team\s?(\d+)/i);
        return teamMatch ? teamMatch[1] : null;
    }
    
    extractOverpaymentPeriod(text) {
        // Extract period mentions like "Januar 2023 bis März 2023"
        const periodRegex = /(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+\d{4}\s+bis\s+(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+\d{4}/i;
        const match = text.match(periodRegex);
        return match ? match[0] : null;
    }
    
    detectEmploymentMention(text) {
        const employmentKeywords = ['beschäftigung', 'arbeit', 'job', 'anstellung', 'erwerbstätigkeit'];
        return employmentKeywords.some(keyword => text.includes(keyword));
    }
    
    /**
     * Get processing recommendation based on classification
     */
    getProcessingRecommendation(documentType, confidence) {
        if (confidence < 0.7) {
            return {
                approach: 'generic_analysis',
                reason: 'Low confidence in document type classification',
                fallback: 'Use general document analysis with basic extraction'
            };
        }
        
        return {
            approach: 'specialized_analysis',
            reason: 'High confidence classification enables specialized response',
            module: DOCUMENT_TYPES[documentType].responseModule
        };
    }
}

module.exports = {
    DocumentClassifier,
    DOCUMENT_TYPES
};