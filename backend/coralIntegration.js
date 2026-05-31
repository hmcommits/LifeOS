const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Executes a Coral SQL query and parses the output as JSON.
 * @param {string} sqlQuery The SQL query to execute
 * @returns {Promise<any>} The parsed JSON output
 */
async function executeCoralQuery(sqlQuery) {
    try {
        // Strip newlines to prevent Windows cmd.exe from truncating the command
        const singleLineQuery = sqlQuery.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
        // Run coral sql command with json format. Ensure double quotes around the query.
        const { stdout, stderr } = await execPromise(`coral sql --format json "${singleLineQuery}"`);
        
        if (stderr) {
            console.warn('Coral Warning/Error:', stderr);
        }

        if (!stdout || stdout.trim() === '') {
            return null;
        }

        // Coral outputs JSON directly to stdout
        const data = JSON.parse(stdout);
        return data;
    } catch (error) {
        // Suppress massive stack trace to keep console clean for demo, caller handles fallback gracefully
        throw error;
    }
}

module.exports = { executeCoralQuery };
