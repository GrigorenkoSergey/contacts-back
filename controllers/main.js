const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { BadRequestError } = require('../errors');
const db = require('../db/mocks');

const MAX_STRING_LENGTH = 150;
const truncateString = str => str.length > MAX_STRING_LENGTH ? str.slice(0, MAX_STRING_LENGTH) + '...' : str;

// not used yet (only to encode initial passwords)
const createUser = async (req, res) => {
  const { password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const encodedPassword = await bcrypt.hash(password, salt);

  console.log('password: ', password);
  console.log('encoded password: ', encodedPassword);
};

const login = async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    throw new BadRequestError('Login and password are required!');
  }

  const user = db.find(u => u.login === login);
  if (!user) throw new BadRequestError(`Login doesn't exist!`);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new BadRequestError(`Incorrect password!`);

  const id = new Date().getTime();
  const token = jwt.sign({ id, login }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  res.status(200).json({
    data: {
      msg: 'user logged in',
      fullname: user.fullname,
      token
    }
  });
};

const sendContacts = (req, res) => {
  const { user } = req;
  const data = db.find(u => u.login === user.login).contacts;
  res.status(200).json({ data });
};

const createContact = (req, res) => {
  const { user } = req;
  const contacts = db.find(u => u.login === user.login).contacts;

  if (contacts.length > 100) {
    throw new BadRequestError('Максимум 100 контактов на данном тарифном плане.');
  }

  const { name, email = '', phone = '', notes = '' } = req.body;
  const hasDouble = contacts.find(
    v => v.name === name && (
      ((v.phone || phone) && v.phone === phone) // compare only if both are non empty strings
      || ((v.email || email) && v.email === email)
    )
  );
  if (hasDouble) throw new BadRequestError('Дублирование контакта. В создании отказано.');

  const id = Math.max(...contacts.map(c => c.id)) + 1;

  const newContact = {
    id,
    name: truncateString(name),
    phone: truncateString(String(phone)),
    email: truncateString(email),
    notes: truncateString(notes),
  };
  contacts.push(newContact);
  contacts.sort((a, b) => a.name.localeCompare(b.name));

  res.status(200).json({ data: newContact });
};

const removeContact = (req, res) => {
  const { user } = req;
  const contacts = db.find(u => u.login === user.login).contacts;

  const { id } = req.body;
  const index = contacts.findIndex(c => c.id === id);
  if (index === -1) throw new BadRequestError(`Нет контакта с данным id: ${id}`);

  contacts.splice(index, 1);
  res.status(200).json({ data: 'success' });
};

const updateContact = (req, res) => {
  const { user } = req;
  const contacts = db.find(u => u.login === user.login).contacts;

  const { id, name, email = '', phone = '', notes = '' } = req.body;
  const contact = contacts.find(c => c.id === id);
  if (!contact) throw new BadRequestError(`Не существует контакта с данным id: ${id}!`);

  Object.assign(contact, {
    name: truncateString(name),
    email: truncateString(email),
    phone: truncateString(String(phone)),
    notes: truncateString(notes),
  });
  contacts.sort((a, b) => a.name.localeCompare(b.name));

  res.status(200).json({ data: contact });
};

module.exports = {
  login,
  sendContacts,
  createUser,
  createContact,
  removeContact,
  updateContact,
};
