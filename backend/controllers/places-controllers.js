const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const fs = require('fs');
const User = require('../models/users-model');
const Place = require('../models/places-model');
const HttpError = require('../models/http-error');
const getCoordsFromAddress = require('../util/location');
const { default: mongoose } = require('mongoose');

async function getPlaceById(request, response, next) {
  const placeId = request.params.pid;
  let place = null;

  // error handling for request went wrong
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError('something went wrong, could not fetch the place', 500)
    );
  }
  // error handling for no existed place in database
  if (!place) {
    return next(
      new HttpError('could not find a place for the provided id.', 404)
    );
  }
  response.json({ place: place.toObject({ getters: true }) });
}

async function getPlacesByUserId(request, response, next) {
  const userId = request.params.uid;

  try {
    var userWithPlaces = await User.findById(userId).populate('places');
  } catch (error) {
    return next(
      new HttpError("something went wrong, could not fetch user's place..", 500)
    );
  }

  if (!userWithPlaces) {
    return next(
      new HttpError('could not find a place for the provided user id.', 404)
    );
  }
  //else if(userWithPlaces.places.length === 0){
  //   return response.json({message:'No '})
  // }
  response.json({
    places: userWithPlaces.places.map((plc) => plc.toObject({ getters: true })),
  });
}

async function createPlace(request, response, next) {
  //validate input
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return next(new HttpError('invalid inputs', 422));
  }

  // geo coding transform address into coordinates
  const { title, description, address, creator } = request.body;
  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    return next(error);
  }

  // create place
  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    creator,
    image: request.file.path,
  });
  // check the creator is existed
  try {
    var user = await User.findById(creator);
  } catch (error) {
    return next(new HttpError('Creating place failed', 500));
  }
  // if user not existed
  if (!user) {
    return next(new HttpError('Could not find the user', 404));
  }
  // when creator user existed, create new place and add place to places of user
  try {
    const sess = await mongoose.startSession(); // start the session
    sess.startTransaction(); // setup transaction
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction(); // finish the transaction
  } catch (error) {
    return next(
      new HttpError('something went wrong, could not save the place', 500)
    );
  }
  response.status(201).json({ place: createdPlace });
}

async function updatePlaceById(request, response, next) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('invalid inputs', 422);
  }
  const placeId = request.params.pid;
  const { title, description } = request.body;
  let place = null;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError('something went wrong, could not update place'),
      500
    );
  }

  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError('something went wrong, could not update place'),
      500
    );
  }
  response.status(200).json({ place: place.toObject({ getters: true }) });
}

async function deletePlaceById(request, response, next) {
  const placeId = request.params.pid;

  try {
    var place = await Place.findById(placeId).populate('creator');
  } catch (error) {
    return next(
      new HttpError('something went wrong, could not delete place', 500)
    );
  }

  if (!place) {
    return next(new HttpError('could not find the place for this ID', 500));
  }
  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError('something went wrong, could not delete place', 500)
    );
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  response.status(200).json({ message: 'place deleted!' });
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
