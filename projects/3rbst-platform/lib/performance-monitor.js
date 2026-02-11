// Performance monitoring and alerting system
const performanceMetrics = {
    requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimes: []
    },
    openai: {
        calls: 0,
        totalTime: 0,
        averageTime: 0,
        errors: 0
    },
    database: {
        queries: 0,
        totalTime: 0,
        averageTime: 0,
        cacheHits: 0,
        cacheMisses: 0
    }
};

// Performance thresholds for alerting
const PERFORMANCE_THRESHOLDS = {
    MAX_RESPONSE_TIME: 30000, // 30 seconds
    MAX_OPENAI_TIME: 25000,   // 25 seconds
    MAX_DB_TIME: 5000,        // 5 seconds
    ERROR_RATE_THRESHOLD: 0.1 // 10% error rate
};

function recordRequest(responseTimeMs, success = true) {
    performanceMetrics.requests.total++;
    
    if (success) {
        performanceMetrics.requests.successful++;
    } else {
        performanceMetrics.requests.failed++;
    }
    
    // Keep only last 100 response times for average calculation
    performanceMetrics.requests.responseTimes.push(responseTimeMs);
    if (performanceMetrics.requests.responseTimes.length > 100) {
        performanceMetrics.requests.responseTimes.shift();
    }
    
    // Calculate average response time
    const sum = performanceMetrics.requests.responseTimes.reduce((a, b) => a + b, 0);
    performanceMetrics.requests.averageResponseTime = sum / performanceMetrics.requests.responseTimes.length;
    
    // Check for performance alerts
    if (responseTimeMs > PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME) {
        console.warn(`🚨 SLOW REQUEST ALERT: ${responseTimeMs}ms (threshold: ${PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME}ms)`);
    }
    
    // Check error rate
    const errorRate = performanceMetrics.requests.failed / performanceMetrics.requests.total;
    if (errorRate > PERFORMANCE_THRESHOLDS.ERROR_RATE_THRESHOLD && performanceMetrics.requests.total > 10) {
        console.error(`🚨 HIGH ERROR RATE ALERT: ${(errorRate * 100).toFixed(1)}% (threshold: ${PERFORMANCE_THRESHOLDS.ERROR_RATE_THRESHOLD * 100}%)`);
    }
}

function recordOpenAICall(responseTimeMs, success = true) {
    performanceMetrics.openai.calls++;
    performanceMetrics.openai.totalTime += responseTimeMs;
    performanceMetrics.openai.averageTime = performanceMetrics.openai.totalTime / performanceMetrics.openai.calls;
    
    if (!success) {
        performanceMetrics.openai.errors++;
    }
    
    // Alert for slow OpenAI calls
    if (responseTimeMs > PERFORMANCE_THRESHOLDS.MAX_OPENAI_TIME) {
        console.warn(`🚨 SLOW OPENAI CALL: ${responseTimeMs}ms (threshold: ${PERFORMANCE_THRESHOLDS.MAX_OPENAI_TIME}ms)`);
    }
    
    console.log(`📊 OpenAI Call: ${responseTimeMs}ms (avg: ${performanceMetrics.openai.averageTime.toFixed(0)}ms)`);
}

function recordDatabaseQuery(responseTimeMs, cacheHit = false) {
    performanceMetrics.database.queries++;
    
    if (cacheHit) {
        performanceMetrics.database.cacheHits++;
    } else {
        performanceMetrics.database.cacheMisses++;
        performanceMetrics.database.totalTime += responseTimeMs;
    }
    
    // Calculate average only for actual DB queries (not cache hits)
    const actualQueries = performanceMetrics.database.queries - performanceMetrics.database.cacheHits;
    if (actualQueries > 0) {
        performanceMetrics.database.averageTime = performanceMetrics.database.totalTime / actualQueries;
    }
    
    // Alert for slow database queries
    if (!cacheHit && responseTimeMs > PERFORMANCE_THRESHOLDS.MAX_DB_TIME) {
        console.warn(`🚨 SLOW DB QUERY: ${responseTimeMs}ms (threshold: ${PERFORMANCE_THRESHOLDS.MAX_DB_TIME}ms)`);
    }
    
    const cacheHitRate = performanceMetrics.database.cacheHits / performanceMetrics.database.queries;
    console.log(`📊 DB Query: ${cacheHit ? 'CACHE' : responseTimeMs + 'ms'} (cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%)`);
}

function getPerformanceReport() {
    const errorRate = performanceMetrics.requests.total > 0 ? 
        (performanceMetrics.requests.failed / performanceMetrics.requests.total * 100).toFixed(1) : '0.0';
    
    const cacheHitRate = performanceMetrics.database.queries > 0 ? 
        (performanceMetrics.database.cacheHits / performanceMetrics.database.queries * 100).toFixed(1) : '0.0';
    
    const openAIErrorRate = performanceMetrics.openai.calls > 0 ?
        (performanceMetrics.openai.errors / performanceMetrics.openai.calls * 100).toFixed(1) : '0.0';
    
    return {
        summary: {
            totalRequests: performanceMetrics.requests.total,
            successRate: `${100 - parseFloat(errorRate)}%`,
            errorRate: `${errorRate}%`,
            avgResponseTime: `${performanceMetrics.requests.averageResponseTime.toFixed(0)}ms`
        },
        openai: {
            totalCalls: performanceMetrics.openai.calls,
            avgResponseTime: `${performanceMetrics.openai.averageTime.toFixed(0)}ms`,
            errorRate: `${openAIErrorRate}%`
        },
        database: {
            totalQueries: performanceMetrics.database.queries,
            avgQueryTime: `${performanceMetrics.database.averageTime.toFixed(0)}ms`,
            cacheHitRate: `${cacheHitRate}%`,
            cacheHits: performanceMetrics.database.cacheHits,
            cacheMisses: performanceMetrics.database.cacheMisses
        }
    };
}

function logPerformanceReport() {
    const report = getPerformanceReport();
    
    console.log('\n📊 ===== PERFORMANCE REPORT =====');
    console.log(`📈 Total Requests: ${report.summary.totalRequests}`);
    console.log(`✅ Success Rate: ${report.summary.successRate}`);
    console.log(`❌ Error Rate: ${report.summary.errorRate}`);
    console.log(`⏱️  Avg Response Time: ${report.summary.avgResponseTime}`);
    console.log(`\n🤖 OpenAI Stats:`);
    console.log(`   Calls: ${report.openai.totalCalls}`);
    console.log(`   Avg Time: ${report.openai.avgResponseTime}`);
    console.log(`   Error Rate: ${report.openai.errorRate}`);
    console.log(`\n🗄️  Database Stats:`);
    console.log(`   Queries: ${report.database.totalQueries}`);
    console.log(`   Avg Time: ${report.database.avgQueryTime}`);
    console.log(`   Cache Hit Rate: ${report.database.cacheHitRate}`);
    console.log(`   Cache Hits: ${report.database.cacheHits}`);
    console.log(`   Cache Misses: ${report.database.cacheMisses}`);
    console.log('==============================\n');
}

// Auto-report every 50 requests
let requestCount = 0;
function autoReport() {
    requestCount++;
    if (requestCount % 50 === 0) {
        logPerformanceReport();
    }
}

module.exports = {
    recordRequest,
    recordOpenAICall,
    recordDatabaseQuery,
    getPerformanceReport,
    logPerformanceReport,
    autoReport
};