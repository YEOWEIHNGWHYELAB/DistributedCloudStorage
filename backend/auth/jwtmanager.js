const jwt = require('jsonwebtoken');
const crypto = require('crypto');


// Provides the JWT Options
const jwtOptions = () => {
    const token_id = crypto.randomBytes(16).toString('hex');
    const options = { algorithm: 'HS256', expiresIn: '1h', jwtid: token_id };
    return options;
}

// Verifies the JWT and return the decoded result
function verifyJWT(token, res, next) {
    try {
        jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], ignoreExpiration: false });
        next();
    } catch(err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid token' });
    }
}

// Generate the JWT token
async function generateToken(pool, user, res, isRegister = false) {
    const payload = { username: user.username };
    const options = jwtOptions();

    try {
        // Check if the token_id has been blacklisted
        const count = await isBlacklistedToken(options, pool);

        if (count > 0) {
            // Token has been blacklisted, generate a new one
            return await generateToken(pool, user, res, isRegister);
        } else {
            // Token is valid, sign it and return the token string
            const token = await jwt.sign(payload, process.env.JWT_SECRET, options);
            
            // Return token
            if (isRegister) {
                // Registration
                res.json({ message: 'User created successfully', token: token });
            } else {
                // Login
                res.json({ message: 'Login successfully', token: token });
            }
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Checks if the token is blacklisted
async function isBlacklistedToken(options, pool) {
    const queryResult = await pool.query(
        `SELECT COUNT(*) 
            FROM JWTBlackList 
            WHERE token_id = $1`, [options.jwtid]);

    const count = parseInt(queryResult.rows[0].count);

    return count;
}

module.exports = {
    jwtOptions: jwtOptions,
    isBlacklistedToken: isBlacklistedToken,
    generateToken: generateToken,
    verifyJWT: verifyJWT
};
