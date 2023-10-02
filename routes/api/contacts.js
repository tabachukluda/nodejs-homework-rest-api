const express = require('express')

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("../../models/contacts.js")


const { contactSchema } = require('../../schemas/validator.js')

const router = express.Router()

router.get('/', async (req, res, next) => {
	try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
});

router.get('/:contactId', async (req, res, next) => {
	  try {
    const contact = await getContactById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      const fieldName = error.details[0].context.key;
      return res.status(400).json({ message: `missing required ${fieldName} field` });
    }
    const contact = await addContact(req.body);
    return res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
});

router.delete('/:contactId', async (req, res, next) => {
	const { contactId } = req.params
	const contact = await removeContact(contactId)
	if (contact) {
		res.status(200).json({ message: 'contact deleted' })
	} else {
		res.status(404).json({ message: 'Not found' })
	}
})


router.put('/:contactId', async (req, res, next) => {
	const { error } = contactSchema.validate(req.body)
	if (error) return res.status(400).json({ message: error.details[0].message })
	const { name, email, phone } = req.body
	const { contactId } = req.params
	if (!name && !email && !phone) {
		res.status(400).json({ message: 'missing fields' })
	}
	const contact = await updateContact(contactId, req.body)
	if (contact) {
		res.status(200).json(contact)
	} else {
		res.status(404).json({ message: 'Not found' })
	}
})


module.exports = router
