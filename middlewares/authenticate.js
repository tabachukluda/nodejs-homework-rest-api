const jwt = require('jsonwebtoken');

const ctrlWrapper = require('../decorators/ctrlWrapper.js');

const User = require('../models/User.js')

require('dotenv').config()

const { JWT_SECRET } = process.env;

const authenticate = async(req, res, next)=> {
    const {authorization = ""} = req.headers;
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
        res.status(401).json();
    }

    try {
        const {id} = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(id);
        if(!user || !user.token) {
            res.status(401).json();
        }
        req.user = user;
        next();
    }
    catch(error) {
        next(error);
    }
}

module.exports = ctrlWrapper(authenticate)
