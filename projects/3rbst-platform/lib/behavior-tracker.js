// Enhanced behavior tracking for persona analysis
const { getSupabaseClient } = require('./database');

/**
 * Behavior tracking events
 */
const BEHAVIOR_EVENTS = {
    MESSAGE_RECEIVED: 'message_received',
    DOCUMENT_ANALYZED: 'document_analyzed', 
    PAYMENT_INQUIRY: 'payment_inquiry',
    CONSENT_GIVEN: 'consent_given',
    CONSENT_DENIED: 'consent_denied',
    ERROR_ENCOUNTERED: 'error_encountered',
    IMAGE_TOO_LARGE: 'image_too_large',
    UNSUPPORTED_FORMAT: 'unsupported_format',
    QUEUE_TIMEOUT: 'queue_timeout'
};

/**
 * Enhanced behavior data collection
 */
class BehaviorTracker {
    constructor() {
        this.sessionData = new Map(); // Track session-level behaviors
    }

    /**
     * Track user behavior event with rich context
     * @param {string} phoneNumber - User phone number
     * @param {string} eventType - Type of behavior event
     * @param {Object} context - Additional context data
     */
    async trackBehavior(phoneNumber, eventType, context = {}) {
        const client = getSupabaseClient();
        if (!client) {
            console.log('⚠️ Database not available - behavior not tracked');
            return;
        }

        try {
            // Get or create user to ensure we have user_id
            const { data: user } = await client
                .from('users')
                .select('id')
                .eq('phone_number', phoneNumber)
                .single();

            if (!user) {
                console.log('⚠️ User not found for behavior tracking');
                return;
            }

            // Enrich context with session data
            const enrichedContext = this.enrichContextData(phoneNumber, eventType, context);

            // Insert behavior event
            const { error } = await client
                .from('behavior_events')
                .insert([{
                    user_id: user.id,
                    phone_number: phoneNumber,
                    event_type: eventType,
                    context: enrichedContext,
                    session_id: this.getSessionId(phoneNumber),
                    user_agent: 'whatsapp',
                    created_at: new Date().toISOString()
                }]);

            if (error) {
                console.error('❌ Error tracking behavior:', error);
                return;
            }

            console.log(`📊 Behavior tracked: ${eventType} for ${phoneNumber}`);
            
            // Update session data
            this.updateSessionData(phoneNumber, eventType, enrichedContext);

        } catch (error) {
            console.error('❌ Error in behavior tracking:', error);
        }
    }

    /**
     * Track document analysis behavior with detailed metrics
     */
    async trackDocumentAnalysis(phoneNumber, analysisData) {
        const context = {
            document_size_mb: analysisData.imageSizeMB,
            processing_time_ms: analysisData.processingTime,
            was_free_analysis: analysisData.isFree,
            image_type: analysisData.imageType,
            analysis_success: analysisData.success,
            queue_wait_time_ms: analysisData.queueWaitTime,
            encoding_method: analysisData.encodingMethod,
            optimization_applied: analysisData.optimizationApplied,
            detected_document_category: this.detectDocumentCategory(analysisData.analysisResult),
            analysis_length: analysisData.analysisResult?.length || 0,
            user_credit_status: analysisData.creditStatus
        };

        await this.trackBehavior(phoneNumber, BEHAVIOR_EVENTS.DOCUMENT_ANALYZED, context);
    }

    /**
     * Track payment-related behavior
     */
    async trackPaymentBehavior(phoneNumber, paymentAction, context = {}) {
        const enrichedContext = {
            ...context,
            payment_action: paymentAction,
            timestamp: new Date().toISOString()
        };

        await this.trackBehavior(phoneNumber, BEHAVIOR_EVENTS.PAYMENT_INQUIRY, enrichedContext);
    }

    /**
     * Track error events for user experience analysis
     */
    async trackError(phoneNumber, errorType, errorDetails) {
        const context = {
            error_type: errorType,
            error_message: errorDetails.message,
            error_context: errorDetails.context,
            user_impact: errorDetails.impact || 'medium',
            recovery_action: errorDetails.recoveryAction
        };

        await this.trackBehavior(phoneNumber, BEHAVIOR_EVENTS.ERROR_ENCOUNTERED, context);
    }

