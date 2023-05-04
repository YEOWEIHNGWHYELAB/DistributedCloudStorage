const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { auth } = require('google-auth-library');

// Register user
exports.register = async (req, res, pool) => {
    const { username, email, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if user already exists
        const queryResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = queryResult.rows[0];

        if (user) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const insertResult = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
        const newUser = insertResult.rows[0];

        // Sign JWT token
        const token = jwt.sign({ username: newUser.username }, process.env.JWT_SECRET, { algorithm: 'HS256' });

        // Return token
        res.json({  message: 'User created successfully', user: insertResult.rows[0], token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user
exports.login = async (req, res, pool) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if user exists
        const queryResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = queryResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check if password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Sign JWT token
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { algorithm: 'HS256' });

        // Return token
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        const queryResult = await pool.query('SELECT * FROM users WHERE username = $1', [decoded.username]);
        res.json({ username: decoded.username, email: queryResult.rows[0].email });
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid token' });
    }
}

// Verify JWT token
exports.isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        req.username = decoded.username;
        // console.log(decoded.username + " have successfully requested for...")
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid token' });
    }
};