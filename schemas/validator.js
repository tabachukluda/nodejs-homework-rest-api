const Joi = require('joi');

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const contactSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(5).required(),
    favorite: Joi.boolean(),
});

const updateStatusValidation = Joi.object({
    favorite: Joi.bool().required(),
});

const userSignupSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
})

const userSigninSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
})

module.exports = {
    contactSchema,
    updateStatusValidation,
    userSignupSchema,
    userSigninSchema,
};