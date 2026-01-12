const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ msg: 'No authentiated, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeynailsbyanais123!');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
