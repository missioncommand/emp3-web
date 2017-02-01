/**
 * Creates a lat lon string in kml coordinate format.
 *
 * @param {Integer} [num] The number of random points needed
 * @param {Number} [lat] The starting latitude for the random points.
 * @param {Number} [lon] The starting longitude for the random points.
 */
export const createRandomPositionsKML = (num, lat, lon) => {
  const range = 30, // How far apart we want the values.  maxRange = minRange + range.
    startLat = 30,
    startLon = 30; // The starting point.
  let latAnchor,
    lonAnchor;

  if (lat !== undefined) {
    latAnchor = lat;
  }
  else {
    latAnchor = Math.random() * range + startLat;
  }

  if (lon !== undefined) {
    lonAnchor = lon;
  }
  else {
    lonAnchor = Math.random() * range + startLon;
  }

  let up = true;

  let positions = "";

  if (num === undefined || num <= 1 || num === null) {
    positions = lonAnchor.toFixed(1) + "," + latAnchor.toFixed(1);
  }
  else {
    // If longer than a single position, just increment lat an lon.
    // latitude will toggle up and down as the longiude moves right.
    positions = lonAnchor.toFixed(1) + "," + latAnchor.toFixed(1) + " ";

    for (var i = 1; i < num; i++) {
      if (up) {
        latAnchor += .5;
      }
      else {
        latAnchor -= .5;
      }
      lonAnchor += .5;

      positions += lonAnchor.toFixed(1) + "," + latAnchor.toFixed(1) + " ";
      up = !up;
    }
  }

  return positions;
};

/**
 * Converts a kml coordinate string to Array of GeoPosition objects.
 */
export const convertPositionStringToGeoPositions = (coordinateString) => {
  let positions = [];
  let position;
  let coordinate;
  let coordinates = coordinateString.trim().split(' ');

  for (var i = 0, len = coordinates.length; i < len; i++) {
    coordinate = coordinates[i].split(',');
    position = {};

    // skip any coordinates that only have one coordinate.
    if (coordinate.length === 2) {
      position.longitude = parseFloat(coordinate[0]);
      position.latitude = parseFloat(coordinate[1]);
      positions.push(position);
    }
    else if (coordinate.length >= 3) {
      position.longitude = parseFloat(coordinate[0]);
      position.latitude = parseFloat(coordinate[1]);
      position.altitude = parseFloat(coordinate[2]);
      positions.push(position);
    }
  }

  return positions;
};

/**
 * Creates a GeoPosition array of random positions.
 *
 * @param {Integer} [num] The number of random points needed
 * @param {Number} lat The starting latitude for the random points.
 * @param {Number} lon The starting longitude for the random points.
 */
export const createRandomPositions = (num, lat, lon) => {
  return convertPositionStringToGeoPositions(createRandomPositionsKML(num, lat, lon));
};
