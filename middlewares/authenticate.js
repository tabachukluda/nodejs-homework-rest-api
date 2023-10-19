const jwt = require('jsonwebtoken');
const ctrlWrapper = require('../decorators/ctrlWrapper.js');
const User = require('../models/User.js');

require('dotenv').config();
const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");

    if (bearer !== "Bearer") {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const { id } = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(id);

        if (!user || !user.token) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = ctrlWrapper(authenticate);
