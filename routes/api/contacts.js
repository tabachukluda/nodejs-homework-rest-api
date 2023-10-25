const express = require('express')

const contactController = require('../../controllers/contactsControllers.js')

const validateId = require('../../middlewares/isValidateId.js')

const authenticate = require('../../middlewares/authenticate.js')

const router = express.Router()

router.use(authenticate);

router.get('/', contactController.getAll)

router.get('/:contactId', validateId, contactController.getById)

router.post('/', contactController.add)

router.delete('/:contactId', validateId, contactController.deleteContact)

router.put("/:contactId", validateId, contactController.updateContact)

router.patch('/:contactId/favorite',validateId, contactController.setFavorite)


module.exports = router
