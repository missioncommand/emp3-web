var EMPWorldWind = EMPWorldWind || {};

/**
 * @namespace
 */
EMPWorldWind.constants = {
  view: {
    MAX_HEIGHT: 10000000
  }
};

/** @type {boolean} */
EMPWorldWind.constants.globeWasMoving = false;

/** @type {boolean} */
EMPWorldWind.constants.globeWasZooming = false;

/** @type {number} */
EMPWorldWind.constants.globeMoveTime = 2000;

/** @type {number} */
EMPWorldWind.constants.extentBufferFactor = .4; // use when flyto a feature so the camera is not too close to it.

/** @type {boolean} */
EMPWorldWind.constants.USE_DATA_SOURCE = false;

/** @constant {number} */
EMPWorldWind.constants.WHITE_CONTRAST = 0;

/** @constant {number} */
EMPWorldWind.constants.BLACK_CONTRAST = 1;

/**
 * No panning state for autoPanning in smart motion
 * @constant {object}
 */
EMPWorldWind.constants.NO_PANNING = {
  step: 0,
  up: false,
  down: false,
  right: false,
  left: false
};

/**
 * @readonly
 * @type {number}
 */
EMPWorldWind.constants.METERS_PER_INCH = 0.0254;

/**
 * @readonly
 * @type {number}
 */
EMPWorldWind.constants.SCALE_LINE_LENGTH = 50;

/**
 * @readonly
 */
EMPWorldWind.constants.propertyDefaults = {
  FILL_COLOR_HEX: "ffffff",
  LINE_COLOR_HEX: "000000",
  LINE_WIDTH: 3
};

/**
 * @readonly
 * @type {{COLOR_HEX: string, WIDTH: number, SCALE: number}}
 */
EMPWorldWind.constants.selectionProperties = {
  COLOR_HEX: 'FFFF00',
  WIDTH: 2,
  SCALE: 0.5
};

/**
 * @enum {string}
 * @readonly
 */
EMPWorldWind.constants.FeatureType = {
  ENTITY: "entity",
  RENDERABLE: "renderable",
  PRIMITIVE: "primitive",
  GROUND_PRIMITIVE: "ground_primitive",
  DATA_SOURCE: "dataSource",
  COMPOUND_ENTITY: "compoundEntity",
  PRIMITIVE_COLLECTION: "primitiveCollection"
};

/**
 * @enum {string}
 * @readonly
 */
EMPWorldWind.constants.LayerType = {
  OVERLAY_LAYER: "overlay",
  WMS_LAYER: "wms",
  IMAGE_LAYER: "image",
  BING_LAYER: "bing",
  ARCGIS_93_REST_LAYER: "arcgis93rest",
  OSM_LAYER: "osm",
  TMS_LAYER: "tms",
  TERRAIN_LAYER: "terrain",
  WMTS_LAYER: "wmts"
};

/**
 * @enum {string}
 * @readonly
 */
EMPWorldWind.constants.EntityType = {
  BILLBOARD: "billboard",
  BOX: "box",
  CORRIDOR: "corridor",
  CYLINDER: "cylinder",
  DESCRIPTION: "description",
  ELLIPSE: "ellipse",
  ELLIPSOID: "ellipsoid",
  LABEL: "label",
  MODEL: "model",
  ORIENTATION: "orientation",
  PATH: "path",
  POLYGON: "polygon",
  POLYLINE: "polyline",
  POLYLINE_VOLUME: "polylineVolume",
  POSITION: "position",
  RECTANGLE: "rectangle",
  VIEW_FROM: "viewFrom",
  WALL: "wall",
  KML: "kml"
};

/**
 * @enum {number}
 * @readonly
 */
EMPWorldWind.constants.MultiPointRenderType = {
  KML: 0,
  /** @deprecated */
  JSON: 1,
  GEOJSON: 2,
  DATA_URL: 4,
  CANVAS: 3,
  CANVAS_LABEL_ONLY: 5,
  SVG: 6,
  SVG_LABEL_ONLY: 7
};

/**
 * @enum {number}
 * @readonly
 */
EMPWorldWind.constants.SinglePointAltitudeRangeMode = {
  LOW_RANGE: 0,
  MID_RANGE: 1,
  HIGHEST_RANGE: 2
};

/**
 * @enum {number}
 * @readonly
 */
EMPWorldWind.constants.RendererWorker = {
  A: 1,
  B: 2,
  C: 3,
  D: 4
};

/**
 * @enum {string}
 * @readonly
 */
EMPWorldWind.constants.LabelStyle = {
  REQUIRED_LABELS: 'required_labels',
  COMMON_LABELS: 'common_labels',
  ALL_LABELS: 'all_labels'
};

