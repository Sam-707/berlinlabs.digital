// Persona Analysis API for admin dashboard and user insights
const { PersonaAnalyzer, PERSONA_TYPES } = require('../lib/persona-analyzer');
const { getSupabaseClient } = require('../lib/database');

const personaAnalyzer = new PersonaAnalyzer();

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).send('OK');
    }
    
    if (req.method === 'GET') {
        const { phoneNumber, action = 'analyze', limit = 50, offset = 0 } = req.query;
        
        try {
            switch (action) {
                case 'analyze':
                    if (!phoneNumber) {
                        return res.status(400).json({ error: 'phoneNumber parameter required' });
                    }
                    
                    const analysis = await personaAnalyzer.analyzeUserPersona(phoneNumber);
                    
                    if (analysis.error) {
                        return res.status(404).json(analysis);
                    }
                    
                    return res.status(200).json({
                        success: true,
                        data: analysis
                    });
                
                case 'bulk-analysis':
                    const bulkAnalysis = await getBulkPersonaAnalysis(parseInt(limit), parseInt(offset));
                    return res.status(200).json({
                        success: true,
                        data: bulkAnalysis
                    });
                
                case 'persona-distribution':
                    const distribution = await getPersonaDistribution();
                    return res.status(200).json({
                        success: true,
                        data: distribution
                    });
                
                case 'segment-insights':
                    const insights = await getSegmentInsights();
                    return res.status(200).json({
                        success: true,
                        data: insights
                    });
                
                case 'behavioral-patterns':
                    const patterns = await getBehavioralPatterns();
                    return res.status(200).json({
                        success: true,
                        data: patterns
                    });
                
                default:
                    return res.status(400).json({ error: 'Invalid action parameter' });
            }
            
        } catch (error) {
            console.error('❌ Persona analysis API error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};

/**
 * Analyze multiple users in bulk using the materialized view for performance
 */
async function getBulkPersonaAnalysis(limit = 50, offset = 0) {
    const client = getSupabaseClient();
    if (!client) {
        throw new Error('Database not available');
    }

    console.log(`📊 Running bulk persona analysis (limit: ${limit}, offset: ${offset})`);
    
    // Use the materialized view for faster bulk analysis
    const { data: users, error } = await client
        .from('user_persona_metrics')
        .select('*')
        .order('documents_last_30_days', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        throw new Error(`Database query failed: ${error.message}`);
    }

    const results = [];
    
    for (const user of users || []) {
        // Quick persona determination using pre-calculated metrics
        const persona = determinePersonaFromMetrics(user);
        const insights = generateQuickInsights(user, persona);
        const businessValue = calculateBusinessValue(user, persona);
        
        results.push({
            phoneNumber: user.phone_number,
            userId: user.id,
            persona: persona,
            insights: insights,
            businessValue: businessValue,
            metrics: {
                totalDocuments: user.total_documents_analyzed,
                documentsLast30Days: user.documents_last_30_days,
                totalSpent: parseFloat(user.total_spent || 0),
                subscriptionTier: user.subscription_tier,
                daysSinceLastActive: user.days_since_last_active,
                dominantCategory: user.dominant_document_category
            }
        });
    }

    return {
        users: results,
        totalAnalyzed: results.length,
        pagination: {
            limit,
            offset,
            hasMore: results.length === limit
        }
    };
}

/**
 * Get persona distribution across all users
 */
async function getPersonaDistribution() {
    const client = getSupabaseClient();
    if (!client) {
        throw new Error('Database not available');
    }

    // Refresh materialized view for accurate data
    await client.rpc('refresh_persona_metrics');

    const { data: users, error } = await client
        .from('user_persona_metrics')
        .select('*');

    if (error) {
        throw new Error(`Database query failed: ${error.message}`);
    }

    const distribution = {};
    const categoryDistribution = {};
    const tierDistribution = {};
    let totalRevenue = 0;
    let totalUsers = users?.length || 0;

    // Analyze each user and categorize
    (users || []).forEach(user => {
        const persona = determinePersonaFromMetrics(user);
        
        // Count personas
        distribution[persona.name] = (distribution[persona.name] || 0) + 1;
        
        // Count document categories
        if (user.dominant_document_category) {
            categoryDistribution[user.dominant_document_category] = 
                (categoryDistribution[user.dominant_document_category] || 0) + 1;
        }
        
        // Count subscription tiers
        tierDistribution[user.subscription_tier] = 
            (tierDistribution[user.subscription_tier] || 0) + 1;
            
        // Sum revenue
        totalRevenue += parseFloat(user.total_spent || 0);
    });

    // Calculate percentages
    const personaPercentages = {};
    Object.keys(distribution).forEach(persona => {
        personaPercentages[persona] = ((distribution[persona] / totalUsers) * 100).toFixed(1);
    });

    return {
        totalUsers,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageRevenuePerUser: parseFloat((totalRevenue / totalUsers).toFixed(2)),
        personaDistribution: distribution,
        personaPercentages: personaPercentages,
        documentCategoryDistribution: categoryDistribution,
        subscriptionTierDistribution: tierDistribution,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Get insights by user segment
 */
async function getSegmentInsights() {
    const client = getSupabaseClient();
    if (!client) {
        throw new Error('Database not available');
    }

    // Get behavioral events for deeper insights
    const { data: behaviorEvents, error: behaviorError } = await client
        .from('behavior_events')
        .select('event_type, context, created_at, phone_number')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

    if (behaviorError) {
        console.warn('Could not fetch behavior events:', behaviorError);
    }

    const { data: users } = await client
        .from('user_persona_metrics')
        .select('*');

    // Segment insights
    const segments = {
        highValue: users?.filter(u => parseFloat(u.total_spent || 0) > 50) || [],
        active: users?.filter(u => u.documents_last_30_days > 5) || [],
        atRisk: users?.filter(u => u.days_since_last_active > 14 && u.total_documents_analyzed > 0) || [],
        newUsers: users?.filter(u => u.user_age_days <= 7) || [],
        specialists: users?.filter(u => u.dominant_document_category !== 'general' && u.total_documents_analyzed > 3) || []
    };

    // Behavior insights from events
    const behaviorInsights = {
        totalEvents: behaviorEvents?.length || 0,
        errorRate: 0,
        paymentInquiries: 0,
        documentAnalyses: 0
    };

    if (behaviorEvents) {
        behaviorInsights.errorRate = ((behaviorEvents.filter(e => e.event_type === 'error_encountered').length / behaviorEvents.length) * 100).toFixed(1);
        behaviorInsights.paymentInquiries = behaviorEvents.filter(e => e.event_type === 'payment_inquiry').length;
        behaviorInsights.documentAnalyses = behaviorEvents.filter(e => e.event_type === 'document_analyzed').length;
    }

    return {
        segments: {
            highValue: {
                count: segments.highValue.length,
                avgRevenue: segments.highValue.length > 0 ? 
                    (segments.highValue.reduce((sum, u) => sum + parseFloat(u.total_spent || 0), 0) / segments.highValue.length).toFixed(2) : 0,
                characteristics: ['High spending', 'Regular usage', 'Low churn risk']
            },
            active: {
                count: segments.active.length,
                avgDocuments: segments.active.length > 0 ?
                    (segments.active.reduce((sum, u) => sum + u.documents_last_30_days, 0) / segments.active.length).toFixed(1) : 0,
                characteristics: ['High engagement', 'Frequent usage', 'Product evangelists']
            },
            atRisk: {
                count: segments.atRisk.length,
                avgInactivityDays: segments.atRisk.length > 0 ?
                    (segments.atRisk.reduce((sum, u) => sum + u.days_since_last_active, 0) / segments.atRisk.length).toFixed(0) : 0,
                characteristics: ['Declining engagement', 'Churn risk', 'Re-engagement needed']
            },
            newUsers: {
                count: segments.newUsers.length,
                conversionRate: segments.newUsers.length > 0 ?
                    ((segments.newUsers.filter(u => parseFloat(u.total_spent || 0) > 0).length / segments.newUsers.length) * 100).toFixed(1) : 0,
                characteristics: ['Trial period', 'Learning curve', 'High potential']
            },
            specialists: {
                count: segments.specialists.length,
                categories: [...new Set(segments.specialists.map(u => u.dominant_document_category))],
                characteristics: ['Focused usage', 'Domain expertise', 'Targeted needs']
            }
        },
        behaviorInsights,
        recommendations: generateSegmentRecommendations(segments),
        analysisDate: new Date().toISOString()
    };
}

/**
 * Get behavioral patterns analysis
 */
async function getBehavioralPatterns() {
    const client = getSupabaseClient();
    if (!client) {
        throw new Error('Database not available');
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get recent behavior events
    const { data: events } = await client
        .from('behavior_events')
        .select('*')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false });

    // Get usage patterns
    const { data: usage } = await client
        .from('usage_logs')
        .select('created_at, document_category, processing_time_ms, was_free')
        .gte('created_at', thirtyDaysAgo);

    const patterns = {
        hourlyDistribution: analyzeHourlyPatterns(events || [], usage || []),
        dailyDistribution: analyzeDailyPatterns(events || [], usage || []),
        documentTypes: analyzeDocumentTypePatterns(usage || []),
        errorPatterns: analyzeErrorPatterns(events || []),
        conversionFunnel: analyzeConversionFunnel(events || [])
    };

    return patterns;
}

// Helper functions for persona determination and analysis
function determinePersonaFromMetrics(userMetrics) {
    const {
        documents_last_30_days,
        total_spent,
        subscription_tier,
        days_since_last_active,
        total_documents_analyzed,
        user_age_days
    } = userMetrics;

    // Power User: High recent usage + payments
    if (documents_last_30_days > 10 && parseFloat(total_spent || 0) > 0) {
        return PERSONA_TYPES.POWER_USER;
    }

    // Premium Subscriber: Active subscription
    if (subscription_tier !== 'free' && days_since_last_active < 14) {
        return PERSONA_TYPES.PREMIUM_SUBSCRIBER;
    }

    // At-Risk User: Previous activity but now dormant
    if (days_since_last_active > 30 && total_documents_analyzed > 1) {
        return PERSONA_TYPES.AT_RISK_USER;
    }

    // Trial User: Used service but no upgrade
    if (total_documents_analyzed > 0 && parseFloat(total_spent || 0) === 0) {
        return PERSONA_TYPES.TRIAL_USER;
    }

    // New user or occasional user
    return PERSONA_TYPES.OCCASIONAL_USER;
}

function generateQuickInsights(userMetrics, persona) {
    const insights = [];
    
    if (userMetrics.documents_last_30_days > 5) {
        insights.push({
            type: 'engagement',
            message: `High activity: ${userMetrics.documents_last_30_days} documents this month`,
            impact: 'positive'
        });
    }
    
    if (parseFloat(userMetrics.total_spent || 0) > 25) {
        insights.push({
            type: 'revenue',
            message: `High-value customer: €${userMetrics.total_spent} lifetime value`,
            impact: 'positive'
        });
    }
    
    if (userMetrics.days_since_last_active > 14) {
        insights.push({
            type: 'retention',
            message: `Inactive for ${userMetrics.days_since_last_active} days - churn risk`,
            impact: 'negative'
        });
    }
    
    return insights;
}

function calculateBusinessValue(userMetrics, persona) {
    const totalSpent = parseFloat(userMetrics.total_spent || 0);
    const recentActivity = userMetrics.documents_last_30_days;
    const tierValue = userMetrics.subscription_tier === 'unlimited' ? 3 : 
                     userMetrics.subscription_tier === 'premium' ? 2 : 1;
    
    let score = 0;
    score += Math.min(50, totalSpent * 2); // Revenue component
    score += Math.min(30, recentActivity * 3); // Activity component  
    score += tierValue * 10; // Tier component
    score -= Math.max(0, userMetrics.days_since_last_active - 7); // Recency penalty
    
    const normalizedScore = Math.max(0, Math.min(100, score));
    
    let category;
    if (normalizedScore >= 80) category = 'high';
    else if (normalizedScore >= 50) category = 'medium';
    else if (normalizedScore >= 25) category = 'low';
    else category = 'minimal';
    
    return {
        score: Math.round(normalizedScore),
        category,
        ltv: totalSpent,
        potential: persona.businessValue
    };
}

// Analysis helper functions
function analyzeHourlyPatterns(events, usage) {
    const hourCounts = {};
    
    [...events, ...usage].forEach(item => {
        const hour = new Date(item.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return hourCounts;
}

function analyzeDailyPatterns(events, usage) {
    const dayCounts = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    [...events, ...usage].forEach(item => {
        const day = dayNames[new Date(item.created_at).getDay()];
        dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    return dayCounts;
}

function analyzeDocumentTypePatterns(usage) {
    const typeCounts = {};
    
    usage.forEach(log => {
        if (log.document_category) {
            typeCounts[log.document_category] = (typeCounts[log.document_category] || 0) + 1;
        }
    });
    
    return typeCounts;
}

function analyzeErrorPatterns(events) {
    const errorEvents = events.filter(e => e.event_type === 'error_encountered');
    const errorTypes = {};
    
    errorEvents.forEach(event => {
        const errorType = event.context?.error_type || 'unknown';
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });
    
    return {
        totalErrors: errorEvents.length,
        errorTypes,
        errorRate: events.length > 0 ? ((errorEvents.length / events.length) * 100).toFixed(1) : 0
    };
}

function analyzeConversionFunnel(events) {
    const messageReceived = events.filter(e => e.event_type === 'message_received').length;
    const documentAnalyzed = events.filter(e => e.event_type === 'document_analyzed').length;
    const paymentInquiry = events.filter(e => e.event_type === 'payment_inquiry').length;
    
    return {
        messageReceived,
        documentAnalyzed,
        paymentInquiry,
        analysisRate: messageReceived > 0 ? ((documentAnalyzed / messageReceived) * 100).toFixed(1) : 0,
        inquiryRate: documentAnalyzed > 0 ? ((paymentInquiry / documentAnalyzed) * 100).toFixed(1) : 0
    };
}

function generateSegmentRecommendations(segments) {
    const recommendations = [];
    
    if (segments.atRisk.length > 0) {
        recommendations.push({
            segment: 'at-risk',
            action: 'Launch re-engagement campaign with free document offer',
            priority: 'high',
            expectedImpact: 'Reduce churn by 20-30%'
        });
    }
    
    if (segments.newUsers.length > 0) {
        recommendations.push({
            segment: 'new-users',
            action: 'Implement onboarding sequence and first-week follow-up',
            priority: 'medium',
            expectedImpact: 'Increase conversion rate by 15-25%'
        });
    }
    
    if (segments.highValue.length > 0) {
        recommendations.push({
            segment: 'high-value',
            action: 'Offer premium support and exclusive features',
            priority: 'medium',
            expectedImpact: 'Increase retention and upsell opportunities'
        });
    }
    
    return recommendations;
}