const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// Upload new video
exports.createCredentials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    let decoded;
    const token = authHeader.split(" ")[1];

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
    } catch (err) {
        console.error(err);
        res.status(401).json({ success: false, message: "Invalid token" });
    }

    
};
