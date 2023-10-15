const Contact = require('../models/contact.js');

const { contactSchema, updateStatusValidation } = require('../schemas/validator.js');

const ctrlWrapper = require('../decorators/ctrlWrapper.js');

const validateId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
    }
    next();
};

const getAll = async (req, res) => {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
    }


const getById = async (req, res) => {
    const { contactId } = req.params;
    try {
        const contact = await Contact.findById(contactId);
        if (contact) {
            res.status(200).json(contact);
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Not found' });
    }
}


const add = async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'missing field' });
    }

    const { error } = contactSchema.validate(req.body);

    if (error) {
        const fieldName = error.details[0].context.key;
        return res.status(400).json({ message: `Missing required ${fieldName} field` });
    }

    const { name, email, phone, favorite } = req.body;

    const newContact = {
        name,
        email,
        phone,
        favorite: favorite !== undefined ? favorite : false, 
    };

    const contact = await Contact.create(newContact);

    if (contact) {
        res.status(201).json(contact);
    } else {
        res.status(400).json({ message: 'missing required field' });
    }
};


const deleteContact = async (req, res) => {
    const { contactId } = req.params
    const contact = await Contact.findByIdAndRemove(contactId);
    if (contact) {
        res.status(200).json({ message: 'contact deleted' })
    } else {
        res.status(404).json({ message: 'Not found' })
    }
}

const updateContact = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'missing required field' });
        }

        const { contactId } = req.params;
        const { name, email, phone } = req.body;

        if (!name && !email && !phone) {
            return res.status(400).json({ message: `Missing required ${fieldName} field` });
        }

        const contact = await Contact.findByIdAndUpdate(
            contactId,
            { $set: { name, email, phone } },
            { new: true } 
        );

        if (!contact) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.status(200).json(contact);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const setFavorite = async (req, res, next) => {
	try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'missing field favorite' });
        }

        const { favorite } = req.body
		const { contactId } = req.params
		if (!favorite && favorite !== false) {
            return res.status(400).json({ message: `Missing required ${fieldName} field` });
        }

        const contact = await Contact.findByIdAndUpdate(
        contactId,
        { favorite },
        { new: true }
        );

        if (!contact) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.status(200).json(contact);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    getAll: ctrlWrapper(getAll),
    getById: ctrlWrapper(getById),
    add: ctrlWrapper(add),
    updateContact: ctrlWrapper(updateContact),
    deleteContact: ctrlWrapper(deleteContact),
    setFavorite: ctrlWrapper(setFavorite),
};


