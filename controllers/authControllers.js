const User = require('../models/User.js');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

require('dotenv').config()

const fs = require('fs/promises');
const path = require("path");
const gravatar = require("gravatar")
const Jimp = require("jimp");

const { nanoid } = require("nanoid");

const { JWT_SECRET, BASE_URL } = process.env

const avatarsPath = path.resolve("public", "avatars");

const { userSignupSchema, userSigninSchema, userEmailSchema } = require('../schemas/validator.js');
const { sendEmail } = require('../schemas/sendEmail.js');

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
    const verificationToken = nanoid();

    const avatarURL = gravatar.url(email, { s: "250", d: "retro" });

    const newUser = await User.create({ ...req.body, password: hashPassword, verificationToken, avatarURL });
        
    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail);

    res.status(201).json({
        user: { email: newUser.email, subscription: newUser.subscription,  }
    });
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
}

const verify = async (req, res) => {
    const { verificationToken } = req.params;

const user = await User.findOne({ verificationToken });

if (!user) {
    return res.status(404).json({ message: 'User not found' });
}


if (user.verify) {
    return res.status(400).json({ message: 'User is already verified' });
}
await User.updateOne({ verificationToken }, { verify: true, verificationToken: null });

    return res.status(200).json({ message: 'Verification successful' });
}


const resendVerifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const { error } = userEmailSchema.validate({ email });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Email is not found' });
        }

        if (user.verify) {
            return res.status(400).json({ message: 'Verification has already been passed' });
        }

        const verifyEmail = {
            to: email,
            subject: 'Verify email',
            html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click to verify email</a>`,
        };

        await sendEmail(verifyEmail);

        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

    if (!user.verify) {
    res.status(401).json({ message: 'Email not verify' });
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
    
    return res.status(200).json({
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

        const image = await Jimp.read(tempUpload);
        image.resize(250, 250);
        await image.write(resultUpload);

        await User.findByIdAndUpdate(_id, { avatarURL });

        res.status(200).json({ avatarURL });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    register: ctrlWrapper(register),  
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),    
}