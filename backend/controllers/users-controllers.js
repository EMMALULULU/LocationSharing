const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/users-model');
const HttpError = require('../models/http-error');

async function getUsers(request, response, next) {
  try {
    var users = await User.find({}, '-password'); //exclude  the password property
  } catch (error) {
    return next(new HttpError('fetching users failed', 500));
  }
  response.json({
    user: users.map((user) => user.toObject({ getters: true })),
  });
}

async function signUp(request, response, next) {
  // check if the inputs are valid
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('invalid inputs...', 422));
  }

  const { name, password, email } = request.body;

  // check if the user email has existed
  try {
    var existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('something went wrong when sign up', 500));
  }
  if (existingUser) {
    return next(new HttpError('Sign up failed,email has been registered', 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError('Could not create user', 500));
  }

  const user = new User({
    name,
    image: request.file.path,
    email,
    password: hashedPassword,
    places: [],
  });
  try {
    await user.save();
  } catch (error) {
    return next(new HttpError('sign up failed', 500));
  }
  // generate token

  let token;
  try {
    token = jwt.sign(
      { userId: user.Id, email: user.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(new HttpError('sign up failed', 500));
  }

  response.status(200).json({ userId: user.id, email: user.email, token });
}

async function logIn(request, response, next) {
  const { password, email } = request.body;

  // check if the user email has existed
  try {
    var existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('something went wrong when log in', 500));
  }

  if (!existingUser) {
    return next(new HttpError('Log in failed,email is not correct', 403));
  }

  // check the password, extract the hash and compare

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(
      new HttpError('Could not log you in, check your credentials', 500)
    );
  }

  if (!isValidPassword) {
    return next(new HttpError('Invalid credentials', 403));
  }

  // pass the password checking
  // generate token
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(
      new HttpError('Could not log you in, check your credentials', 500)
    );
  }
  response.json({
    userId: existingUser.id,
    email: existingUser.email,
    token,
  });
}

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
