require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

// extra security packages
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');

const mainRouter = require('./routes/main');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 20000, // 20 seconds
    max: 30, // limit each IP to 30 requests per windowMs
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(express.static('./public'));
app.use(express.json());

app.use('/contacts', (req, res) => res.redirect('/'));
app.use('/api/v1', mainRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
