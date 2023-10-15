const Contact = require('../models/contact.js');

const { contactSchema, updateStatusValidation } = require('../schemas/validator.js');

const ctrlWrapper = require('../decorators/ctrlWrapper.js');

const getAll = async (req, res) => {
    const { _id: owner } = req.user;
    const { page = 1, limit = 20, favorite } = req.query;
    const skip = page * limit - limit;
    const contacts = await Contact.find({ owner }).skip(skip).limit(limit);

    if (!favorite) {
    res.status(200).json({ contacts });
    } else {
    const favoriteContacts = contacts.filter(
        (contact) => contact.favorite === true
    );
    res.status(200).json({ favoriteContacts });
    }
};



const getById = async (req, res) => {
    try {
        const { contactId } = req.params;
        const { _id: owner } = req.user;

        const contact = await Contact.findOne({ _id: contactId, owner });

        if (contact) {
            res.status(200).json(contact);
        } else {
            res.status(404).json({ message: 'Contact not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


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

    const { _id: owner } = req.user;

    const contact = await Contact.create({ ...newContact, owner });

    if (contact) {
        res.status(201).json(contact);
    } else {
        res.status(400).json({ message: 'missing required field' });
    }
};


const deleteContact = async (req, res) => {
    const { _id: owner } = req.user;
    const { contactId } = req.params
    const contact = await Contact.findOneAndRemove({
    _id: contactId,
    owner,
    });
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
        const { _id: owner } = req.user;
        const contact = await Contact.findOneAndUpdate(
            { owner, _id: contactId },
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
        
        const { _id: owner } = req.user;
        const contact = await Contact.findOneAndUpdate(
        { owner, _id: contactId },
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


