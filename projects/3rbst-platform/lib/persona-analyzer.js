// Advanced persona analysis system for WhatsApp bot users
const { getSupabaseClient } = require('./database');

/**
 * User Persona Categories Based on Behavior Analysis
 */
const PERSONA_TYPES = {
    POWER_USER: {
        name: 'Power User',
        description: 'Heavy users who frequently analyze documents and upgrade quickly',
        characteristics: ['High usage frequency', 'Quick to upgrade', 'Diverse document types'],
        businessValue: 'high'
    },
    OCCASIONAL_USER: {
        name: 'Occasional User',
        description: 'Users who analyze documents sporadically, mainly during specific needs',
        characteristics: ['Low to medium frequency', 'Specific document types', 'Hesitant to upgrade'],
        businessValue: 'medium'
    },
    TRIAL_USER: {
        name: 'Trial User', 
        description: 'New users exploring the service, used free document but haven\'t upgraded',
        characteristics: ['Used free credit', 'No purchases yet', 'Recent registration'],
        businessValue: 'potential'
    },
    PREMIUM_SUBSCRIBER: {
        name: 'Premium Subscriber',
        description: 'Paying customers with recurring usage patterns',
        characteristics: ['Active subscription', 'Regular usage', 'High customer lifetime value'],
        businessValue: 'high'
    },
    AT_RISK_USER: {
        name: 'At-Risk User',
        description: 'Previous active users showing declining engagement',
        characteristics: ['Decreased usage', 'Long inactivity periods', 'Subscription not renewed'],
        businessValue: 'retention'
    },
    DOCUMENT_SPECIALIST: {
        name: 'Document Specialist',
        description: 'Users with specific document type patterns (tax, legal, medical)',
        characteristics: ['Focused document types', 'Seasonal patterns', 'Professional usage'],
        businessValue: 'targeted'
    }
};

/**
 * Document type categorization for persona analysis
 */
const DOCUMENT_CATEGORIES = {
    TAX: ['finanzamt', 'steuer', 'tax', 'abrechnung'],
    LEGAL: ['gericht', 'polizei', 'rechtsanwalt', 'legal', 'court'],
    MEDICAL: ['krankenkasse', 'arzt', 'medical', 'health', 'insurance'],
    GOVERNMENT: ['amt', 'behörde', 'government', 'official'],
    BUSINESS: ['rechnung', 'mahnung', 'invoice', 'business', 'commercial'],
    PERSONAL: ['brief', 'letter', 'personal', 'private']
};

