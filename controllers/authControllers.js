const User = require('../models/User.js');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

require('dotenv').config()

const { JWT_SECRET } = process.env

const { userSignupSchema, userSigninSchema } = require('../schemas/validator.js');

const ctrlWrapper = require('../decorators/ctrlWrapper.js');

const register = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'missing field' });
    }

    const { error } = userSignupSchema.validate(req.body);

    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.status(409).json({ message: 'Email is in use' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ ...req.body, password: hashPassword });

    res.status(201).json({ user: { email: newUser.email, subscription: newUser.subscription } });
}



const login = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'missing field' });
    }

    const { error } = userSigninSchema.validate(req.body);

    if (error) return res.status(400).json({ message: error.details[0].message })

    const {email, password} = req.body;
    const user = await User.findOne({ email });
    
    if(!user) {
    res.status(401).json({ message: 'Email or password is wrong' });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare) {
        res.status(401).json({ message: 'Email or password is wrong' });
    }
    
    const payload = {
        id: user._id,
    }

    const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "23h"});
    await User.findByIdAndUpdate(user._id, {token});
    
    return res.status(201).json({
        user: {
        email: user.email,
        subscription: user.subscription,
    },
    });
}

const getCurrent = async(req, res)=> {
    const { _id } = req.user;
    const user = await User.findOne({ _id });
    if (!user) {
    res.status(401).json({ message: "Not authorized" });
    }
    res.status(200).json({ email: user.email, subscription: user.subscription });
};

const logout = async(req, res)=> {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});

    return res.status(204).json({});
    }

module.exports = {
    register: ctrlWrapper(register),  
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
}