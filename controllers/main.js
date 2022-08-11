const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { BadRequestError } = require('../errors');
const db = require('../db/mocks');

// not used yet
const createUser = async (req, res) => {
  const { username, password, email } = req.body;

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

const sendContacts = async (req, res) => {
  const { user } = req;
  const data = db.find(u => u.login === user.login).contacts;

  res.status(200).json({
    data,
  });
};

module.exports = {
  login,
  sendContacts,
  createUser,
};
