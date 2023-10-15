const Joi = require('joi');

const contactSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(5).required(),
    favorite: Joi.boolean(),
});

const updateStatusValidation = Joi.object({
    favorite: Joi.bool().required(),
});

module.exports = {
    contactSchema,
    updateStatusValidation,
};