/**
 * Modifiers for All labels to be displayed
 * @enum {object}
 * @constant
 */
EMPWorldWind.constants.AllLabels = {
  "V": true,
  "L": true,
  "S": true,
  "AA": true,
  "AB": true,
  "AC": true, 
  "H": true,
  "M": true,
  "T": true,
  "T1": true,
  "CN": true,
  "C": true,
  "F": true,
  "G": true,
  "H1": true,
  "H2": true,
  "J": true,
  "K": true,
  "N": true,
  "P": true,
  "W": true,
  "W1": true,
  "X": true,
  "Y": true,
  "Z": true
};

/**
 * @namespace
 */
EMPWorldWind.constants.RendererSettings = {};

/**
 * @enum {number}
 * @readonly
 */
EMPWorldWind.constants.RendererSettings.standard = {
  'Symbology_2525Bch2_USAS_13_14': 0,
  'Symbology_2525C': 1
};

/**
 * @enum {string}
 * @readonly
 */
EMPWorldWind.constants.RendererSettings.modifierLookup = {
  QUANTITY: "quantity",
  REDUCED_OR_REINFORCED: "reinforcedOrReduced",
  STAFF_COMMENTS: "staffComments",
  ADDITIONAL_INFO_1: "additionalInfo1",
  ADDITIONAL_INFO_2: "additionalInfo2",
  ADDITIONAL_INFO_3: "additionalInfo3",
  EVALUATION_RATING: "evaluationRating",
  COMBAT_EFFECTIVENESS: "combatEffectiveness",
  SIGNATURE_EQUIPMENT: "signatureEquipment",
  HIGHER_FORMATION: "higherFormation",
  HOSTILE: "hostile",
  IFF_SIF: "iffSiff",
  DIRECTION_OF_MOVEMENT: "directionOfMovement",
  OFFSET_INDICATOR: "offsetIndicator",
  UNIQUE_DESIGNATOR_1: "uniqueDesignation1",
  UNIQUE_DESIGNATOR_2: "uniqueDesignation2",
  EQUIPMENT_TYPE: "equipmentType",
  DATE_TIME_GROUP: "dateTimeGroup1",
  DATE_TIME_GROUP_2: "dateTimeGroup2",
  ALTITUDE_DEPTH: "altitudeDepth",
  LOCATION: "location",
  SPEED: "speed",
  SPECIAL_C2_HEADQUARTERS: "specialC2Headquarters",
  DISTANCE: "distance",
  AZIMUTH: "azimuth",
  FILL_COLOR: "fillColor",
  LINE_COLOR: "lineColor",
  X_OFFSET: "xOffset",
  X_UNITS: "xUnits",
  Y_OFFSET: "yOffset",
  Y_UNITS: "yUnits",
  NAME: "name",
  STANDARD: "standard"
};

EMPWorldWind.constants.highAltitudeRangeImage = {};
EMPWorldWind.constants.highAltitudeRangeImage.highRangeImageRed = 'data:image/svg+xml;base64,' + window.btoa('<svg preserveAspectRatio="none" width="25px" height="30px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle  cx="12" cy="12"  r="3" fill="red" stroke="red" stroke-width="1"  /></g></svg>');
EMPWorldWind.constants.highAltitudeRangeImage.highRangeImageBlue = 'data:image/svg+xml;base64,' + window.btoa('<svg preserveAspectRatio="none" width="25px" height="30px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle cx="12" cy="12"  r="3" fill="blue" stroke="blue" stroke-width="1"  /></g></svg>');
EMPWorldWind.constants.highAltitudeRangeImage.highRangeImageGreen = 'data:image/svg+xml;base64,' + window.btoa('<svg preserveAspectRatio="none" width="25px" height="30px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle  cx="12" cy="12" r="3" fill="green" stroke="green" stroke-width="1"  /></g></svg>');
EMPWorldWind.constants.highAltitudeRangeImage.highRangeImageYellow = 'data:image/svg+xml;base64,' + window.btoa('<svg preserveAspectRatio="none" width="25px" height="30px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle  cx="12" cy="12" r="3" fill="yellow" stroke="yellow" stroke-width="1"  /></g></svg>');
//EMPWorldWind.constants.highAltitudeRangeImage.blankMultipoint = 'data:image/svg+xml;base64,' + window.btoa('<svg preserveAspectRatio="none" width="2px" height="2px"   xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="translate(0,0)  "><circle  cx="12" cy="12" r="3" fill="black" stroke="black" stroke-width="1"  /></g></svg>');


