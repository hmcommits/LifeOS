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
        // Run coral sql command with json format. Ensure double quotes around the query.
        const { stdout, stderr } = await execPromise(`coral sql --format json "${sqlQuery}"`);
        
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
        console.error('Failed to execute Coral query:', error);
        throw error;
    }
}

module.exports = { executeCoralQuery };