    /**
     * Enrich context with session and behavioral insights
     */
    enrichContextData(phoneNumber, eventType, baseContext) {
        const sessionData = this.sessionData.get(phoneNumber) || {};
        
        return {
            ...baseContext,
            session_events_count: sessionData.eventCount || 1,
            session_start_time: sessionData.startTime || new Date().toISOString(),
            previous_event_type: sessionData.lastEventType,
            time_since_last_event: sessionData.lastEventTime ? 
                Date.now() - new Date(sessionData.lastEventTime).getTime() : null,
            is_repeat_user: sessionData.isRepeatUser || false,
            device_fingerprint: this.generateDeviceFingerprint(phoneNumber)
        };
    }

    /**
     * Update session-level tracking data
     */
    updateSessionData(phoneNumber, eventType, context) {
        const existing = this.sessionData.get(phoneNumber) || {};
        
        this.sessionData.set(phoneNumber, {
            ...existing,
            eventCount: (existing.eventCount || 0) + 1,
            lastEventType: eventType,
            lastEventTime: new Date().toISOString(),
            startTime: existing.startTime || new Date().toISOString(),
            isRepeatUser: existing.eventCount > 0
        });

        // Clean up old sessions (older than 1 hour)
        if (Math.random() < 0.1) { // 10% chance to clean up
            this.cleanupOldSessions();
        }
    }

    /**
     * Generate session ID for tracking user sessions
     */
    getSessionId(phoneNumber) {
        const existing = this.sessionData.get(phoneNumber);
        if (existing && existing.sessionId) {
            // Check if session is still active (within 30 minutes)
            const sessionAge = Date.now() - new Date(existing.startTime).getTime();
            if (sessionAge < 30 * 60 * 1000) {
                return existing.sessionId;
            }
        }

        // Generate new session ID
        const sessionId = `session_${phoneNumber}_${Date.now()}`;
        this.updateSessionData(phoneNumber, 'SESSION_START', { sessionId });
        return sessionId;
    }

    /**
     * Generate device fingerprint for user identification
     */
    generateDeviceFingerprint(phoneNumber) {
        // Simple fingerprint based on phone number and timestamp patterns
        return `whatsapp_${phoneNumber.slice(-4)}_${Date.now().toString(36)}`;
    }

    /**
     * Detect document category from analysis result
     */
    detectDocumentCategory(analysisResult) {
        if (!analysisResult) return 'unknown';

        const content = analysisResult.toLowerCase();
        const categories = {
            'tax': ['finanzamt', 'steuer', 'tax', 'abrechnung'],
            'legal': ['gericht', 'polizei', 'rechtsanwalt', 'legal', 'court'],
            'medical': ['krankenkasse', 'arzt', 'medical', 'health', 'insurance'],
            'government': ['amt', 'behörde', 'government', 'official'],
            'business': ['rechnung', 'mahnung', 'invoice', 'business'],
            'personal': ['brief', 'letter', 'personal', 'private']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => content.includes(keyword))) {
                return category;
            }
        }

        return 'general';
    }

    /**
     * Clean up old session data to prevent memory leaks
     */
    cleanupOldSessions() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        for (const [phoneNumber, sessionData] of this.sessionData.entries()) {
            if (new Date(sessionData.startTime).getTime() < oneHourAgo) {
                this.sessionData.delete(phoneNumber);
            }
        }
    }

    /**
     * Get real-time session statistics
     */
    getSessionStats() {
        const activeSessions = Array.from(this.sessionData.values()).filter(session => {
            const sessionAge = Date.now() - new Date(session.startTime).getTime();
            return sessionAge < 30 * 60 * 1000; // Active within 30 minutes
        });

        return {
            totalSessions: this.sessionData.size,
            activeSessions: activeSessions.length,
            avgEventsPerSession: activeSessions.length > 0 ? 
                activeSessions.reduce((sum, s) => sum + s.eventCount, 0) / activeSessions.length : 0,
            longestSession: activeSessions.reduce((max, session) => {
                const duration = Date.now() - new Date(session.startTime).getTime();
                return Math.max(max, duration);
            }, 0)
        };
    }
}

// Global instance
const behaviorTracker = new BehaviorTracker();

module.exports = {
    BehaviorTracker,
    behaviorTracker,
    BEHAVIOR_EVENTS
};