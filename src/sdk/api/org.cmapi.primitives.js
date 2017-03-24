/**
 * @namespace
 */
cmapi = cmapi || {};

/**
 * @namespace
 */
cmapi.enums = {
  /**
   * @readonly
   * @enum {string}
   */
  altitudeMode: {
    CLAMP_TO_GROUND: "CLAMP_TO_GROUND",
    RELATIVE_TO_GROUND: "RELATIVE_TO_GROUND",
    ABSOLUTE: "ABSOLUTE"
  },
  /**
   * @readonly
   * @enum {string}
   */
  fillPattern: {
    solid: "solid",
    hatched: "hatched",
    crossHatched: "crossHatched"
  },
  /**
   * @readonly
   * @enum {string}
   */
  justification: {
    LEFT: "LEFT",
    CENTER: "CENTER",
    RIGHT: "RIGHT"
  },
  /**
   * @readonly
   * @enum {string}
   */
  typeface: {
    REGULAR: "REGULAR",
    BOLD: "BOLD",
    ITALIC: "ITALIC",
    BOLDITALIC: "BOLDITALIC"
  },
  /**
   * @readonly
   * @enum {string}
   */  symbolStandard: {
    MIL_STD_2525C: "2525c",
    MIL_STD_2525B: "2525b"
  },
  /**
   * @readonly
   * @enum {string}
   */
  acmType: {
    ROUTE: "ROUTE----------",
    CYLINDER: "CYLINDER-------",
    ORBIT: "ORBIT----------",
    POLYGON: "POLYGON--------",
    RADARC: "RADARC---------",
    POLYARC: "POLYARC--------",
    TRACK: "TRACK----------",
    CURTAIN: "CURTAIN--------"
  }
};

/**
 * @interface
 * @param {object} [args]
 */
