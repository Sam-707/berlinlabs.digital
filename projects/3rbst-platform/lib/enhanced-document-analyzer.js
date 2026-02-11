// Enhanced Document Analyzer - The main orchestrator
// Combines classification, specialized modules, and emotional intelligence

const { DocumentClassifier } = require('./document-classifier');
const SocialBenefitsExpert = require('./response-modules/social-benefits-expert');
const TaxExpert = require('./response-modules/tax-expert');

class EnhancedDocumentAnalyzer {
    constructor() {
        this.classifier = new DocumentClassifier();
        this.experts = {
            'social_benefits_expert': new SocialBenefitsExpert(),
            'tax_expert': new TaxExpert(),
            // We can add more experts: legal_expert, health_expert, immigration_expert
        };
        
        this.fallbackAnalyzer = this.createFallbackAnalyzer();
    }

    /**
     * Main analysis method - transforms raw German text into actionable Arabic guidance
     * @param {string} germanText - Extracted text from document image
     * @param {Object} userContext - User information (persona, history, etc.)
     * @param {Object} imageMetadata - Additional image analysis data
     * @returns {Object} Complete analysis with emotional support and action plan
     */
    async analyzeDocument(germanText, userContext = {}, imageMetadata = {}) {
        console.log('🔍 Starting enhanced document analysis...');
        
        try {
            // Step 1: Classify the document type
            const classification = this.classifier.classifyDocument(germanText, imageMetadata);
            console.log(`📋 Document classified as: ${classification.documentName} (${(classification.confidence * 100).toFixed(1)}% confidence)`);
            
            // Step 2: Get specialized analysis if confidence is high
            let specializedResponse = null;
            if (classification.confidence >= 0.7 && this.experts[classification.responseModule]) {
                console.log(`🎯 Using specialized ${classification.responseModule}...`);
                const expert = this.experts[classification.responseModule];
                specializedResponse = expert.generateResponse(classification, germanText);
            } else {
                console.log('📊 Using fallback analysis - low confidence or no specialized module');
                specializedResponse = this.fallbackAnalyzer.generateResponse(classification, germanText);
            }
            
            // Step 3: Assemble final response with cultural adaptation
            const finalResponse = this.assembleResponse(
                classification, 
                specializedResponse, 
                userContext
            );
            
            // Step 4: Add performance metrics
            const analysisMetrics = this.generateAnalysisMetrics(classification, specializedResponse);
            
            console.log('✅ Enhanced analysis completed successfully');
            
            return {
                success: true,
                classification: classification,
                analysis: finalResponse,
                metadata: {
                    processingTime: Date.now(),
                    confidence: classification.confidence,
                    expertUsed: classification.responseModule,
                    metrics: analysisMetrics
                }
            };
            
        } catch (error) {
            console.error('❌ Enhanced analysis failed:', error);
            
            // Graceful fallback to basic analysis
            return this.generateErrorFallback(germanText, error, userContext);
        }
    }

    /**
     * Assemble the final response with proper Arabic formatting
     */
    assembleResponse(classification, specializedResponse, userContext) {
        const response = {
            header: this.buildHeader(classification, userContext),
            emotionalSupport: specializedResponse.emotionalSupport,
            situationExplanation: this.buildSituationExplanation(classification, specializedResponse),
            actionPlan: this.buildActionPlan(specializedResponse.immediateActions || []),
            options: this.buildOptionsSection(specializedResponse),
            expertAdvice: this.buildExpertAdvice(specializedResponse),
            footer: this.buildFooter(classification, userContext)
        };

        // Format as single message for WhatsApp
        const formattedMessage = this.formatForWhatsApp(response);
        
        return {
            ...response,
            formattedMessage: formattedMessage,
            messageLength: formattedMessage.length,
            estimatedReadTime: Math.ceil(formattedMessage.length / 1000) // ~1000 chars per minute reading Arabic
        };
    }

    /**
     * Build culturally appropriate header
     */
    buildHeader(classification, userContext) {
        const urgencyEmoji = {
            'critical': '🚨',
            'high': '⚠️',
            'medium': '📋',
            'low': '📄'
        };

        const emoji = urgencyEmoji[classification.urgencyLevel] || '📋';
        const docType = this.translateDocumentType(classification.documentType);
        
        return {
            emoji: emoji,
            title: `🔸 *عربست* | ${emoji} *${docType}* 🔸`,
            urgency: classification.urgencyLevel,
            confidence: classification.confidence
        };
    }

    /**
     * Build situation explanation in clear Arabic
     */
    buildSituationExplanation(classification, specializedResponse) {
        let explanation = "";
        
        // Use specialized explanation if available
        if (specializedResponse.situationAnalysis) {
            explanation = specializedResponse.situationAnalysis.explanation;
        } else if (specializedResponse.documentAnalysis) {
            explanation = specializedResponse.documentAnalysis.explanation;
        } else {
            // Generic explanation
            explanation = this.generateGenericExplanation(classification);
        }

        return {
            main: explanation,
            technical: this.addTechnicalContext(classification),
            cultural: this.addCulturalContext(classification)
        };
    }

