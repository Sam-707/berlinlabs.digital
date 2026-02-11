// Image optimization utilities to reduce memory usage and processing time

/**
 * Check if image compression is beneficial based on size and type
 * @param {number} sizeBytes - Image size in bytes
 * @param {string} contentType - MIME type
 * @returns {boolean} Whether compression would be beneficial
 */
function shouldCompressImage(sizeBytes, contentType) {
    const sizeMB = sizeBytes / (1024 * 1024);
    
    // Compress if:
    // - Image is larger than 2MB
    // - Image is PNG (usually has better compression potential)
    // - Image is JPEG larger than 5MB
    return (
        sizeMB > 2 ||
        (contentType.includes('png') && sizeMB > 1) ||
        (contentType.includes('jpeg') && sizeMB > 5)
    );
}

/**
 * Estimate compressed size and processing time
 * @param {number} originalSize - Original size in bytes
 * @param {string} contentType - MIME type
 * @returns {Object} Estimated compression results
 */
function estimateCompression(originalSize, contentType) {
    const sizeMB = originalSize / (1024 * 1024);
    
    // Rough estimates based on image type and size
    let compressionRatio;
    let processingTimeMs;
    
    if (contentType.includes('png')) {
        compressionRatio = 0.6; // PNG usually compresses to ~60% of original
        processingTimeMs = sizeMB * 1000; // ~1 second per MB
    } else if (contentType.includes('jpeg')) {
        compressionRatio = 0.8; // JPEG already compressed, less improvement
        processingTimeMs = sizeMB * 500; // ~0.5 seconds per MB
    } else {
        compressionRatio = 0.7;
        processingTimeMs = sizeMB * 800;
    }
    
    return {
        estimatedSize: Math.round(originalSize * compressionRatio),
        estimatedSizeMB: (originalSize * compressionRatio / (1024 * 1024)).toFixed(2),
        estimatedProcessingMs: Math.round(processingTimeMs),
        compressionRatio: compressionRatio,
        worthCompressing: processingTimeMs < 10000 && compressionRatio < 0.9 // Only if < 10s and saves > 10%
    };
}

/**
 * Optimize base64 encoding process to reduce memory usage
 * @param {ArrayBuffer} buffer - Image buffer
 * @param {number} maxSize - Maximum size in bytes (default 8MB)
 * @returns {Object} Optimization result
 */
function optimizeBase64Encoding(buffer, maxSize = 8 * 1024 * 1024) {
    const size = buffer.byteLength;
    const sizeMB = size / (1024 * 1024);
    
    console.log(`🖼️ Image optimization: ${sizeMB.toFixed(2)}MB`);
    
    if (size > maxSize) {
        throw new Error(`Image too large: ${sizeMB.toFixed(2)}MB (max: ${maxSize / 1024 / 1024}MB)`);
    }
    
    // For very large images, warn about memory usage
    if (size > 5 * 1024 * 1024) {
        console.warn(`⚠️ Large image detected: ${sizeMB.toFixed(2)}MB - High memory usage expected`);
    }
    
    const startTime = Date.now();
    
    try {
        // Convert in chunks to reduce memory pressure for large images
        if (size > 3 * 1024 * 1024) {
            console.log('📦 Using chunked base64 encoding for large image');
            const base64 = encodeBase64Chunked(buffer);
            const encodingTime = Date.now() - startTime;
            
            console.log(`✅ Base64 encoding completed in ${encodingTime}ms (chunked)`);
            return {
                base64,
                encodingTimeMs: encodingTime,
                method: 'chunked',
                originalSizeMB: sizeMB.toFixed(2),
                base64Length: base64.length
            };
        } else {
            // Regular encoding for smaller images
            const base64 = Buffer.from(buffer).toString('base64');
            const encodingTime = Date.now() - startTime;
            
            console.log(`✅ Base64 encoding completed in ${encodingTime}ms (standard)`);
            return {
                base64,
                encodingTimeMs: encodingTime,
                method: 'standard',
                originalSizeMB: sizeMB.toFixed(2),
                base64Length: base64.length
            };
        }
        
    } catch (error) {
        console.error('❌ Base64 encoding failed:', error);
        throw new Error(`Image encoding failed: ${error.message}`);
    }
}

/**
 * Encode large buffers in chunks to reduce memory pressure
 * @param {ArrayBuffer} buffer - Image buffer
 * @param {number} chunkSize - Chunk size in bytes (default 1MB)
 * @returns {string} Base64 encoded string
 */
function encodeBase64Chunked(buffer, chunkSize = 1024 * 1024) {
    const chunks = [];
    const uint8Array = new Uint8Array(buffer);
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        chunks.push(Buffer.from(chunk).toString('base64'));
        
        // Allow garbage collection between chunks
        if (i % (chunkSize * 3) === 0) {
            // Force garbage collection every 3MB (if available)
            if (global.gc) {
                global.gc();
            }
        }
    }
    
    return chunks.join('');
}

/**
 * Generate optimization recommendations based on image properties
 * @param {number} sizeBytes - Image size
 * @param {string} contentType - MIME type
 * @param {number} processingTimeMs - Current processing time
 * @returns {Array} Array of optimization recommendations
 */
function getOptimizationRecommendations(sizeBytes, contentType, processingTimeMs) {
    const recommendations = [];
    const sizeMB = sizeBytes / (1024 * 1024);
    
    if (sizeMB > 5) {
        recommendations.push({
            type: 'size',
            priority: 'high',
            message: `Large image (${sizeMB.toFixed(1)}MB) - Consider image compression or resizing`,
            impact: 'High memory usage and slow processing'
        });
    }
    
    if (processingTimeMs > 10000) {
        recommendations.push({
            type: 'performance',
            priority: 'medium',
            message: `Slow processing (${processingTimeMs}ms) - Enable image optimization`,
            impact: 'User experience degradation'
        });
    }
    
    if (contentType.includes('png') && sizeMB > 2) {
        recommendations.push({
            type: 'format',
            priority: 'medium',
            message: 'PNG format detected - JPEG conversion could reduce size significantly',
            impact: 'Bandwidth and processing time savings'
        });
    }
    
    if (sizeMB > 10) {
        recommendations.push({
            type: 'memory',
            priority: 'critical',
            message: 'Image exceeds recommended size - Risk of memory overflow',
            impact: 'Potential system instability'
        });
    }
    
    return recommendations;
}

/**
 * Log image processing metrics and recommendations
 * @param {Object} metrics - Processing metrics
 */
function logImageMetrics(metrics) {
    console.log('\n🖼️ ===== IMAGE PROCESSING METRICS =====');
    console.log(`📏 Original Size: ${metrics.originalSizeMB}MB`);
    console.log(`⚡ Encoding Method: ${metrics.method}`);
    console.log(`⏱️  Encoding Time: ${metrics.encodingTimeMs}ms`);
    console.log(`📊 Base64 Length: ${metrics.base64Length.toLocaleString()} chars`);
    
    if (metrics.recommendations && metrics.recommendations.length > 0) {
        console.log('\n💡 Optimization Recommendations:');
        metrics.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
            console.log(`      Impact: ${rec.impact}`);
        });
    }
    
    console.log('=====================================\n');
}

module.exports = {
    shouldCompressImage,
    estimateCompression,
    optimizeBase64Encoding,
    encodeBase64Chunked,
    getOptimizationRecommendations,
    logImageMetrics
};