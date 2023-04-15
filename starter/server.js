const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(' UNCAUGHT EXCEPTIONS ! shutting down......');
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');
// console.log(process.env);

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server is listening at port ${PORT}`);
});

process.on(' unhandledRejection', (err) => {
  console.log(' UNHANDLED REJECTIONS ! shutting down......');
  console.log(err.name, err.message);
  Server.close(() => {
    process.exit(1);
  });
});