    /**
     * Build clear, actionable steps
     */
    buildActionPlan(immediateActions) {
        if (!immediateActions || immediateActions.length === 0) {
            return {
                hasActions: false,
                message: "لم يتم تحديد إجراءات محددة - راجع مع خبير للحصول على نصائح شخصية"
            };
        }

        const formattedActions = immediateActions.map((action, index) => {
            let actionText = `**${index + 1}. ${action.title}**`;
            
            if (action.germanPhrase) {
                actionText += `\n📝 *النص الألماني:*\n"${action.germanPhrase}"`;
            }
            
            if (action.explanation) {
                actionText += `\n💡 *الشرح:* ${action.explanation}`;
            }
            
            if (action.timing) {
                actionText += `\n⏰ *التوقيت:* ${action.timing}`;
            }

            if (action.documents && action.documents.length > 0) {
                actionText += `\n📎 *الأوراق المطلوبة:*\n${action.documents.map(doc => `• ${doc}`).join('\n')}`;
            }

            return actionText;
        });

        return {
            hasActions: true,
            count: immediateActions.length,
            actions: formattedActions,
            summary: this.generateActionSummary(immediateActions)
        };
    }

    /**
     * Build options section (payment, appeals, etc.)
     */
    buildOptionsSection(specializedResponse) {
        const options = [];
        
        // Payment options
        if (specializedResponse.paymentOptions) {
            options.push({
                category: "خيارات الدفع",
                emoji: "💳",
                content: this.formatPaymentOptions(specializedResponse.paymentOptions)
            });
        }

        // Legal rights
        if (specializedResponse.legalRights || specializedResponse.appealRights) {
            options.push({
                category: "حقوقك القانونية", 
                emoji: "⚖️",
                content: this.formatLegalRights(specializedResponse.legalRights || specializedResponse.appealRights)
            });
        }

        // Alternative solutions
        if (specializedResponse.alternatives) {
            options.push({
                category: "خيارات أخرى",
                emoji: "🔄", 
                content: specializedResponse.alternatives
            });
        }

        return options;
    }

    /**
     * Build expert advice section
     */
    buildExpertAdvice(specializedResponse) {
        const advice = [];
        
        if (specializedResponse.expertAdvice) {
            advice.push(...specializedResponse.expertAdvice);
        }

        if (specializedResponse.expertInsights) {
            advice.push(...Object.values(specializedResponse.expertInsights));
        }

        // Add confidence building
        if (specializedResponse.successMotivation || specializedResponse.buildConfidence) {
            const confidence = specializedResponse.successMotivation || specializedResponse.buildConfidence;
            advice.push({
                category: "بناء الثقة",
                tips: [
                    confidence.successRate || "معظم الحالات تنحل بالحسنى",
                    confidence.expertise || "خبرة واسعة في حل هذه المشاكل",
                    "تواصلك هو الخطوة الأولى للحل"
                ]
            });
        }

        return advice;
    }

    /**
     * Build footer with support info and next steps
     */
    buildFooter(classification, userContext) {
        let footer = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        footer += "🤖 *عربست AI* - خبير الوثائق الألمانية\n";
        
        // Add follow-up options
        if (classification.urgencyLevel === 'critical') {
            footer += "🔥 *حالة عاجلة* - للمتابعة أرسل 'متابعة عاجلة'\n";
        }
        
        footer += "💡 *للمساعدة الإضافية:* أرسل 'مساعدة' + نوع المشكلة\n";
        footer += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
        
        return footer;
    }

    /**
     * Format complete response for WhatsApp
     */
    formatForWhatsApp(response) {
        let message = "";
        
        // Header
        message += response.header.title + "\n\n";
        
        // Emotional support
        if (response.emotionalSupport && response.emotionalSupport.greeting) {
            message += response.emotionalSupport.greeting + "\n\n";
            message += response.emotionalSupport.mainMessage + "\n\n";
        }
        
        // Situation explanation
        if (response.situationExplanation && response.situationExplanation.main) {
            message += "📋 **شو الوضع بالضبط:**\n";
            message += response.situationExplanation.main + "\n\n";
        }
        
        // Action plan
        if (response.actionPlan.hasActions) {
            message += "🎯 **خطة الحل:**\n\n";
            message += response.actionPlan.actions.join('\n\n') + "\n\n";
        }
        
        // Options
        if (response.options && response.options.length > 0) {
            for (const option of response.options) {
                message += `${option.emoji} **${option.category}:**\n`;
                message += this.formatOptionContent(option.content) + "\n\n";
            }
        }
        
        // Expert advice (keep brief for WhatsApp)
        if (response.expertAdvice && response.expertAdvice.length > 0) {
            message += "💡 **نصائح الخبير:**\n";
            const topAdvice = response.expertAdvice.slice(0, 2); // Limit for readability
            for (const advice of topAdvice) {
                if (advice.tips) {
                    message += `• ${advice.tips[0]}\n`;
                }
            }
            message += "\n";
        }
        
        // Footer
        message += response.footer;
        
        return message;
    }

