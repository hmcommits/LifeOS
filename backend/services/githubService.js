const { executeCoralQuery } = require('../coralIntegration');

async function fetchUserProfile() {
    const query = "SELECT login, id, type, name, company FROM github.user LIMIT 1";
    return await executeCoralQuery(query);
}

async function verifyRepository() {
    const query = "SELECT name, full_name, private, created_at FROM github.repos_get WHERE owner = 'hmbitcyber' AND repo = 'lifeos-dummy-data'";
    return await executeCoralQuery(query);
}

async function fetchRecentCommits() {
    const query = "SELECT sha, author__login, commit__author__date, commit__message FROM github.commits WHERE owner = 'hmbitcyber' AND repo = 'lifeos-dummy-data' LIMIT 5";
    return await executeCoralQuery(query);
}

module.exports = {
    fetchUserProfile,
    verifyRepository,
    fetchRecentCommits
};
