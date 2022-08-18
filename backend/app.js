const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
app = express();

app.use(bodyParser.json()); // first parsing the body
app.use('/uploads/images', express.static(path.join('uploads', 'images'))); //just return a file
// handle the CROS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

// handle the request
app.use('/api/places', placesRoutes); //=>/api/places..  path starting with the  filter
app.use('/api/users', usersRoutes);

//only reached if before no response sent
app.use((request, response, next) => {
  throw new HttpError('Could not find the routes.', 404);
});

//default error handling
app.use((error, request, response, next) => {
  if (request.file) {
    // delete stored image
    fs.unlink(request.file.path, (err) => {
      console.log(err);
    });
  }
  if (response.headerSent) {
    return next(error);
  }
  response.status(error.code || 500);
  response.json({ message: error.message || 'An unknown error occurred!' });
}); //error handler middleware

//connect to db
mongoose
  .connect(
    'mongodb+srv://zijun:EFUEZaD0pfr7ovkX@cluster0.yonc71b.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(() => {
    // if the connection to the database is successful
    // then start the backend server
    console.log('database connected');
    app.listen(4000);
  })
  .catch((err) => {
    console.log(err);
  });