    /**
     * Generate analysis performance metrics
     */
    generateAnalysisMetrics(classification, specializedResponse) {
        return {
            classificationConfidence: classification.confidence,
            expertModuleUsed: classification.responseModule,
            urgencyLevel: classification.urgencyLevel,
            actionsGenerated: specializedResponse.immediateActions?.length || 0,
            optionsProvided: (specializedResponse.paymentOptions ? 1 : 0) + 
                           (specializedResponse.legalRights ? 1 : 0) + 
                           (specializedResponse.appealRights ? 1 : 0),
            emotionalSupportProvided: !!(specializedResponse.emotionalSupport),
            culturalAdaptationLevel: this.assessCulturalAdaptation(specializedResponse)
        };
    }

    /**
     * Create fallback analyzer for low-confidence classifications
     */
    createFallbackAnalyzer() {
        return {
            generateResponse: (classification, rawText) => {
                return {
                    emotionalSupport: {
                        greeting: "مرحباً! تم استلام وثيقتك",
                        mainMessage: "هذه وثيقة ألمانية رسمية. سأساعدك في فهمها وتحديد الخطوات المطلوبة.",
                        keyPoints: ["وثيقة رسمية", "تحتاج مراجعة", "متوفر للمساعدة"]
                    },
                    situationAnalysis: {
                        explanation: "الوثيقة تحتوي على معلومات مهمة تتطلب إجراء من جانبك. النص معقد ويحتاج شرح مفصل."
                    },
                    immediateActions: [{
                        title: "راجع المحتوى بعناية",
                        explanation: "اقرأ الوثيقة بتمعن وحدد المبالغ والتواريخ المهمة",
                        timing: "فوراً"
                    }, {
                        title: "اطلب مساعدة متخصصة",
                        explanation: "للوثائق المعقدة، من الأفضل استشارة خبير أو محامي",
                        timing: "خلال يومين"
                    }]
                };
            }
        };
    }

    /**
     * Generate error fallback response
     */
    generateErrorFallback(germanText, error, userContext) {
        return {
            success: false,
            error: error.message,
            fallbackAnalysis: {
                message: `🔸 *عربست* | ⚠️ *تحليل أساسي* 🔸

🫶 عذراً! واجهنا صعوبة في التحليل المفصل

📋 **ما استطعنا تحديده:**
هذه وثيقة ألمانية رسمية تتطلب انتباهك

🎯 **الخطوات الأساسية:**
1. ابحث عن المبالغ والتواريخ في الوثيقة
2. حدد جهة الإرسال (مكتب الضرائب، JobCenter، إلخ)
3. اتصل بهم لطلب الشرح بالعربي

💡 **نصيحة مهمة:**
كل الدوائر الحكومية مُلزمة توفر مترجم مجاني

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *عربست AI* - حاول مرة أخرى أو راسلنا للمساعدة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
            }
        };
    }

    // Helper methods
    translateDocumentType(documentType) {
        const translations = {
            'jobcenter_overpayment': 'إشعار استرداد JobCenter',
            'finanzamt_tax': 'وثيقة ضريبية',
            'court_summons': 'استدعاء محكمة',
            'krankenkasse_health': 'وثيقة تأمين صحي',
            'auslanderbehorde_residence': 'وثيقة إقامة',
            'miet_housing': 'وثيقة سكن'
        };
        return translations[documentType] || 'وثيقة ألمانية';
    }

    generateGenericExplanation(classification) {
        return `هذه ${this.translateDocumentType(classification.documentType)} من ${classification.extractedInfo.contacts.departments?.[0] || 'دائرة حكومية'}. تحتاج مراجعة والتصرف حسب المطلوب.`;
    }

    addTechnicalContext(classification) {
        return `المستوى الفني: ${classification.confidence > 0.8 ? 'عالي الدقة' : 'متوسط الدقة'}`;
    }

    addCulturalContext(classification) {
        return "النظام الألماني يتطلب الرد السريع والتعاون - التأخير يعقد الأمور";
    }

    generateActionSummary(actions) {
        return `${actions.length} خطوة${actions.length > 2 ? ' رئيسية' : ''} للحل`;
    }

    formatPaymentOptions(paymentOptions) {
        if (!paymentOptions.options) return "خيارات الدفع غير محددة";
        
        return paymentOptions.options.map(option => 
            `• ${option.option}: ${option.description}`
        ).join('\n');
    }

    formatLegalRights(legalRights) {
        if (!legalRights || !legalRights.length) return "حقوق قانونية قيد التحديد";
        
        return legalRights.slice(0, 3).map(right => 
            `• ${right.right}: ${right.explanation}`
        ).join('\n');
    }

    formatOptionContent(content) {
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) return content.join('\n• ');
        return JSON.stringify(content);
    }

    assessCulturalAdaptation(response) {
        let score = 0;
        if (response.emotionalSupport) score++;
        if (response.expertAdvice) score++;
        if (response.successMotivation) score++;
        return score >= 2 ? 'high' : score === 1 ? 'medium' : 'low';
    }
}

module.exports = EnhancedDocumentAnalyzer;