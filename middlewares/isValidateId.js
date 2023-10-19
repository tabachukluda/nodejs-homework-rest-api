const mongoose = require('mongoose');

const validateId = (req, res, next) => {
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
        return res.status(400).json({ message: `${contactId} not valid id` });
    }

    next();
}

module.exports = validateId;