class PersonaAnalyzer {
    constructor() {
        this.analysisCache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Analyze user behavior and determine persona
     * @param {string} phoneNumber - User phone number
     * @returns {Object} Persona analysis result
     */
    async analyzeUserPersona(phoneNumber) {
        const client = getSupabaseClient();
        if (!client) {
            return { error: 'Database not available' };
        }

        try {
            console.log(`🎭 Analyzing persona for ${phoneNumber}`);
            
            // Get user data
            const { data: user } = await client
                .from('users')
                .select('*')
                .eq('phone_number', phoneNumber)
                .single();

            if (!user) {
                return { error: 'User not found' };
            }

            // Get usage history
            const { data: usageLogs } = await client
                .from('usage_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100);

            // Get payment history
            const { data: payments } = await client
                .from('payment_transactions')
                .select('*')
                .eq('phone_number', phoneNumber)
                .eq('status', 'completed')
                .order('created_at', { ascending: false });

            // Perform comprehensive analysis
            const behaviorMetrics = this.calculateBehaviorMetrics(user, usageLogs || [], payments || []);
            const documentPatterns = this.analyzeDocumentPatterns(usageLogs || []);
            const usagePatterns = this.analyzeUsagePatterns(usageLogs || []);
            const paymentBehavior = this.analyzePaymentBehavior(payments || []);
            const engagementLevel = this.calculateEngagementLevel(user, usageLogs || []);
            
            // Determine primary persona
            const primaryPersona = this.determinePersona(behaviorMetrics, documentPatterns, paymentBehavior, engagementLevel);
            
            // Generate insights and recommendations
            const insights = this.generateInsights(primaryPersona, behaviorMetrics, documentPatterns);
            const recommendations = this.generateRecommendations(primaryPersona, behaviorMetrics, user);

            const analysis = {
                phoneNumber,
                userId: user.id,
                primaryPersona,
                analysisDate: new Date().toISOString(),
                behaviorMetrics,
                documentPatterns,
                usagePatterns,
                paymentBehavior,
                engagementLevel,
                insights,
                recommendations,
                rawData: {
                    userRecord: user,
                    usageCount: usageLogs?.length || 0,
                    paymentCount: payments?.length || 0
                }
            };

            // Cache the analysis
            this.analysisCache.set(phoneNumber, {
                data: analysis,
                timestamp: Date.now()
            });

            console.log(`✅ Persona analysis completed: ${primaryPersona.name} for ${phoneNumber}`);
            return analysis;

        } catch (error) {
            console.error('❌ Error in persona analysis:', error);
            return { error: error.message };
        }
    }

    /**
     * Calculate key behavior metrics
     */
    calculateBehaviorMetrics(user, usageLogs, payments) {
        const now = new Date();
        const userAge = Math.ceil((now - new Date(user.created_at)) / (1000 * 60 * 60 * 24)); // days
        const lastActive = Math.ceil((now - new Date(user.last_active_at)) / (1000 * 60 * 60 * 24)); // days
        
        // Calculate usage frequency
        const recentUsage = usageLogs.filter(log => {
            const logDate = new Date(log.created_at);
            return (now - logDate) < (30 * 24 * 60 * 60 * 1000); // last 30 days
        });

        const totalSpent = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        const totalDocuments = user.free_documents_used + user.paid_documents_used;
        
        return {
            userAgeDays: userAge,
            lastActiveDays: lastActive,
            totalDocuments,
            documentsLast30Days: recentUsage.length,
            avgDocumentsPerWeek: recentUsage.length > 0 ? (recentUsage.length / 4.3).toFixed(1) : 0,
            totalSpent: parseFloat(totalSpent.toFixed(2)),
            hasUpgraded: payments.length > 0,
            subscriptionTier: user.subscription_tier,
            avgProcessingTime: usageLogs.length > 0 ? 
                Math.round(usageLogs.reduce((sum, log) => sum + (log.processing_time_ms || 0), 0) / usageLogs.length) : 0,
            freeToProcessingRatio: totalDocuments > 0 ? (user.free_documents_used / totalDocuments).toFixed(2) : 1,
            engagementScore: this.calculateEngagementScore(user, usageLogs, payments)
        };
    }

    /**
     * Analyze document type patterns
     */
    analyzeDocumentPatterns(usageLogs) {
        const patterns = {};
        const documentTypes = {};
        let totalAnalyzed = 0;

        // Categorize documents based on analysis content
        usageLogs.forEach(log => {
            if (log.analysis_result) {
                totalAnalyzed++;
                const content = log.analysis_result.toLowerCase();
                
                // Check for document category keywords
                Object.entries(DOCUMENT_CATEGORIES).forEach(([category, keywords]) => {
                    const found = keywords.some(keyword => content.includes(keyword));
                    if (found) {
                        documentTypes[category] = (documentTypes[category] || 0) + 1;
                        return;
                    }
                });

                // If no category found, mark as general
                if (!Object.values(DOCUMENT_CATEGORIES).flat().some(keyword => content.includes(keyword))) {
                    documentTypes['GENERAL'] = (documentTypes['GENERAL'] || 0) + 1;
                }
            }
        });

        // Calculate percentages and find dominant types
        const percentages = {};
        Object.entries(documentTypes).forEach(([type, count]) => {
            percentages[type] = ((count / totalAnalyzed) * 100).toFixed(1);
        });

        const dominantType = Object.entries(percentages)
            .sort(([,a], [,b]) => parseFloat(b) - parseFloat(a))[0];

        return {
            totalAnalyzed,
            documentTypes,
            percentages,
            dominantType: dominantType ? {
                category: dominantType[0],
                percentage: dominantType[1]
            } : null,
            diversity: Object.keys(documentTypes).length,
            isSpecialist: dominantType && parseFloat(dominantType[1]) > 60
        };
    }

    /**
     * Analyze usage patterns (timing, frequency, etc.)
     */
    analyzeUsagePatterns(usageLogs) {
        if (usageLogs.length === 0) return { pattern: 'NO_USAGE' };

        const hourCounts = {};
        const dayOfWeekCounts = {};
        const monthlyUsage = {};
        
        usageLogs.forEach(log => {
            const date = new Date(log.created_at);
            const hour = date.getHours();
            const dayOfWeek = date.getDay();
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
            monthlyUsage[month] = (monthlyUsage[month] || 0) + 1;
        });

        // Find peak usage times
        const peakHour = Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)[0];
        
        const peakDay = Object.entries(dayOfWeekCounts)
            .sort(([,a], [,b]) => b - a)[0];

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return {
            peakHour: peakHour ? `${peakHour[0]}:00` : null,
            peakDay: peakDay ? dayNames[peakDay[0]] : null,
            isWeekdayUser: Object.entries(dayOfWeekCounts)
                .filter(([day]) => day >= 1 && day <= 5)
                .reduce((sum, [, count]) => sum + count, 0) > 
                Object.entries(dayOfWeekCounts)
                .filter(([day]) => day === 0 || day === 6)
                .reduce((sum, [, count]) => sum + count, 0),
            monthlyTrend: this.calculateTrend(Object.values(monthlyUsage)),
            averageSessionGap: this.calculateAverageSessionGap(usageLogs)
        };
    }

    /**
     * Analyze payment behavior patterns
     */
    analyzePaymentBehavior(payments) {
        if (payments.length === 0) {
            return {
                hasPayments: false,
                totalSpent: 0,
                avgOrderValue: 0,
                paymentFrequency: 'never',
                preferredPlan: null
            };
        }

        const totalSpent = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const avgOrderValue = totalSpent / payments.length;
        const planPreferences = {};

        payments.forEach(payment => {
            planPreferences[payment.plan_id] = (planPreferences[payment.plan_id] || 0) + 1;
        });

        const preferredPlan = Object.entries(planPreferences)
            .sort(([,a], [,b]) => b - a)[0];

        return {
            hasPayments: true,
            totalSpent: parseFloat(totalSpent.toFixed(2)),
            avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
            paymentCount: payments.length,
            paymentFrequency: this.determinePaymentFrequency(payments),
            preferredPlan: preferredPlan ? preferredPlan[0] : null,
            planPreferences,
            timeToFirstPayment: this.calculateTimeToFirstPayment(payments),
            isRecurringCustomer: payments.length > 1
        };
    }

    /**
     * Calculate overall engagement level
     */
    calculateEngagementLevel(user, usageLogs) {
        const metrics = this.calculateBehaviorMetrics(user, usageLogs, []);
        const score = metrics.engagementScore;

        let level;
        if (score >= 80) level = 'HIGH';
        else if (score >= 60) level = 'MEDIUM';
        else if (score >= 40) level = 'LOW';
        else level = 'DORMANT';

        return {
            level,
            score,
            factors: this.getEngagementFactors(user, usageLogs)
        };
    }

    /**
     * Determine primary persona based on analysis
     */
    determinePersona(behaviorMetrics, documentPatterns, paymentBehavior, engagementLevel) {
        // Power User: High usage + payments
        if (behaviorMetrics.documentsLast30Days > 10 && paymentBehavior.hasPayments) {
            return PERSONA_TYPES.POWER_USER;
        }

        // Premium Subscriber: Active subscription
        if (behaviorMetrics.subscriptionTier !== 'free' && engagementLevel.level === 'HIGH') {
            return PERSONA_TYPES.PREMIUM_SUBSCRIBER;
        }

        // Document Specialist: High specialization in one area
        if (documentPatterns.isSpecialist && behaviorMetrics.totalDocuments > 3) {
            return PERSONA_TYPES.DOCUMENT_SPECIALIST;
        }

        // At-Risk User: Previous activity but now dormant
        if (behaviorMetrics.lastActiveDays > 30 && behaviorMetrics.totalDocuments > 1) {
            return PERSONA_TYPES.AT_RISK_USER;
        }

        // Trial User: Used free but no upgrade
        if (behaviorMetrics.totalDocuments > 0 && !paymentBehavior.hasPayments) {
            return PERSONA_TYPES.TRIAL_USER;
        }

        // Default to Occasional User
        return PERSONA_TYPES.OCCASIONAL_USER;
    }

    /**
     * Generate actionable insights
     */
    generateInsights(persona, behaviorMetrics, documentPatterns) {
        const insights = [];

        // Usage insights
        if (behaviorMetrics.documentsLast30Days > 5) {
            insights.push({
                type: 'usage',
                insight: `High activity user with ${behaviorMetrics.documentsLast30Days} documents in the last 30 days`,
                impact: 'positive'
            });
        }

        // Specialization insights
        if (documentPatterns.isSpecialist && documentPatterns.dominantType) {
            insights.push({
                type: 'specialization',
                insight: `Specialist in ${documentPatterns.dominantType.category} documents (${documentPatterns.dominantType.percentage}% of usage)`,
                impact: 'targeted'
            });
        }

        // Engagement insights
        if (behaviorMetrics.lastActiveDays > 14) {
            insights.push({
                type: 'engagement',
                insight: `User inactive for ${behaviorMetrics.lastActiveDays} days - potential churn risk`,
                impact: 'negative'
            });
        }

        // Revenue insights
        if (behaviorMetrics.totalSpent > 50) {
            insights.push({
                type: 'revenue',
                insight: `High-value customer with €${behaviorMetrics.totalSpent} total spend`,
                impact: 'positive'
            });
        }

        return insights;
    }

    /**
     * Generate personalized recommendations
     */
    generateRecommendations(persona, behaviorMetrics, user) {
        const recommendations = [];

        switch (persona.name) {
            case 'Power User':
                recommendations.push({
                    type: 'upsell',
                    action: 'Offer unlimited plan with priority support',
                    reason: 'High usage indicates value from service'
                });
                break;

            case 'Trial User':
                recommendations.push({
                    type: 'conversion',
                    action: 'Send targeted promotion with 20% discount',
                    reason: 'Used free document but hasn\'t upgraded yet'
                });
                break;

            case 'At-Risk User':
                recommendations.push({
                    type: 'retention',
                    action: 'Re-engagement campaign with free document offer',
                    reason: 'Declining activity suggests churn risk'
                });
                break;

            case 'Document Specialist':
                recommendations.push({
                    type: 'targeted',
                    action: 'Create specialized content/features for their document type',
                    reason: 'Focused usage pattern suggests specific needs'
                });
                break;
        }

        // Add general recommendations
        if (behaviorMetrics.avgProcessingTime > 15000) {
            recommendations.push({
                type: 'experience',
                action: 'Priority processing for better experience',
                reason: 'Above-average processing times affecting UX'
            });
        }

        return recommendations;
    }

    // Helper methods
    calculateEngagementScore(user, usageLogs, payments) {
        let score = 0;
        
        // Usage frequency (40 points)
        const recentUsage = usageLogs.filter(log => {
            return (Date.now() - new Date(log.created_at)) < (30 * 24 * 60 * 60 * 1000);
        });
        score += Math.min(40, recentUsage.length * 4);

        // Recency (20 points)
        const daysSinceActive = (Date.now() - new Date(user.last_active_at)) / (24 * 60 * 60 * 1000);
        score += Math.max(0, 20 - daysSinceActive);

        // Payment behavior (30 points)
        if (payments.length > 0) {
            score += 20; // Has made payments
            if (payments.length > 1) score += 10; // Recurring customer
        }

        // Tenure (10 points)
        const userAge = (Date.now() - new Date(user.created_at)) / (24 * 60 * 60 * 1000);
        score += Math.min(10, userAge / 10);

        return Math.min(100, Math.round(score));
    }

    getEngagementFactors(user, usageLogs) {
        const factors = [];
        
        const daysSinceActive = (Date.now() - new Date(user.last_active_at)) / (24 * 60 * 60 * 1000);
        if (daysSinceActive < 7) factors.push('Recent activity');
        if (usageLogs.length > 10) factors.push('High usage volume');
        if (user.subscription_tier !== 'free') factors.push('Paying customer');
        
        return factors;
    }

    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const recent = values.slice(-3);
        const older = values.slice(0, -3);
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
        
        if (recentAvg > olderAvg * 1.2) return 'increasing';
        if (recentAvg < olderAvg * 0.8) return 'decreasing';
        return 'stable';
    }

