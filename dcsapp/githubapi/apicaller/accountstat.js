const fetch = require('node-fetch');


/**
 * Get repo + size by GitHub Account
 * 
 * DO NOT USE THIS for determining which account to upload files GitHub storage 
 * takes a long time to be up to date!
 * 
 * You could use this for statistics for non-mission critical application
 */
exports.getRepositoriesSize = async (req, res, pool) => {
    const token = req.body.access_token;

    try {
        const response = await fetch('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        const repositories = await response.json();

        const result = [];

        for (const repository of repositories) {
            const repoName = repository.name;
            const response = await fetch(`https://api.github.com/repos/${repository.full_name}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json'
                }
            });

            const repoDetails = await response.json();
            const size = repoDetails.size;

            result.push({ repoName, size });
        }

        res.json(
            {
                success: true,
                results: result
            }
        );
    } catch(error) {
        res.json(
            {
                success: false,
                message: "GitHub isn't available"
            }
        );
    }
}
