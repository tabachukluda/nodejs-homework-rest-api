const User = require('../models/User.js');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

require('dotenv').config()

const fs = require('fs/promises');
const path = require("path");
const gravatar = require("gravatar")
const Jimp = require("jimp");

const { JWT_SECRET } = process.env

const avatarsPath = path.resolve("public", "avatars");

const { userSignupSchema, userSigninSchema } = require('../schemas/validator.js');

const ctrlWrapper = require('../decorators/ctrlWrapper.js');

const register = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'missing field' });
    }
    const { error } = userSignupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.status(409).json({ message: 'Email is in use' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email, { s: "250", d: "retro" });

    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL });

    res.status(201).json({
        user: { email: newUser.email, subscription: newUser.subscription }
    });
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
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
        token: token,
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
    
const updateAvatar = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    try {
        const { _id } = req.user;
        const { path: tempUpload, originalname } = req.file;
        const filename = `${_id}_${originalname}`;
        const resultUpload = path.resolve(avatarsPath, filename); 
        const avatarURL = path.join("avatars", filename); 

        
        await fs.rename(tempUpload, resultUpload);

        await User.findByIdAndUpdate(_id, { avatarURL });

        res.status(200).json({ avatarURL });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




module.exports = {
    register: ctrlWrapper(register),  
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
}