    calculateAverageSessionGap(usageLogs) {
        if (usageLogs.length < 2) return null;
        
        const timestamps = usageLogs.map(log => new Date(log.created_at)).sort((a, b) => a - b);
        const gaps = [];
        
        for (let i = 1; i < timestamps.length; i++) {
            gaps.push(timestamps[i] - timestamps[i-1]);
        }
        
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        return Math.round(avgGap / (24 * 60 * 60 * 1000)); // in days
    }

    determinePaymentFrequency(payments) {
        if (payments.length === 0) return 'never';
        if (payments.length === 1) return 'one-time';
        
        const timeSpan = new Date(payments[0].created_at) - new Date(payments[payments.length - 1].created_at);
        const avgInterval = timeSpan / (payments.length - 1);
        const days = avgInterval / (24 * 60 * 60 * 1000);
        
        if (days < 40) return 'frequent';
        if (days < 90) return 'regular';
        return 'occasional';
    }

    calculateTimeToFirstPayment(payments) {
        if (payments.length === 0) return null;
        
        // This would need user creation date to be accurate
        // For now, return null as we don't have that data easily accessible
        return null;
    }

    /**
     * Get cached analysis if available and not expired
     */
    getCachedAnalysis(phoneNumber) {
        const cached = this.analysisCache.get(phoneNumber);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log(`📋 Using cached persona analysis for ${phoneNumber}`);
            return cached.data;
        }
        return null;
    }
}

module.exports = {
    PersonaAnalyzer,
    PERSONA_TYPES,
    DOCUMENT_CATEGORIES
};