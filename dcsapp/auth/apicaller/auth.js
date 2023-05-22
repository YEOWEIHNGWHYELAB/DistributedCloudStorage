const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtManager = require('./jwtmanager');
const createtTablePartition = require('../filemanager/createtable');


// Register user
exports.register = async (req, res, pool) => {
    const { username, email, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if user already exists
        const queryResult = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        const user = queryResult.rows[0];

        if (user) {
            return res.status(409).json({ message: 'Username / Email already taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const insertResult = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
        const newUser = insertResult.rows[0];

        /**
         * Creates the table parition on files table
         * 
         * Note that we pass username without converting it to lower case as 
         * postgresql would do it automatically
         */
        const createTableResult = await createtTablePartition.createRequiredFileTable(username, pool);
        // console.log(createTableResult);

        // Sign JWT token
        jwtManager.generateToken(pool, newUser, res, true);
    } catch (err) {
        // console.error(err);
        if (err.code === '23505' && err.constraint === 'unique_username') {
            res.status(401).json({ success: false, message: 'Username already taken!' });
        } else {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

// Login user
exports.login = async (req, res, pool) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        // Check if user exists
        const queryResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = queryResult.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Check if password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Sign JWT token
        jwtManager.generateToken(pool, user, res, false);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// whoami
exports.getUsername = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], ignoreExpiration: false });
        const queryResult = await pool.query('SELECT * FROM users WHERE username = $1', [decoded.username]);

        const count = await jwtManager.isBlacklistedToken(decoded.jti, pool);

        if (count > 0) {
            res.status(401).json({ success: false, message: 'Banned token!' });
            return;
        }

        res.json({ username: decoded.username, email: queryResult.rows[0].email });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ success: false, message: 'Please login again' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid token' });
        }
    }
}

// Change password
exports.changePassword = async (req, res, pool) => {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
        return res.status(401).json({ success: false, message: 'Old password and new password are required' });
    }

    if (old_password == new_password) {
        return res.status(401).json({ success: false, message: 'Bruh same old and new password!' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ success: false, message: "Authorization header missing" });
    }

    try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET, { algorithms: ['HS256'], ignoreExpiration: false });

        // Check if user exists
        const queryResult = await pool.query('SELECT * FROM users WHERE username = $1', [decoded.username]);
        const user = queryResult.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username!' });
        }

        // Check if password is correct
        const oldPasswordMatch = await bcrypt.compare(old_password, user.password);

        if (!oldPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid old password!' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        const updateResult = await pool.query(`
            UPDATE users
            SET password = $2
            WHERE username = $1`, [decoded.username, hashedPassword]);

        // Sign JWT token
        res.json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        // console.error(err);
        
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ success: false, message: 'Please login again' });
        } else {
            res.status(500).json({ success: false, message: 'Password change error!' });
        }
    }
};

// Forgot Password
exports.forgotPassword = async (req, res, pool) => {
    const { username } = req.body;
};

// Verify JWT token
exports.isAuthenticated = async (req, res, next, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    const countBlackListedToken = await jwtManager.isBlacklistedToken(jwtManager.jwtOptions(), pool);

    if (countBlackListedToken > 0) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    } else {
        jwtManager.verifyJWT(token, res, next, pool);
    }
};
