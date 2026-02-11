// Simple request queue manager for OpenAI API calls
class RequestQueue {
    constructor(options = {}) {
        this.maxConcurrent = options.maxConcurrent || 3; // Max 3 concurrent OpenAI calls
        this.maxRetries = options.maxRetries || 2;
        this.retryDelay = options.retryDelay || 1000; // 1 second
        this.queue = [];
        this.processing = 0;
        this.stats = {
            totalRequests: 0,
            completedRequests: 0,
            failedRequests: 0,
            queuedRequests: 0,
            maxQueueLength: 0
        };
    }

    async add(task, priority = 0) {
        return new Promise((resolve, reject) => {
            const queueItem = {
                task,
                priority,
                resolve,
                reject,
                retries: 0,
                createdAt: Date.now()
            };

            // Insert based on priority (higher priority first)
            let inserted = false;
            for (let i = 0; i < this.queue.length; i++) {
                if (this.queue[i].priority < priority) {
                    this.queue.splice(i, 0, queueItem);
                    inserted = true;
                    break;
                }
            }
            
            if (!inserted) {
                this.queue.push(queueItem);
            }

            this.stats.totalRequests++;
            this.stats.queuedRequests++;
            
            // Update max queue length
            if (this.queue.length > this.stats.maxQueueLength) {
                this.stats.maxQueueLength = this.queue.length;
            }

            console.log(`📝 Request queued (priority: ${priority}, queue length: ${this.queue.length})`);
            
            // Try to process immediately if under concurrent limit
            this.processQueue();
        });
    }

    async processQueue() {
        // Don't process if we're at max concurrent requests
        if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        const item = this.queue.shift();
        this.stats.queuedRequests--;
        this.processing++;

        console.log(`🔄 Processing request (concurrent: ${this.processing}/${this.maxConcurrent}, queue: ${this.queue.length})`);

        try {
            const startTime = Date.now();
            const result = await item.task();
            const duration = Date.now() - startTime;
            
            console.log(`✅ Request completed in ${duration}ms`);
            
            this.stats.completedRequests++;
            item.resolve(result);
            
        } catch (error) {
            console.error(`❌ Request failed (attempt ${item.retries + 1}/${this.maxRetries + 1}):`, error.message);
            
            // Retry logic
            if (item.retries < this.maxRetries) {
                item.retries++;
                
                // Add back to queue with exponential backoff
                setTimeout(() => {
                    console.log(`🔄 Retrying request (attempt ${item.retries + 1}/${this.maxRetries + 1})`);
                    this.queue.unshift(item); // Add to front for priority
                    this.stats.queuedRequests++;
                    this.processQueue();
                }, this.retryDelay * Math.pow(2, item.retries - 1));
                
            } else {
                this.stats.failedRequests++;
                item.reject(error);
            }
        } finally {
            this.processing--;
            
            // Process next item in queue
            setTimeout(() => this.processQueue(), 100); // Small delay between requests
        }
    }

    getStats() {
        return {
            ...this.stats,
            currentQueue: this.queue.length,
            processing: this.processing,
            successRate: this.stats.totalRequests > 0 ? 
                ((this.stats.completedRequests / this.stats.totalRequests) * 100).toFixed(1) + '%' : '0%'
        };
    }

    logStats() {
        const stats = this.getStats();
        console.log('\n🚦 ===== QUEUE STATS =====');
        console.log(`📊 Total Requests: ${stats.totalRequests}`);
        console.log(`✅ Completed: ${stats.completedRequests}`);
        console.log(`❌ Failed: ${stats.failedRequests}`);
        console.log(`📝 Currently Queued: ${stats.currentQueue}`);
        console.log(`⚡ Processing: ${stats.processing}/${this.maxConcurrent}`);
        console.log(`📈 Success Rate: ${stats.successRate}`);
        console.log(`📏 Max Queue Length: ${stats.maxQueueLength}`);
        console.log('========================\n');
    }
}

// Global queue instance for OpenAI requests
const openaiQueue = new RequestQueue({
    maxConcurrent: 3,
    maxRetries: 2,
    retryDelay: 1000
});

// Auto-log stats every 25 requests
let requestCounter = 0;
function autoLogStats() {
    requestCounter++;
    if (requestCounter % 25 === 0) {
        openaiQueue.logStats();
    }
}

module.exports = {
    RequestQueue,
    openaiQueue,
    autoLogStats
};