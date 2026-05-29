const http = require('http');

// Simple Mutex queue to force sequential inference (protects CPU/RAM from parallel requests)
class AsyncMutex {
    constructor() {
        this.queue = [];
        this.locked = false;
    }
    
    lock() {
        return new Promise(resolve => {
            if (this.locked) {
                this.queue.push(resolve);
            } else {
                this.locked = true;
                resolve();
            }
        });
    }
    
    unlock() {
        if (this.queue.length > 0) {
            const nextResolve = this.queue.shift();
            nextResolve();
        } else {
            this.locked = false;
        }
    }
}

const aiMutex = new AsyncMutex();

/**
 * Sends a prompt and data to local Ollama instance sequentially.
 * @param {string} prompt The analysis prompt
 * @param {any} data The data to analyze
 * @returns {Promise<string>} Ollama's response
 */
async function analyzeDataWithLocalAi(prompt, data) {
    const fullPrompt = `${prompt}\n\nData:\n${JSON.stringify(data, null, 2)}`;
    
    console.log('[Local AI] Request queued. Waiting for lock...');
    await aiMutex.lock();
    console.log('[Local AI] Lock acquired. Generating inference via qwen2.5-coder:3b...');

    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            model: 'qwen2.5-coder:3b',
            prompt: fullPrompt,
            stream: false,
            format: 'json',
            options: {
                temperature: 0.1 // Keep it deterministic for JSON structure
            }
        });

        const options = {
            hostname: 'localhost',
            port: 11434,
            path: '/api/generate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                aiMutex.unlock();
                console.log('[Local AI] Inference complete. Lock released.');
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed.response);
                } catch (e) {
                    reject(new Error("Failed to parse Ollama response: " + e.message));
                }
            });
        });

        req.on('error', (e) => {
            aiMutex.unlock();
            console.error('[Local AI] Request error:', e);
            reject(new Error(`Ollama is not running or unreachable: ${e.message}`));
        });

        req.write(postData);
        req.end();
    });
}

module.exports = { analyzeDataWithLocalAi };
