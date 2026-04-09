const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const apiRateLimiter = require('./common/middleware/rateLimiter');
const notFound = require('./common/middleware/notFound');
const errorHandler = require('./common/middleware/errorHandler');
const apiRouter = require('./routes');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(hpp());
app.use(mongoSanitize());

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/v1', apiRateLimiter, apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
