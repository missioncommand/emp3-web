var emp = window.emp || {};
/**
 * @namespace constant
 * @memberof emp
 */
emp.constant = emp.constant || {};

/**
 * @public
 * @enum
 * @readonly
 */
emp.constant.parentIds = {
  ALL_PARENTS: 'ALL_PARENTS',
  MAP_ROOT: 'MAP_ROOT',
  MAP_LAYER_PARENT: 'MAP_LAYER_PARENT'
};

/**
 * @public
 * @enum
 * @readonly
 */
emp.constant.mapEngineId = {
  LEAFLET: 'leafletMapEngine',
  CESIUM: 'cesiumMapEngine',
  WORLD_WIND: 'worldWindMapEngine'
};

/**
 * @public
 * @enum
 * @readonly
 * @description This type enumerates the valid values for the feature format field.
 */
emp.constant.featureFormatType = {
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature is a KML. Therefore the data
   * field contains an unescaped KML string.
   */
  KML: "kml",
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature is a GEOJSON. Therefore the data
   * field contains an unescaped GEOJSON object.
   */
  GEOJSON: "geojson",
  WKT: "wkt",
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature describes a WMS service.
   */
  WMS: "wms",
  WFS: "wfs",
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature is an image. Therefore the url
   * field contains an unescaped URL to the image which the implementation must display at the location
   * indicated in the bounding box provided in the params field.
   */
  IMAGE: "image",
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature is a MilStd 2525 symbol. Therefore the data.symbolCode
   * field contains the actual symbolCode, the properties contains a structure with the
   * symbol modifiers as well as the 2525 version.
   */
  MILSTD: "milstd",
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature is an airspace. Therefore the data.symbolCode
   * field contains the type of airspace.
   */
  AIRSPACE: "airspace",

  /**
   * An air control measure.
   */
  GEO_ACM: 'airspace',
  /**
   * A Circle
   */
  GEO_CIRCLE: 'circle',
  /**
   * An ellipse
   */
  GEO_ELLIPSE: 'ellipse',
  /**
   * A MIL-STD-2525 symbol.
   */
  GEO_MIL_SYMBOL: 'milstd',
  /**
   * A path
   */
  GEO_PATH: 'path',
  /**
   * A point
   */
  GEO_POINT: 'point',
  /**
   * Polygon
   */
  GEO_POLYGON: 'polygon',
  /**
   * A rectangle
   */
  GEO_RECTANGLE: 'rectangle',
  /**
   * A square
   */
  GEO_SQUARE: 'square',
  /**
   * Free text on the map.
   */
  GEO_TEXT: 'text'
};

/**
 * @public
 * @enum
 * @readonly
 * @description This type enumerates the valid values for milstd version properties field.
 */
emp.constant.featureMilStdVersionType = {
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature is to be rendered as MilStd 2525B symbol.
   */
  MILSTD_2525B: "2525B",
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature is to be rendered as MilStd 2525C symbol.
   */
  MILSTD_2525C: "2525C",
  /**
   *
   * @method
   * @description This function converts a string version to the numeric constant
   * used by the sec render.
   * @param {String} sVersion A string indicating the MilStd 2525 version
   */
  convertToNumeric: function (sVersion) {
    var iVersion = 0;

    if (emp.helpers.isEmptyString(sVersion)) {
      iVersion = 0;
    }
    else if (sVersion.toUpperCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C) {
      iVersion = 1;
    }

    return iVersion;
  }
};

/**
 * @public
 * @enum
 * @readonly
 * @description This type enumerates the valid values for a features altitude mode.
 */
emp.constant.featureAltitudeModeType = {
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature is to be at ground level.
   */
  CLAMP_TO_GROUND: "clampToGround",
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature altitudes are relative to the ground at its location.
   */
  RELATIVE_TO_GROUND: "relativeToGround",
  /**
   * @constant
   * @type string
   * @description This value indicates that the feature are relative to MSL.
   */
  ABSOLUTE: "absolute"
};

/**
 * @public
 * @enum
 * @readonly
 * @description This type enumerates the valid values for a orbit turn attribute.
 */
emp.constant.orbitTurnType = {
  /**
   * @constant
   * @type string
   * @description This value indicates that the orbit is centered on the end points.
   */
  CENTER: "center",
  /**
   * @constant
   * @type string
   * @description This value indicates that the orbit turns to the right of the end points.
   */
  RIGHT: "right",
  /**
   * @constant
   * @type string
   * @description This value indicates that the orbit turns to the left of the end points.
   */
  LEFT: "left"
};

