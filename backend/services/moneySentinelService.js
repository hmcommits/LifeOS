const { executeCoralQuery } = require('../coralIntegration');

async function fetchRecentEmails() {
    // We search gmail.messages for financial keywords
    const query = `SELECT id, snippet, date FROM gmail.messages WHERE q = 'free trial OR auto-renewal OR receipt' LIMIT 5`;
    return await executeCoralQuery(query);
}

async function fetchBudgetStatus() {
    // Assuming a simple schema for budget where rows contain Category and Limit
    // Since Google Sheets ranges map nicely, we query rows for 'Subscriptions' limit
    const query = `SELECT * FROM google_sheets.rows WHERE range = 'Budget!A:C' AND col1 = 'Subscriptions' LIMIT 1`;
    return await executeCoralQuery(query);
}

module.exports = {
    fetchRecentEmails,
    fetchBudgetStatus
};
