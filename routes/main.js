const express = require('express');
const router = express.Router();

const { login, sendContacts } = require('../controllers/main');

const authMiddleware = require('../middleware/auth');

router.route('/contacts').get(authMiddleware, sendContacts);
router.route('/login').post(login);

module.exports = router;