/**
 * @public
 * @enum
 * @readonly
 * @description This type enumerates primitives
 */
emp.constant.primitives = {
  /**
   * @constant
   * @type string
   * @description This value indicates a Circle primitive
   */
  BBS_CIRCLE: 'BBS_CIRCLE',
  /**
   * @constant
   * @type string
   * @description This value indicates an Ellipse primitive
   */
  BBS_ELLIPSE: 'BBS_ELLIPSE',
  /**
   * @constant
   * @type string
   * @description This value indicates a Path primitive
   */
  BBS_PATH: 'BBS_PATH',
  /**
   * @constant
   * @type string
   * @description This value indicates a Point primitive
   */
  BBS_POINT: 'BBS_POINT',
  /**
   * @constant
   * @type string
   * @description This value indicates a Polygon primitive
   */
  BBS_POLYGON: 'BBS_POLYGON',
  /**
   * @constant
   * @type string
   * @description This value indicates a Rectangle primitive
   */
  BBS_RECTANGLE: 'BBS_RECTANGLE',
  /**
   * @constant
   * @type string
   * @description This value indicates a Square primitive
   */
  BBS_SQUARE: 'BBS_SQUARE',
  /**
   * @constant
   * @type string
   * @description This value indicates a Text primitive
   */
  BBS_TEXT: 'BBS_TEXT'
};

/**
 * @public
 * @enum
 * @readonly
 * @description This type enumerates the valid airspace symbol codes.
 */
emp.constant.airspaceSymbolCode = {
  /**
   * @constant
   * @type string
   * @description This value indicates a cake airspace.
   */
  SHAPE3D_CAKE: 'CAKE-----------',
  /**
   * @constant
   * @type string
   * @description This value indicates a route airspace.
   */
  SHAPE3D_ROUTE: 'ROUTE----------',
  /**
   * @constant
   * @type string
   * @description This value indicates a cylinder airspace.
   */
  SHAPE3D_CYLINDER: 'CYLINDER-------',
  /**
   * @constant
   * @type string
   * @description This value indicates a orbit airspace.
   */
  SHAPE3D_ORBIT: 'ORBIT----------',
  /**
   * @constant
   * @type string
   * @description This value indicates a polygon airspace.
   */
  SHAPE3D_POLYGON: 'POLYGON--------',
  /**
   * @constant
   * @type string
   * @description This value indicates a rad arc airspace.
   */
  SHAPE3D_RADARC: 'RADARC---------',
  /**
   * @constant
   * @type string
   * @description This value indicates a poly arc airspace.
   */
  SHAPE3D_POLYARC: 'POLYARC--------',
  /**
   * @constant
   * @type string
   * @description This value indicates a track airspace.
   */
  SHAPE3D_TRACK: 'TRACK----------',
  /**
   * @constant
   * @type string
   * @description This value indicates a curtain airspace.
   */
  SHAPE3D_CURTAIN: 'CURTAIN--------'
};

/**
 * @public
 * @enum
 * @readonly
 * @description This type enumerates the valid AOI types.
 */
emp.constant.AOIType = {
  /**
   * @constant
   * @type string
   * @description This value indicates a point with a radius of interest.
   */
  POINT_RADIUS: 'point-radius',
  /**
   * @constant
   * @type string
   * @description This value indicates a line with a width of interest.
   */
  LINE: 'line',
  /**
   * @constant
   * @type string
   * @description This value indicates an area with an extended distance of interest.
   */
  POLYGON: 'polygon',
  /**
   * @constant
   * @type string
   * @description This value indicates a bounding box of interest.
   */
  BBOX: 'bbox'
};

/**
 * @public
 * @enum
 * @readonly
 * @description This type enumerates the valid Outline styles.
 */
emp.constant.OutlineStyleType = {
  /**
   * @constant
   * @type string
   * @description This value indicates a dotted line.
   */
  DOT: 'dot',
  /**
   * @constant
   * @type string
   * @description This value indicates a dash line.
   */
  DASH: 'dash',
  /**
   * @constant
   * @type string
   * @description This value indicates a line of dashes with dots between them.
   */
  DASH_DOT: 'dashdot',
  /**
   * @constant
   * @type string
   * @description This value indicates a line of long dashes.
   */
  LONG_DASH: 'longdash',
  /**
   * @constant
   * @type string
   * @description This value indicates a line of long dashes with dots between them.
   */
  LONG_DASH_DOT: 'longdashdot',
  /**
   * @constant
   * @type string
   * @description This value indicates a solid line, and is the default.
   */
  SOLID: 'solid'
};
