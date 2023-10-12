const express = require('express')

const contactController = require('../../controllers/contactsControllers.js')

const router = express.Router()

router.get('/', contactController.getAll)

router.get('/:contactId', contactController.getById)

router.post('/', contactController.add)

router.delete('/:contactId', contactController.deleteContact)

router.put("/:contactId",  contactController.updateContact)

router.patch('/:contactId/favorite', contactController.setFavorite)


module.exports = router
