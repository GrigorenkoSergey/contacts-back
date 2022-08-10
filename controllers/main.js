const jwt = require('jsonwebtoken');
const { BadRequestError } = require('../errors');
const db = require('../db/mocks');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError('Login and password are required!');
  }

  const user = db.find(u => u.username === username);
  if (!user) throw new BadRequestError(`Login doesn't exist!`);
  if (user.password !== password) throw new BadRequestError(`Incorrect password!`);

  const id = new Date().getTime();
  const token = jwt.sign({ id, username }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.status(200).json({ msg: 'user logged in', token });
};

const sendContacts = async (req, res) => {
  const { user } = req;
  const data = db.find(u => u.username === user.username).contacts;

  res.status(200).json({
    data,
  });
};

module.exports = {
  login,
  sendContacts,
};
