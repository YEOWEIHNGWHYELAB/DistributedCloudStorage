const jwt = require("jsonwebtoken");


function checkAuthHeader(authHeader, res) {
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    return token = authHeader.split(" ")[1];
}

exports.getPingLatencyAuthenticated = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    let decoded;

    try {
        decoded = jwt.verify(dcsAuthToken, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    try {
        res.json();
    } catch(error) {
        res.status(401).json({ message: "Error!"});
    }
};
