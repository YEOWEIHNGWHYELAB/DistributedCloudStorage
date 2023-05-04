const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.getCredentials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        const queryResult = await pool.query('SELECT * FROM GitHubCredential WHERE username = $1', [decoded.username]);
        res.json(queryResult.rows);
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid token' });
    }
}
