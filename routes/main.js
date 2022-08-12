const express = require('express');
const router = express.Router();

const { login, sendContacts, createContact,
  removeContact, updateContact } = require('../controllers/main');

const authMiddleware = require('../middleware/auth');

router.use('/contacts', authMiddleware);
router.route('/contacts')
  .get(sendContacts)
  .post(createContact)
  .delete(removeContact)
  .put(updateContact);

router.route('/login').post(login);

module.exports = router;