cmapi.IGeoAltitudeMode = function(args) {

  "use strict";

  /**
   * @private
   */
  var _altitudeMode;
  /**
   * @type {cmapi.enums.altitudeMode}
   * @name cmapi.IGeoAltitudeMode#altitudeMode
   */
  Object.defineProperty(this, "altitudeMode", {
    enumerable: true,
    get: function() {
      return _altitudeMode;
    },
    set: function(value) {
      _altitudeMode = value;
    }
  });

  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * Defines a range in time that represents a beginning and end.  This can be used to describe things such as availability, visibility, active/inactive for provided periods of time.  From a filtering point of view, if a time filter is applied a feature would only be visible on a map view within the defined timespan(s)
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoTimeSpan} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoTimeSpan = function(args) {

  "use strict";

  var _begin;
  /**
   * @type {string}
   * @name cmapi.IGeoTimeSpan#begin
   */
  Object.defineProperty(this, "begin", {

    enumerable: true,
    get: function() {
      return _begin;
    },

    set: function(value) {
      _begin = value;
    }

  });

  var _end;
  /**
   * @type {string}
   * @name cmapi.IGeoTimeSpan#end
   */
  Object.defineProperty(this, "end", {

    enumerable: true,
    get: function() {
      return _end;
    },

    set: function(value) {
      _end = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * Defines a specific geospatial position derived using WGS-84 latitude longitude
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoPosition} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoPosition = function(args) {

  "use strict";

  var _latitude = 0;
  /**
   * Latitude value in degrees decimal (i.e. 23.4567) derived from WGS-84
   * @type {number}
   * @name cmapi.IGeoPosition#latitude
   */
  Object.defineProperty(this, "latitude", {

    enumerable: true,
    get: function() {
      return _latitude;
    },

    set: function(value) {
      _latitude = value;
    }

  });

  var _longitude = 0;
  /**
   * Longitude value in degrees decimal (i.e. 23.4567) derived from WGS-84
   * @type {number}
   * @name cmapi.IGeoPosition#longitude
   */
  Object.defineProperty(this, "longitude", {

    enumerable: true,
    get: function() {
      return _longitude;
    },

    set: function(value) {
      _longitude = value;
    }

  });

  var _altitude = 0;
  /**
   * A value in meters representing the altitude of the associated position.  This will be interpreted base on the altitudeMode provided in the IGeoAltitudeMode enumeration
   * @type {number}
   * @name cmapi.IGeoPosition#altitude
   */
  Object.defineProperty(this, "altitude", {

    enumerable: true,
    get: function() {
      return _altitude;
    },

    set: function(value) {
      _altitude = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * An ordered list of positions representing a 1 or more positions with an associated IGeoAltitudeMode to interpret the altitude values.  In the case of a point, a single position will create a single icon, wheras mulitple positions will create the same icon at multiple positions to be interpreted as a composite feature. For consistency, and IGeoRenderables use an IGeoPositionGroup even when only containing a single position
 * @interface
 * @augments cmapi.IGeoAltitudeMode
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoPositionGroup} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoPositionGroup = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoAltitudeMode(), this);

  var _positions;
  /**
   * An ordered list of IGeoPosition objects representing a 1 or more positions with an associated IGeoAltitudeMode to interpret the altitude values.  In the case of a point, a single position will create a single icon, wheras mulitple positions will create the same icon at multiple positions to be interpreted as a composite feature. For consistency, and IGeoRenderables use an IGeoPositionGroup even when only containing a single positions
   * @type {IGeoPosition[]}
   * @name cmapi.IGeoPositionGroup#positions
   */
  Object.defineProperty(this, "positions", {

    enumerable: true,
    get: function() {
      return _positions;
    },

    set: function(value) {
      _positions = value;
    }

  });

  var _timeStamp;
  /**
   * Defines a point in time that something occurred, was created, or was last updated time value as defined by http://tools.ietf.org/html/rfc3339
   * @type {string}
   * @name cmapi.IGeoPositionGroup#timeStamp
   */
  Object.defineProperty(this, "timeStamp", {

    enumerable: true,
    get: function() {
      return _timeStamp;
    },

    set: function(value) {
      _timeStamp = value;
    }

  });

  var _timeSpans;
  /**
   * Defines one or more periods of time something occurred, or was active.
   * @type {cmapi.IGeoTimeSpan[]}
   * @name cmapi.IGeoPositionGroup#timeSpans
   */
  Object.defineProperty(this, "timeSpans", {

    enumerable: true,
    get: function() {
      return _timeSpans;
    },
    set: function(value) {
      _timeSpans = value;
    }
  });

  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * An ordered collection of IGeoPositionGroup objects
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoPositionHistory} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoPositionHistory = function(args) {

  "use strict";

  var _positionHistory;
  /**
   * @type {cmapi.IGeoPositionGroup[]}
   * @name cmapi.IGeoPositionHistory#positionHistory
   */
  Object.defineProperty(this, "positionHistory", {

    enumerable: true,
    get: function() {
      return _positionHistory;
    },
    set: function(value) {
      _positionHistory = value;
    }
  });

  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * Defines the virtual camera that views the scene. This element defines the position of the camera relative to the Earth's surface as well as the viewing direction of the camera. The camera position is defined by <longitude>, <latitude>, <altitude>, and either <altitudeMode>. The viewing direction of the camera is defined by <azimuth>, <tilt>, and <roll>. An IGeoCamera provides full six-degrees-of-freedom control over the view, so you can position the Camera in space and then rotate it around the X, Y, and Z axes. Most importantly, you can tilt the camera view so that you're looking above the horizon into the sky. The order of rotation is important. By default, the camera is looking straight down the −Z axis toward the Earth. Before rotations are performed, the camera is translated along the Z axis to <altitude>. The order of transformations is as follows: <altitude> - translate along the Z axis to <altitude><azimuth> - rotate around the Z axis.<tilt> - rotate around the X axis.<roll> - rotate around the Z axis (again). Note that each time a rotation is applied, two of the camera axes change their orientation.
 * @interface
 * @augments cmapi.IGeoBase
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoCamera} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoCamera = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoBase(), this);

  var _altitudeMode;
  /**
   * Enumeration of altitude modes to define how the altitude value in an IGeoPosition alt (altitude) property will be interpreted
   * @type {cmapi.enums.altitudeMode}
   * @name cmapi.IGeoCamera#altitudeMode
   */
  Object.defineProperty(this, "altitudeMode", {

    enumerable: true,
    get: function() {
      return _altitudeMode;
    },

    set: function(value) {
      _altitudeMode = value;
    }

  });

  var _latitude = 0;
  /**
   * Latitude value in degrees decimal (i.e. 23.4567) derived from WGS-84
   * @type {number}
   * @name cmapi.IGeoCamera#latitude
   */
  Object.defineProperty(this, "latitude", {

    enumerable: true,
    get: function() {
      return _latitude;
    },

    set: function(value) {
      _latitude = value;
    }

  });

  var _longitude = 0;
  /**
   * Longitude value in degrees decimal (i.e. 23.4567) derived from WGS-84
   * @type {number}
   * @name cmapi.IGeoCamera#longitude
   */
  Object.defineProperty(this, "longitude", {

    enumerable: true,
    get: function() {
      return _longitude;
    },

    set: function(value) {
      _longitude = value;
    }

  });

  var _altitude = 0;
  /**
   * A value in meters representing the altitude of the associated position.  This will be interpreted base on the altitudeMode provided in the IGeoAltitudeMode enumeration
   * @type {number}
   * @name cmapi.IGeoCamera#altitude
   */
  Object.defineProperty(this, "altitude", {

    enumerable: true,
    get: function() {
      return _altitude;
    },

    set: function(value) {
      _altitude = value;
    }

  });

  var _tilt = 0;
  /**
   * Rotation, in degrees, of the camera around the X axis. A value of 0 indicates that the view is aimed straight down toward the earth (the most common case). A value for 90 for <tilt> indicates that the view is aimed toward the horizon. Values greater than 90 indicate that the view is pointed up into the sky. Values for <tilt> are clamped at +180 degrees
   * @type {number}
   * @name cmapi.IGeoCamera#tilt
   */
  Object.defineProperty(this, "tilt", {

    enumerable: true,
    get: function() {
      return _tilt;
    },

    set: function(value) {
      _tilt = value;
    }

  });

  var _roll = 0;
  /**
   * Rotation, in degrees, of the camera around the Z axis. Values range from −180 to +180 degrees
   * @type {number}
   * @name cmapi.IGeoCamera#roll
   */
  Object.defineProperty(this, "roll", {

    enumerable: true,
    get: function() {
      return _roll;
    },

    set: function(value) {
      _roll = value;
    }

  });

  var _heading = 0;
  /**
   * Direction (that is, North, South, East, West), in degrees. Default=0 (North). Values range from 0 to 360 degrees
   * @type {number}
   * @name cmapi.IGeoCamera#heading
   */
  Object.defineProperty(this, "heading", {

    enumerable: true,
    get: function() {
      return _heading;
    },

    set: function(value) {
      _heading = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * The LookAt element positions the 'camera' in relation to the IGeoPosition that is being viewed
 * @interface
 * @augments cmapi.IGeoBase
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoLookAt} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoLookAt = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoBase(), this);

  var _altitudeMode;
  /**
   * Enumeration of altitude modes to define how the altitude value in an IGeoPosition alt (altitude) property will be interpreted
   * @type {cmapi.enums.altitudeMode}
   * @name cmapi.IGeoLookAt#altitudeMode
   */
  Object.defineProperty(this, "altitudeMode", {

    enumerable: true,
    get: function() {
      return _altitudeMode;
    },

    set: function(value) {
      _altitudeMode = value;
    }

  });

  var _latitude = 0;
  /**
   * Latitude value in degrees decimal (i.e. 23.4567) derived from WGS-84
   * @type {number}
   * @name cmapi.IGeoLookAt#latitude
   */
  Object.defineProperty(this, "latitude", {

    enumerable: true,
    get: function() {
      return _latitude;
    },

    set: function(value) {
      _latitude = value;
    }

  });

  var _longitude = 0;
  /**
   * Longitude value in degrees decimal (i.e. 23.4567) derived from WGS-84
   * @type {number}
   * @name cmapi.IGeoLookAt#longitude
   */
  Object.defineProperty(this, "longitude", {

    enumerable: true,
    get: function() {
      return _longitude;
    },

    set: function(value) {
      _longitude = value;
    }

  });

  var _altitude = 0;
  /**
   * A value in meters representing the altitude of the associated position.  This will be interpreted base on the altitudeMode provided in the IGeoAltitudeMode enumeration
   * @type {number}
   * @name cmapi.IGeoLookAt#altitude
   */
  Object.defineProperty(this, "altitude", {

    enumerable: true,
    get: function() {
      return _altitude;
    },

    set: function(value) {
      _altitude = value;
    }

  });

  var _tilt = 0;
  /**
   * Rotation, in degrees, of the camera around the X axis. A value of 0 indicates that the view is aimed straight down toward the earth (the most common case). A value for 90 for <tilt> indicates that the view is aimed toward the horizon. Values greater than 90 indicate that the view is pointed up into the sky. Values for <tilt> are clamped at +180 degrees.
   * @type {number}
   * @name cmapi.IGeoLookAt#tilt
   */
  Object.defineProperty(this, "tilt", {

    enumerable: true,
    get: function() {
      return _tilt;
    },

    set: function(value) {
      _tilt = value;
    }

  });

  var _heading = 0;
  /**
   * Direction (that is, North, South, East, West), in degrees. Default=0 (North). Values range from 0 to 360 degrees
   * @type {number}
   * @name cmapi.IGeoLookAt#heading
   */
  Object.defineProperty(this, "heading", {

    enumerable: true,
    get: function() {
      return _heading;
    },

    set: function(value) {
      _heading = value;
    }

  });

  var _range = 1000000;
  /**
   * Distance in meters from the point specified by IGeoPosition to the LookAt position
   * @type {number}
   * @name cmapi.IGeoLookAt#range
   */
  Object.defineProperty(this, "range", {

    enumerable: true,
    get: function() {
      return _range;
    },

    set: function(value) {
      _range = value;
    }

  });


  this.patchProps = cmapi.patchProps;
  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoBounds} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoBounds = function(args) {

  "use strict";

  var _west;
  /**
   * @type {number}
   * @name cmapi.IGeoBounds#west
   */
  Object.defineProperty(this, "west", {

    enumerable: true,
    get: function() {
      return _west;
    },

    set: function(value) {
      _west = value;
    }

  });

  var _east;
  /**
   * @type {number}
   * @name cmapi.IGeoBounds#east
   */
  Object.defineProperty(this, "east", {

    enumerable: true,
    get: function() {
      return _east;
    },

    set: function(value) {
      _east = value;
    }

  });

  var _north;
  /**
   * @type {number}
   * @name cmapi.IGeoBounds#north
   */
  Object.defineProperty(this, "north", {

    enumerable: true,
    get: function() {
      return _north;
    },

    set: function(value) {
      _north = value;
    }

  });

  var _south;
  /**
   * @type {number}
   * @name cmapi.IGeoBounds#south
   */
  Object.defineProperty(this, "south", {

    enumerable: true,
    get: function() {
      return _south;
    },

    set: function(value) {
      _south = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoView} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoView = function(args) {

  "use strict";

  var _camera;
  /**
   * @type {cmapi.IGeoCamera}
   * @name cmapi.IGeoView#camera
   */
  Object.defineProperty(this, "camera", {

    enumerable: true,
    get: function() {
      return _camera;
    },

    set: function(value) {
      _camera = value;
    }

  });

  var _lookAt;
  /**
   * @type {cmapi.IGeoLookAt}
   * @name cmapi.IGeoView#lookAt
   */
  Object.defineProperty(this, "lookAt", {

    enumerable: true,
    get: function() {
      return _lookAt;
    },

    set: function(value) {
      _lookAt = value;
    }

  });

  var _bounds;
  /**
   * @type {cmapi.IGeoBounds}
   * @name cmapi.IGeoView#bounds
   */
  Object.defineProperty(this, "bounds", {

    enumerable: true,
    get: function() {
      return _bounds;
    },

    set: function(value) {
      _bounds = value;
    }

  });

  var _scale;
  /**
   * Approximate map scale of current view
   * @type {number}
   * @name cmapi.IGeoView#scale
   */
  Object.defineProperty(this, "scale", {

    enumerable: true,
    get: function() {
      return _scale;
    },

    set: function(value) {
      _scale = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * Object containing three color channels for red, green, and blue as well as an alpha channel for opacity
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoColor} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoColor = function(args) {

  "use strict";

  var _red = 0;
  /**
   * Value for red color channel. Integer ranging between 0 and 255
   * @type {number}
   * @name cmapi.IGeoColor#red
   */
  Object.defineProperty(this, "red", {

    enumerable: true,
    get: function() {
      return _red;
    },

    set: function(value) {
      _red = value;
    }

  });

  var _green = 0;
  /**
   * Value for green color channel. Integer ranging between 0 and 255
   * @type {number}
   * @name cmapi.IGeoColor#green
   */
  Object.defineProperty(this, "green", {

    enumerable: true,
    get: function() {
      return _green;
    },

    set: function(value) {
      _green = value;
    }

  });

  var _blue = 0;
  /**
   * Value for blue color channel. Integer ranging between 0 and 255
   * @type {number}
   * @name cmapi.IGeoColor#blue
   */
  Object.defineProperty(this, "blue", {

    enumerable: true,
    get: function() {
      return _blue;
    },

    set: function(value) {
      _blue = value;
    }

  });

  var _alpha = 0.8;
  /**
   * Value for alpha channel to control opacity. Decimal ranging from 0 to 1
   * @type {number}
   * @name cmapi.IGeoColor#alpha
   */
  Object.defineProperty(this, "alpha", {

    enumerable: true,
    get: function() {
      return _alpha;
    },

    set: function(value) {
      _alpha = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoStrokeStyle} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoStrokeStyle = function(args) {

  "use strict";

  var _strokeColor;
  /**
   * Color of a path, or outline color of a feature such as a polygon or circle.  The fill and stroke can be set separately to create a contract between the stroke and fill of any feature
   * @type {cmapi.IGeoColor}
   * @name cmapi.IGeoStrokeStyle#strokeColor
   */
  Object.defineProperty(this, "strokeColor", {

    enumerable: true,
    get: function() {
      return _strokeColor;
    },

    set: function(value) {
      _strokeColor = value;
    }

  });

  /**
   * Default stippling pattern
   * @type {number}
   * @private
   */
  var _stipplingPattern = 0;
  /**
   * Specifies a number whose lower 16 bits define a pattern of which pixels in the image are white and which are transparent. Each bit corresponds to a pixel, and the pattern repeats after every n*16 pixels, where n is the factor. For example, if the factor is 3, each bit in the pattern is repeated three times before using the next bit
   * @type {number}
   * @name cmapi.IGeoStrokeStyle#stipplingPattern
   */
  Object.defineProperty(this, "stipplingPattern", {

    enumerable: true,
    get: function() {
      return _stipplingPattern;
    },

    set: function(value) {
      _stipplingPattern = value;
    }

  });

  /**
   * Default stipplingFactor
   * @type {number}
   * @private
   */
  var _stipplingFactor = 0;
  /**
   * Specifies the number of times each bit in the pattern is repeated before the next bit is used. For example, if the factor is 3, each bit is repeated three times before using the next bit. The specified factor must be either 0 or an integer greater than 0. A factor of 0 indicates no stippling
   * @type {number}
   * @name cmapi.IGeoStrokeStyle#stipplingFactor
   */
  Object.defineProperty(this, "stipplingFactor", {

    enumerable: true,
    get: function() {
      return _stipplingFactor;
    },

    set: function(value) {
      _stipplingFactor = value;
    }

  });

  /**
   * Default stroke width
   * @type {number}
   * @private
   */
  var _strokeWidth = 3;
  /**
   * Width of the stroke on the screen in pixels
   * @type {number}
   * @name cmapi.IGeoStrokeStyle#strokeWidth
   */
  Object.defineProperty(this, "strokeWidth", {

    enumerable: true,
    get: function() {
      return _strokeWidth;
    },

    set: function(value) {
      _strokeWidth = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * Style properties for the fill of a feature.  this can either be the interior of a shape such as a polygon or circle, or can also be applied to the fill of an a MIL-STD-2525 Icon to override the default affiliation color
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoFillStyle} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoFillStyle = function(args) {

  "use strict";

  var _description;
  /**
   * @type {string}
   * @name cmapi.IGeoFillStyle#description
   */
  Object.defineProperty(this, "description", {

    enumerable: true,
    get: function() {
      return _description;
    },

    set: function(value) {
      _description = value;
    }

  });

  var _fillColor;
  /**
   * @type {cmapi.IGeoColor}
   * @name cmapi.IGeoFillStyle#fillColor
   */
  Object.defineProperty(this, "fillColor", {

    enumerable: true,
    get: function() {
      return _fillColor;
    },

    set: function(value) {
      _fillColor = value;
    }

  });

  var _fillPattern = "solid";
  /**
   * Fill patterns allow for alternatives to a solid fill color
   * @type {cmapi.enums.fillPattern}
   * @name cmapi.IGeoFillStyle#fillPattern
   */
  Object.defineProperty(this, "fillPattern", {

    enumerable: true,
    get: function() {
      return _fillPattern;
    },

    set: function(value) {
      _fillPattern = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoIconStyle} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoIconStyle = function(args) {

  "use strict";

  /**
   * Default size
   * @type {number}
   * @private
   */
  var _size = 32;
  /**
   * Size in pixels.  If the icon is not square, the size will represent the larger value of the rectangle
   * @type {number}
   * @name cmapi.IGeoIconStyle#size
   */
  Object.defineProperty(this, "size", {

    enumerable: true,
    get: function() {
      return _size;
    },

    set: function(value) {
      _size = value;
    }

  });

  /**
   * Default x offset
   * @type {number}
   * @private
   */
  var _offSetX = 0;
  /**
   * X Offset of icon in pixels derived from the lower left point of the icon
   * @type {number}
   * @name cmapi.IGeoIconStyle#offSetX
   */
  Object.defineProperty(this, "offSetX", {

    enumerable: true,
    get: function() {
      return _offSetX;
    },

    set: function(value) {
      _offSetX = value;
    }

  });

  /**
   * Default y offset
   * @type {number}
   * @private
   */
  var _offSetY = 0;
  /**
   * Y Offset of icon in pixels derived from the lower right point of the icon
   * @type {number}
   * @name cmapi.IGeoIconStyle#offSetY
   */
  Object.defineProperty(this, "offSetY", {

    enumerable: true,
    get: function() {
      return _offSetY;
    },

    set: function(value) {
      _offSetY = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * Style properties for the optional text labels that may display next to feature data on a map
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoLabelStyle} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoLabelStyle = function(args) {

  "use strict";

  /**
   * Default size
   * @type {number}
   * @private
   */
  var _size = 12;
  /**
   * Size of the font in pixels assuming 96 ppi. If the system rendering the text is running at a screen resolution other than 96 ppi, a translation should be done to make the text larger of smaller to represent the same amount of physical space as if the screen were at 96 ppi.  For example if the screen resolution of the target device rednering the text is 126 ppi, you would use the following formula to get a proper pixel value: ( devicePixelsPerInch / 96 ) x IGeoLabelStyle.size = ActualPixelSize or ( 126 / 96 ) * 12 = 16
   * @type {number}
   * @name cmapi.IGeoLabelStyle#size
   */
  Object.defineProperty(this, "size", {

    enumerable: true,
    get: function() {
      return _size;
    },

    set: function(value) {
      _size = value;
    }

  });

  var _color;
  /**
   * The fill color for the text
   * @type {cmapi.IGeoColor}
   * @name cmapi.IGeoLabelStyle#color
   */
  Object.defineProperty(this, "color", {

    enumerable: true,
    get: function() {
      return _color;
    },

    set: function(value) {
      _color = value;
    }

  });

  var _outlineColor;
  /**
   * The outline color for the text
   * @type {cmapi.IGeoColor}
   * @name cmapi.IGeoLabelStyle#outlineColor
   */
  Object.defineProperty(this, "outlineColor", {

    enumerable: true,
    get: function() {
      return _outlineColor;
    },

    set: function(value) {
      _outlineColor = value;
    }

  });

  /**
   * Default justification
   * @type {cmapi.enums.justification}
   * @private
   */
  var _justification = "LEFT";
  /**
   * Position to align text in relation to the associated geospatial coordinate
   * @type {string}
   * @name cmapi.IGeoLabelStyle#justification
   */
  Object.defineProperty(this, "justification", {

    enumerable: true,
    get: function() {
      return _justification;
    },

    set: function(value) {
      _justification = value;
    }

  });

  var _fontFamily;
  /**
   * Name of the font family to be used.  In the case that the system rendering this text does not have the font family, it shall use a default font and still display the text
   * @type {string}
   * @name cmapi.IGeoLabelStyle#fontFamily
   */
  Object.defineProperty(this, "fontFamily", {

    enumerable: true,
    get: function() {
      return _fontFamily;
    },

    set: function(value) {
      _fontFamily = value;
    }

  });

  /**
   * Default typeface
   * @type {cmapi.enums.typeface}
   * @private
   */
  var _typeface = cmapi.enums.typeface.REGULAR;
  /**
   * @type {string}
   * @name cmapi.IGeoLabelStyle#typeface
   */
  Object.defineProperty(this, "typeface", {

    enumerable: true,
    get: function() {
      return _typeface;
    },

    set: function(value) {
      _typeface = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * This is the base object all containers and features are derived from
 * @interface
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoBase} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoBase = function(args) {

  "use strict";

  var _name = "";
  /**
   * Name is used to display text labels alongside to a feature and can be used in user interfaces that manage the data on the map
   * @type {string}
   * @name cmapi.IGeoBase#name
   */
  Object.defineProperty(this, "name", {

    enumerable: true,
    get: function() {
      return _name;
    },

    set: function(value) {
      _name = value;
    }

  });

  var _geoId = cmapi.randomUUID();
  /**
   * The id value should be a UUID @see {@link https://www.ietf.org/rfc/rfc4122.txt} to avoid conflict of data from multiple sources.  All id values SHALL be unique regardless of type and conflicting id values will be treated as the same element.  Once this ID is set, it should not be changed to avoid refernces by ID to break.  The setter is provided so that an item can be deserialized from an object with an exisitng ID or provided an exisiting ID immediately after instantiation.
   * @type {string}
   * @name cmapi.IGeoBase#geoId
   */
  Object.defineProperty(this, "geoId", {

    enumerable: true,
    get: function() {
      return _geoId;
    },

    set: function(value) {
      _geoId = value;
    }

  });

  var _dataProviderId;
  /**
   * This is a free form string that can represent an ID specific to this piece of data as it is tracked uniquely by the system providing this data.  This is different from GeoId as the GeoId is of type UUID.  Some systems may use IDs formatted in a way that it cannot be stored in a UUID.  In this case, this property can be used by the system to track this psece of data by the ID they use internally.  The GeoID proerty will be used by CMAPI as the unique ID and this ID is for the benefit of the system providing the data.
   * @type {string}
   * @name cmapi.IGeoBase#dataProviderId
   */
  Object.defineProperty(this, "dataProviderId", {

    enumerable: true,
    get: function() {
      return _dataProviderId;
    },

    set: function(value) {
      _dataProviderId = value;
    }

  });

  var _description = "";
  /**
   * A simple string, or HTML formatted string that can be displayed to describe the IGeoBase.  In the case of a feature the description property can be used to store the content that should display in a pop up window after clicking on a feature.
   * @type {string}
   * @name cmapi.IGeoBase#description
   */
  Object.defineProperty(this, "description", {

    enumerable: true,
    get: function() {
      return _description;
    },

    set: function(value) {
      _description = value;
    }

  });

  var _properties;
  /**
   * A key value pair where both the key and value where the key is a unique string and the value is an object that can be stored as and read from a string.  In cases where an IGeoBase will be serialized all of the values will be serialized using the objects toString() method.  It is the resposibility of the applications accessing values stored in the properties hash map to determine if the value is in a string format and convert back to whatever object type the string was derived from.  The object should not contain any references to other objects where that relationship is expected to exist beyond copying a current value of a simple type as the relationship will not be properly restored when deserialization occurs.  CMAPI will not use the properties hash for any internal purpose, it will simply allow 3rd party data to pass additional attributes that will stay associated with the CMAPI object as it moves between applications and systems.
   * @type {object}
   * @name cmapi.IGeoBase#properties
   */
  Object.defineProperty(this, "properties", {
    enumerable: true,
    get: function() {
      return _properties;
    }
  });

  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * Geo containers are designed to be a base interface for anything that can contain a children list of IGeoBase objects.  This facilitates the concept of Containers such as overlays, as well as features such as a point that can contain child features.
 * @interface
 * @augments cmapi.IGeoBase
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoContainer} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoContainer = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoBase(), this);

  var _readOnly = false;
  /**
   * Indicates if the object is intended to be read only (true) or allow changes to the values ot its properties (false)
   * @type {boolean}
   * @name cmapi.IGeoContainer#readOnly
   */
  Object.defineProperty(this, "readOnly", {

    enumerable: true,
    get: function() {
      return _readOnly;
    },

    set: function(value) {
      _readOnly = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoContainer
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoRenderable} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoRenderable = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoContainer(), this);

  var _altitudeMode;
  /**
   * Enumeration of altitude modes to define how the altitude value in an IGeoPosition alt (altitude) property will be interpreted
   * @type {cmapi.enums.altitudeMode}
   * @name cmapi.IGeoRenderable#altitudeMode
   */
  Object.defineProperty(this, "altitudeMode", {
    enumerable: true,
    get: function() {
      return _altitudeMode;
    },
    set: function(value) {
      _altitudeMode = value;
    }
  });

  var _positions;
  /**
   * @type {cmapi.IGeoPosition[]}
   * @name cmapi.IGeoRenderable#positions
   */
  Object.defineProperty(this, "positions", {

    enumerable: true,
    get: function() {
      return _positions;
    },
    set: function(value) {
      _positions = value;
    }
  });

  var _timeStamp;
  /**
   * @type {string}
   * @name cmapi.IGeoRenderable#timeStamp
   */
  Object.defineProperty(this, "timeStamp", {

    enumerable: true,
    get: function() {
      return _timeStamp;
    },

    set: function(value) {
      _timeStamp = value;
    }

  });

  var _timeSpans;
  /**
   * Defines one or more periods of time something occurred, or was active.
   * @type {cmapi.IGeoTimeSpan[]}
   * @name cmapi.IGeoRenderable#timeSpans
   */
  Object.defineProperty(this, "timeSpans", {

    enumerable: true,
    get: function() {
      return _timeSpans;
    },

    set: function(value) {
      _timeSpans = value;
    }

  });

  var _labelStyle;
  /**
   * @type {cmapi.IGeoLabelStyle}
   * @name cmapi.IGeoRenderable#labelStyle
   */
  Object.defineProperty(this, "labelStyle", {

    enumerable: true,
    get: function() {
      return _labelStyle;
    },

    set: function(value) {
      _labelStyle = value;
    }

  });

  var _strokeStyle;
  /**
   * @type {cmapi.IGeoStrokeStyle}
   * @name cmapi.IGeoRenderable#strokeStyle
   */
  Object.defineProperty(this, "strokeStyle", {

    enumerable: true,
    get: function() {
      return _strokeStyle;
    },

    set: function(value) {
      _strokeStyle = value;
    }

  });

  var _fillStyle;
  /**
   * @type {cmapi.IGeoFillStyle}
   * @name cmapi.IGeoRenderable#fillStyle
   */
  Object.defineProperty(this, "fillStyle", {

    enumerable: true,
    get: function() {
      return _fillStyle;
    },

    set: function(value) {
      _fillStyle = value;
    }

  });

  var _extrude = false;
  /**
   * A curtain is formed below each point or line segment and extends to the ground
   * @type {boolean}
   * @name cmapi.IGeoRenderable#extrude
   */
  Object.defineProperty(this, "extrude", {

    enumerable: true,
    get: function() {
      return _extrude;
    },

    set: function(value) {
      _extrude = value;
    }

  });

  /**
   * Default tessellate
   * @type {boolean}
   * @private
   */
  var _tessellate = true;
  /**
   * Value determines if the item will follow the terrain and drape, or follow a straight plane cutting through terrain
   * above the altitude of the line segment.  This property is ignored for single position items.
   * @type {boolean}
   * @name cmapi.IGeoRenderable#tessellate
   */
  Object.defineProperty(this, "tessellate", {

    enumerable: true,
    get: function() {
      return _tessellate;
    },

    set: function(value) {
      _tessellate = value;
    }

  });

  /**
   * Default buffer
   * @type {number}
   * @private
   */
  var _buffer = 0;
  /**
   * Indicates if a buffer object in meters can be applied to a single, or list of positions as an extension outwards from the original position(s)
   * @type {number}
   * @name cmapi.IGeoRenderable#buffer
   */
  Object.defineProperty(this, "buffer", {

    enumerable: true,
    get: function() {
      return _buffer;
    },

    set: function(value) {
      _buffer = value;
    }

  });

  var _azimuth = 0;
  /**
   * @type {number}
   * @name cmapi.IGeoRenderable#azimuth
   */
  Object.defineProperty(this, "azimuth", {

    enumerable: true,
    get: function() {
      return _azimuth;
    },

    set: function(value) {
      _azimuth = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoPoint} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoPoint = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);

  var _iconStyle;
  /**
   * @type {cmapi.IGeoIconStyle}
   * @name cmapi.IGeoPoint#iconStyle
   */
  Object.defineProperty(this, "iconStyle", {

    enumerable: true,
    get: function() {
      return _iconStyle;
    },

    set: function(value) {
      _iconStyle = value;
    }

  });

  var _iconURI;
  /**
   * Indicates the URL to request the icon image image or dataURI encoding of the icon image embedded as the value defined by RFC 2397 (see https://tools.ietf.org/html/rfc2397)
   * @type {string}
   * @name cmapi.IGeoPoint#iconURI
   */
  Object.defineProperty(this, "iconURI", {

    enumerable: true,
    get: function() {
      return _iconURI;
    },

    set: function(value) {
      _iconURI = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoText} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoText = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoPolygon} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoPolygon = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoPath} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoPath = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * A circular based forms single geospatial location as the center with a radius in meters
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoCircle} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoCircle = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);

  /**
   * Default radius
   * @type {number}
   * @private
   */
  var _radius = 100;

  /**
   * Radius of the circle in meters
   * @type {number}
   * @name cmapi.IGeoCircle#radius
   */
  Object.defineProperty(this, "radius", {

    enumerable: true,
    get: function() {
      return _radius;
    },

    set: function(value) {
      _radius = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoEllipse} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoEllipse = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);

  /**
   * Default semiMajor
   * @type {number}
   * @private
   */
  var _semiMajor = 150;
  /**
   * The magnitude of the semi-major axis - Radius of the ellipse in meters on the x axis (width)
   * @type {number}
   * @name cmapi.IGeoEllipse#semiMajor
   */
  Object.defineProperty(this, "semiMajor", {

    enumerable: true,
    get: function() {
      return _semiMajor;
    },

    set: function(value) {
      _semiMajor = value;
    }

  });

  /**
   * Default semiMinor
   * @type {number}
   * @private
   */
  var _semiMinor = 75;
  /**
   * The magnitude of the semi-minor axis - Radius of the ellipse in meters on the y axis (height)
   * @property {number}
   * @name cmapi.IGeoEllipse#semiMinor
   */
  Object.defineProperty(this, "semiMinor", {

    enumerable: true,
    get: function() {
      return _semiMinor;
    },

    set: function(value) {
      _semiMinor = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoRectangle} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoRectangle = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);

  /**
   * Default width
   * @type {number}
   * @private
   */
  var _width = 150;
  /**
   * Width of the rectangle in meters on the x axis
   * @type {number}
   * @name cmapi.IGeoRectangle#width
   */
  Object.defineProperty(this, "width", {

    enumerable: true,
    get: function() {
      return _width;
    },

    set: function(value) {
      _width = value;
    }

  });

  /**
   * Default height
   * @type {number}
   * @private
   */
  var _height = 75;
  /**
   * Height of the rectangle in meters on the y axis
   * @type {number}
   * @name cmapi.IGeoRectangle#height
   */
  Object.defineProperty(this, "height", {

    enumerable: true,
    get: function() {
      return _height;
    },

    set: function(value) {
      _height = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoSquare} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoSquare = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);

  /**
   * Default width
   * @type {number}
   * @private
   */
  var _width = 100;
  /**
   * Width of the square in meters on the x axis
   * @type {number}
   * @name cmapi.IGeoSquare#width
   */
  Object.defineProperty(this, "width", {

    enumerable: true,
    get: function() {
      return _width;
    },

    set: function(value) {
      _width = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoImageOverlay} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoImageOverlay = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);

  var _imageURI;
  /**
   * Indicates the URL to request the image or dataURI encoding of the icon image embedded as the value defined by RFC 2397 (see https://tools.ietf.org/html/rfc2397)
   * @type {string}
   * @name cmapi.IGeoImageOverlay#imageURI
   */
  Object.defineProperty(this, "imageURI", {

    enumerable: true,
    get: function() {
      return _imageURI;
    },

    set: function(value) {
      _imageURI = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 *
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoMilSymbol} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoMilSymbol = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);

  /**
   * Default symbolStandard
   * @type {cmapi.enums.symbolStandard}
   * @private
   */
  var _symbolStandard = "2525c";
  /**
   * Version of the MIL-STD-2525 standard to use
   * @type {string}
   * @name cmapi.IGeoMilSymbol#symbolStandard
   */
  Object.defineProperty(this, "symbolStandard", {

    enumerable: true,
    get: function() {
      return _symbolStandard;
    },

    set: function(value) {
      _symbolStandard = value;
    }

  });

  /**
   * Default symbolCode
   * @type {string}
   * @private
   */
  var _symbolCode = "SUGP-----------";
  /**
   * Symbol code as defined by MIL-STD-2525
   * @type {string}
   * @name cmapi.IGeoMilSymbol#symbolCode
   */
  Object.defineProperty(this, "symbolCode", {

    enumerable: true,
    get: function() {
      return _symbolCode;
    },

    set: function(value) {
      _symbolCode = value;
    }

  });


  /**
   * Contains the symbol modifiers for a MIL-STD-2525 object.  Symbol modifiers
   * usually are labels, but some may actually modify the shape or meaning of a MIL-STD-2525 object.
   * Some symbols may require modifiers. Please consult the
   * MIL-STD-2525Bch2 or MIL-STD-2525C documents supplemented with the most current
   * USAS extension to determine format, length, and required modifiers for each
   * symbol.  The MIL-STD-2525 also has more detailed descriptions of each of the modifiers
   * purpose.
   *
   * @typedef {Object} cmapi.modifiers
   *
   * @property {number} [heading] Controls the rotation for single point icons.  Can be a number between -360 to 360.
   * @property {String} [additionalInfo1]
   * @property {String} [additionalInfo2]
   * @property {String} [additionalInfo3]
   * @property {Array}  [altitudeDepth] An array of numbers
   * @property {Array}  [azimuth] An array of numbers indicating an angle in degrees or mils depending on the
   *      MIL-STD-2525 and USAS
   * @property {String} [combatEffectiveness]
   * @property {String} [dateTimeGroup1] A date/time in format of 'DDHHMMSSZMONYYYY'
   * @property {String} [dateTimeGroup2] A date/time in format of 'DDHHMMSSZMONYYYY'
   * @property {String} [directionOfMovement]  A string of the numbers in the range of 0-360
   * @property {Array}  [distance] An array of numbers
   * @property {String} [equipmentType]
   * @property {String} [evaluationRating] A 2-character string.  [A-F][1-6]
   * @property {String} [higherFormation]
   * @property {String} [hostile] Always use 'ENY'
   * @property {String} [iffSiff]
   * @property {String} [location] The location of the symbol--this is just a label and does not affect the actual location of the symbol</i>
   * @property {String} [offsetIndicator]
   * @property {String} [quantity]
   * @property {String} [reinforcedOrReduced] R = reinforce, D = reduced, RD = reinforced and reduced
   * @property {String} [signatureEquipment] Always use '!'
   * @property {String} [specialC2Headquarters]
   * @property {String} [speed]
   * @property {String} [staffComments]
   * @property {String} [uniqueDesignation1]
   * @property {String} [uniqueDesignation2]
   *
   */
  var _modifiers;
  /**
   * @type {cmapi.modifiers}
   * @name cmapi.IGeoMilSymbol#modifiers
   */
  Object.defineProperty(this, "modifiers", {

    enumerable: true,
    get: function() {
      return _modifiers;
    },

    set: function(value) {
      _modifiers = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * Air control measures (ACM) represent a three dimensional volume in the air above earth used to indicate where aircraft should stay within, or stay out of
 * @interface
 * @augments cmapi.IGeoRenderable
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoAirControlMeasure} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoAirControlMeasure = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoRenderable(), this);

  var _acmType;
  /**
   * Type of air control measure to create
   * @type {cmapi.enums.acmType}
   * @name cmapi.IGeoAirControlMeasure#acmType
   */
  Object.defineProperty(this, "acmType", {

    enumerable: true,
    get: function() {
      return _acmType;
    },

    set: function(value) {
      _acmType = value;
    }

  });

  var _attributes;
  /**
   * @type {cmapi.attributes}
   * @name cmapi.IGeoAirControlMeasure#attributes
   */
  Object.defineProperty(this, "attributes", {

    enumerable: true,
    get: function() {
      return _attributes;
    },

    set: function(value) {
      _attributes = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};
/**
 * File containing geospatial feature data in a known format such as KML or GeoJSON
 * @interface
 * @augments cmapi.IGeoBase
 * @param {object} [args] - An optional object containing any mixture of the properties that belong to {@link cmapi.IGeoDocument} or the parent classes it inherits properties from.  Any properties in the args object that are not known properties will be ignored
 */
cmapi.IGeoDocument = function(args) {

  "use strict";

  cmapi.inherit(new cmapi.IGeoBase(), this);

  var _documentURI;
  /**
   * URL the document should be loaded from, or a dataURI encoding of the resource embedded as the value defined by RFC 2397 (see https://tools.ietf.org/html/rfc2397)
   * @type {string}
   * @name cmapi.IGeoDocument#documentURI
   */
  Object.defineProperty(this, "documentURI", {

    enumerable: true,
    get: function() {
      return _documentURI;
    },

    set: function(value) {
      _documentURI = value;
    }

  });

  var _documentMIMEType;
  /**
   * MIME Type of document.  Common Types are KML (application/vnd.google-earth.kml+xml), and GeoJSON (application/vnd.geo+json)
   * @type {string}
   * @name cmapi.IGeoDocument#documentMIMEType
   */
  Object.defineProperty(this, "documentMIMEType", {

    enumerable: true,
    get: function() {
      return _documentMIMEType;
    },

    set: function(value) {
      _documentMIMEType = value;
    }

  });


  this.patchProps = cmapi.patchProps;

  if (args) {
    this.patchProps(args);
  }

};

/**
 * Copies properties from the target to the source
 * @ignore
 * @param source
 * @param target
 */
cmapi.inherit = function(source, target) {
  var prop;
  for (prop in source) {
    target[prop] = source[prop];
  }
};

/**
 * @see {@link https://www.ietf.org/rfc/rfc4122.txt}
 * @returns {string} UUID
 */
cmapi.randomUUID = function() {
  function s(n) {
    return h((Math.random() * (1 << (n << 2))) ^ Date.now()).slice(-n);
  }

  function h(n) {
    return (n | 0).toString(16);
  }

  return [
    s(4) + s(4), s(4),
    '4' + s(3), // UUID version 4
    h(8 | (Math.random() * 4)) + s(3), // {8|9|A|B}xxx
    // s(4) + s(4) + s(4),
    Date.now().toString(16).slice(-10) + s(2) // Use timestamp to avoid collisions
  ].join('-');
};

/**
 * Sets properties on the object
 * @param update
 */
cmapi.patchProps = function(update) {
  var prop,
    propVal;
  for (prop in update) {
    if (update.hasOwnProperty(prop)) {
      propVal = update[prop];
      if (propVal !== undefined && propVal !== 'undefined') {
        // Handle special case of blank geoId, other properties may be blank
        if (!propVal && prop === 'geoId') {
          continue;
        }
        this[prop] = propVal;
      }
    }
  }
};
