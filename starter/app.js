const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES
//   serving static files
app.use(express.static(path.join(__dirname, 'public')));
//  security headers
app.use(helmet());
// console.log(process.env.NODE_ENV);

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit requests from same api
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP,please try again in an hour ',
});

app.use('/api', limiter);

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'));
}

//  body parser, reading data from my body to req.body
app.use(express.json());

// Data sanitization against Nosql query injection
app.use(mongoSanitize());
// data sanitization against xss
app.use(xss());
// preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// app.use((req, res, next) => {
//   console.log('hello from the middleware');
//   next();
// });

//  test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

// ROUTES
app.get((req, res) => {
  req.status(200).render('base');
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// SERVER
module.exports = app;
