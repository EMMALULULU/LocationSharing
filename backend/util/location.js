const axios = require('axios');
const API_KEY = 'AIzaSyAyYT5UsHs23-sO8F071NaTXkl_0UJRAow';

const HttpError = require('../models/http-error');
async function getCoordsFromAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  const data = response.data;
  if (!data || data.status === 'ZERO_RESULTS') {
    throw new HttpError('Could not find the location!', 422);
  }
  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsFromAddress;
