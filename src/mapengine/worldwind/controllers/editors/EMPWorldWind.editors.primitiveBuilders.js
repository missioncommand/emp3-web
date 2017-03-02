var EMPWorldWind = window.EMPWorldWind || {};
EMPWorldWind.editors = EMPWorldWind.editors || {};

/**
 * Set of builder functions that produce singular WorldWind primitive shapes and renderables.
 * @namespace
 */
EMPWorldWind.editors.primitiveBuilders = EMPWorldWind.editors.primitiveBuilders || {};

/**
 *
 * @param {emp.typeLibrary.Feature | object}feature
 * @param {SelectionStyle} selectionStyle
 * @returns {{attributes: *, highlightAttributes: *}}
 */
EMPWorldWind.editors.primitiveBuilders.createShapeAttributes = function(feature, selectionStyle) {
  var lineColor, fillColor, highlightAttributes,
    selectedLineColor, selectedFillColor;

  var attributes = new WorldWind.ShapeAttributes();

  switch (feature.format) {
    case emp3.api.enums.FeatureTypeEnum.GEO_ACM: // TODO handle GEO_ACM attributes
    case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL: // Do nothing, handled by renderer, no primitives
    case emp3.api.enums.FeatureTypeEnum.GEO_POINT: // TODO placemark attributes are still done in the placemark constructor function
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
      // GeographicText requires TextAttributes instead
      attributes = new WorldWind.TextAttributes();

      // Should not be occluded by terrain or objects when false
      attributes.depthTest = false;

      // Label Color
      if (feature.properties.labelStyle && feature.properties.labelStyle.color) {
        labelColor = feature.properties.labelStyle.color;
        attributes.color = new WorldWind.Color(labelColor.red, labelColor.green, labelColor.blue, labelColor.alpha);
      } else {
        labelColor = EMPWorldWind.utils.hexToRGBA(EMPWorldWind.constants.propertyDefaults.FILL_COLOR_HEX);
        attributes.color = new WorldWind.Color(labelColor.r, labelColor.g, labelColor.b, labelColor.a);
      }

      // Font Family
      if (feature.properties.labelStyle && feature.properties.labelStyle.family) {
        attributes.font.family = feature.properties.labelStyle.family;
      }

      // Justification
      if (feature.properties.labelStyle && feature.properties.labelStyle.justification) {
        attributes.font.horizontalAlignment = feature.properties.labelStyle.justification;
      }

      // Font size
      if (feature.properties.labelStyle && feature.properties.labelStyle.size) {
        attributes.font.size = feature.properties.labelStyle.size;
      }

      // Label Scale
      if (feature.properties.labelStyle && feature.properties.labelStyle.scale) {
        attributes.scale = feature.properties.labelStyle.scale;
      }

      // Create highlight attributes from the regular attributes, only update highlight color
      highlightAttributes = new WorldWind.TextAttributes(attributes);
      if (selectionStyle.lineColor) {
        selectedLabelColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
        highlightAttributes.color = new WorldWind.Color(selectedLabelColor.r, selectedLabelColor.g, selectedLabelColor.b, selectedLabelColor.a);
      } else {
        highlightAttributes.color = WorldWind.Color.YELLOW;
      }
      break;
    case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
    case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
    case emp3.api.enums.FeatureTypeEnum.GEO_PATH: // Not all of the attributes are used for path/polyline
    case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
    case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
    case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
    default:
      // Set stroke color
      if (feature.properties.strokeStyle && feature.properties.strokeStyle.strokeColor) {
        lineColor = feature.properties.strokeStyle.strokeColor;
        attributes.outlineColor = new WorldWind.Color(lineColor.red, lineColor.green, lineColor.blue, lineColor.alpha);
      } else {
        attributes.outlineColor = WorldWind.Color.BLACK;
      }

      // Set fill color
      if (feature.properties.fillColor) {
        fillColor = EMPWorldWind.utils.hexToRGBA(feature.properties.fillColor);
        attributes.interiorColor = new WorldWind.Color(fillColor.r, fillColor.g, fillColor.b, fillColor.a);
      } else {
        attributes.drawInterior = false;
      }

      // TODO fillPattern is not yet supported by the ShapeAttributes class

      // Line width
      if (feature.properties.strokeWidth || feature.properties.lineWidth) {
        attributes.outlineWidth = feature.properties.strokeWidth || feature.properties.lineWidth;
      }

      // Stippling of outline
      attributes.outlineStippleFactor = feature.properties.stippleFactor || attributes.outlineStippleFactor;
      attributes.outlineStipplePattern = feature.properties.stipplePattern || attributes.outlineStipplePattern;

      // Generate the highlight attributes from the normal attributes
      highlightAttributes = new WorldWind.ShapeAttributes(attributes);

      // Update the selected lineColor
      if (selectionStyle.lineColor) {
        selectedLineColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
        highlightAttributes.outlineColor = new WorldWind.Color(selectedLineColor.r, selectedLineColor.g, selectedLineColor.b, selectedLineColor.a);
      } else {
        highlightAttributes.outlineColor = WorldWind.Color.YELLOW;
      }

      // Update the selected fillColor
      if (selectionStyle.fillColor) {
        selectedFillColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.fillColor);
        highlightAttributes.interiorColor = new WorldWind.Color(selectedFillColor.r, selectedFillColor.g, selectedFillColor.b, selectedFillColor.a);
      } else {
        highlightAttributes.drawInterior = false;
      }
  }

  return {
    attributes: attributes,
    highlightAttributes: highlightAttributes
  };
};

/**
 * @todo Use update from NASA WW to handle 3d airspaces
 * @param {emp.typeLibrary.Feature} feature
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.Polygon}
 */
EMPWorldWind.editors.primitiveBuilders.constructAirControlMeasure = function(feature, selectionStyle) {
  var primitivePolygon, boundaries, attributes, highlightAttributes,
    i, selectedFillColor,
    len = feature.data.coordinates.length;

  attributes = new WorldWind.ShapeAttributes();
  highlightAttributes = new WorldWind.ShapeAttributes();
  // TODO highlight attributes for ACM

  if (selectionStyle.fillColor) {
    selectedFillColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.fillColor);
    highlightAttributes.interiorColor = new WorldWind.Color(selectedFillColor.r, selectedFillColor.g, selectedFillColor.b, selectedFillColor.a);
  } else {
    highlightAttributes.interiorColor = WorldWind.Color.YELLOW;
  }

  boundaries = [];
  for (i = 0; i < len; i++) {
    // TODO need updates to WorldWind to fix this correctly, also not setting altitude if there are multiple attributes
    //boundaries[0].push(new WorldWind.Position(feature.data.coordinates[i][1], feature.data.coordinates[i][0], feature.properties.attributes[0].minAlt));
    //boundaries[1].push(new WorldWind.Position(feature.data.coordinates[i][1], feature.data.coordinates[i][0], feature.properties.attributes[0].maxAlt));
    boundaries.push(new WorldWind.Position(feature.data.coordinates[i][1], feature.data.coordinates[i][0], feature.properties.attributes[0].maxAlt));
  }

  primitivePolygon = new WorldWind.Polygon(boundaries, attributes);
  primitivePolygon.altitudeMode = WorldWind.ABSOLUTE;
  primitivePolygon.extrude = true;
  primitivePolygon.highlightAttributes = new WorldWind.ShapeAttributes(highlightAttributes);

  return primitivePolygon;
};

/**
 * Builds a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfaceCircle} primitive
 * @param {emp.typeLibrary.Feature} feature
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.SurfaceCircle}
 */
EMPWorldWind.editors.primitiveBuilders.constructSurfaceCircle = function(feature, selectionStyle) {
  var attributes, location, circlePrimitive;

  // Construct circle attributes
  attributes = EMPWorldWind.editors.primitiveBuilders.createShapeAttributes(feature, selectionStyle);

  // Set the location
  location = new WorldWind.Location(feature.coordinates[1], feature.coordinates[0]);

  // Construct the primitive
  circlePrimitive = new WorldWind.SurfaceCircle(location, feature.properties.radius, attributes.attributes);

  // Set the primitive properties
  circlePrimitive.displayName = feature.name;
  circlePrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  circlePrimitive.highlightAttributes = attributes.highlightAttributes;

  return circlePrimitive;
};

/**
 * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfaceEllipse} primitive
 * @param {emp.typeLibrary.Feature} feature
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.SurfaceEllipse}
 */
EMPWorldWind.editors.primitiveBuilders.constructSurfaceEllipse = function(feature, selectionStyle) {
  var attributes, location, ellipsePrimitive;

  // Construct the ellipse attributes
  attributes = EMPWorldWind.editors.primitiveBuilders.createShapeAttributes(feature, selectionStyle);

  // Set the location
  location = new WorldWind.Location(feature.coordinates[1], feature.coordinates[0]);

  // Construct the primitive
  ellipsePrimitive = new WorldWind.SurfaceEllipse(location,
    feature.properties.semiMajor,
    feature.properties.semiMinor,
    feature.properties.azimuth,
    attributes.attributes);

  // Set the primitive properties
  ellipsePrimitive.displayName = feature.name;
  ellipsePrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  ellipsePrimitive.highlightAttributes = attributes.highlightAttributes;

  return ellipsePrimitive;
};

/**
 * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfacePolyline} primitive
 * @param {emp.typeLibrary.Feature} feature
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.SurfacePolyline}
 */
EMPWorldWind.editors.primitiveBuilders.constructSurfacePolyline = function(feature, selectionStyle) {
  var i, pathPrimitive, attributes,
    len = feature.data.coordinates.length,
    locations = [];

  // Construct the path attributes
  attributes = EMPWorldWind.editors.primitiveBuilders.createShapeAttributes(feature, selectionStyle);

  // Set the locations
  for (i = 0; i < len; i++) {
    locations.push(new WorldWind.Location(feature.data.coordinates[i][1], feature.data.coordinates[i][0]));
  }

  // Construct the primitive
  pathPrimitive = new WorldWind.SurfacePolyline(locations, attributes.attributes);

  // Set the primitive properties
  pathPrimitive.displayName = feature.name;
  pathPrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  pathPrimitive.highlightAttributes = attributes.highlightAttributes;

  return pathPrimitive;
};

/**
 * This function is similar to the feature based version except it takes a geoJSON object as the only parameter.
 * @param {object} geoJSON
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.SurfacePolyline}
 */
EMPWorldWind.editors.primitiveBuilders.constructSurfacePolylineFromGeoJSON = function(geoJSON, selectionStyle) {
  var i, color, attributes, highlightAttributes, polylinePrimitive, selectedLineColor,
    len = geoJSON.coordinates.length,
    locations = [];

  attributes = new WorldWind.ShapeAttributes();
  // SurfacePolyline uses the following attributes
  if (geoJSON.properties.strokeColor) {
    color = EMPWorldWind.utils.hexToRGBA(geoJSON.properties.strokeColor, geoJSON.properties.lineOpacity, true);
    attributes.outlineColor = new WorldWind.Color(color.r, color.g, color.b, color.a);
  } else {
    attributes.outlineColor = WorldWind.Color.BLACK;
  }

  attributes.outlineWidth = geoJSON.properties.strokeWidth || attributes.outlineWidth;

  for (i = 0; i < len; i++) {
    locations.push(new WorldWind.Location(geoJSON.coordinates[i][1], geoJSON.coordinates[i][0]));
  }

  highlightAttributes = new WorldWind.ShapeAttributes();
  if (selectionStyle.lineColor) {
    selectedLineColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
    highlightAttributes.outlineColor = new WorldWind.Color(selectedLineColor.r, selectedLineColor.g, selectedLineColor.b, selectedLineColor.a);
  } else {
    highlightAttributes.outlineColor = WorldWind.Color.YELLOW;
  }

  polylinePrimitive = new WorldWind.SurfacePolyline(locations, attributes);
  polylinePrimitive.altitudeMode = geoJSON.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  polylinePrimitive.highlightAttributes = new WorldWind.ShapeAttributes(highlightAttributes);

  return polylinePrimitive;
};

/**
 * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.Placemark} primitive
 * @param {emp.typeLibrary.Feature} feature
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.Placemark}
 */
EMPWorldWind.editors.primitiveBuilders.constructPlacemark = function(feature, selectionStyle) {
  var location, placemark, highlightAttributes, attributes, selectedLineColor,
    eyeDistanceScaling = true;

  attributes = new WorldWind.PlacemarkAttributes();

  attributes.imageSource = feature.properties.iconUrl || WorldWind.configuration.baseUrl + "images/emp-default-icon.png";

  attributes.labelAttributes = new WorldWind.TextAttributes();
  attributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, -0.5,
    WorldWind.OFFSET_FRACTION, 1.5
  );

  location = new WorldWind.Location(feature.data.coordinates[1], feature.data.coordinates[0]);

  highlightAttributes = new WorldWind.PlacemarkAttributes();

  if (selectionStyle.scale) {
    highlightAttributes.imageScale = selectionStyle.scale;
  }

  if (selectionStyle.lineColor) {
    selectedLineColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
    highlightAttributes.imageColor = new WorldWind.Color(selectedLineColor.r, selectedLineColor.g, selectedLineColor.b, selectedLineColor.a);
  } else {
    highlightAttributes.imageColor = WorldWind.Color.YELLOW;
  }

  highlightAttributes.labelAttributes.offset = attributes.labelAttributes.offset;
  highlightAttributes.labelAttributes.color = highlightAttributes.imageColor;

  placemark = new WorldWind.Placemark(location, eyeDistanceScaling, attributes);
  placemark.label = feature.name;
  placemark.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  placemark.highlightAttributes = new WorldWind.PlacemarkAttributes(highlightAttributes);

  return placemark;
};

/**
 * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfacePolygon} primitive
 * @param {emp.typeLibrary.Feature} feature
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.SurfacePolygon}
 */
EMPWorldWind.editors.primitiveBuilders.constructSurfacePolygon = function(feature, selectionStyle) {
  var polygonPrimitive, attributes, boundaryLen,
    i, j,
    boundaries = [],
    numBounds = feature.data.coordinates.length;

  // Construct the polygon attributes
  attributes = EMPWorldWind.editors.primitiveBuilders.createShapeAttributes(feature, selectionStyle);

  // Set the boundary locations
  for (i = 0; i < numBounds; i++) {
    boundaryLen = feature.data.coordinates[i].length;
    var subBoundary = [];
    for (j = 0; j < boundaryLen; j++) {
      subBoundary.push(new WorldWind.Location(feature.data.coordinates[i][j][1], feature.data.coordinates[i][j][0]));
    }
    boundaries.push(subBoundary);
  }

  // Construct the primitive
  polygonPrimitive = new WorldWind.SurfacePolygon(boundaries, attributes.attributes);

  // Set the primitive properties
  polygonPrimitive.displayName = feature.name;
  polygonPrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  polygonPrimitive.highlightAttributes = attributes.highlightAttributes;

  return polygonPrimitive;
};

/**
 *
 * @param {object} geoJSON
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.SurfacePolygon}
 */
EMPWorldWind.editors.primitiveBuilders.constructSurfacePolygonFromGeoJSON = function(geoJSON, selectionStyle) {
  var attributes, interiorColor, outlineColor, boundaryLen, polygonPrimitive,
    selectedLineColor, selectedFillColor, highlightAttributes,
    i, j,
    boundaries = [],
    numBounds = geoJSON.geometry.coordinates.length;

  for (i = 0; i < numBounds; i++) {
    boundaryLen = geoJSON.geometry.coordinates[i].length;
    var subBoundary = [];
    for (j = 0; j < boundaryLen; j++) {
      subBoundary.push(new WorldWind.Location(geoJSON.geometry.coordinates[i][j][1], geoJSON.geometry.coordinates[i][j][0]));
    }
    boundaries.push(subBoundary);
  }

  attributes = new WorldWind.ShapeAttributes();
  if (geoJSON.properties.strokeColor) {
    outlineColor = EMPWorldWind.utils.hexToRGBA(geoJSON.properties.strokeColor);
    attributes.outlineColor = new WorldWind.Color(outlineColor.r, outlineColor.g, outlineColor.b, outlineColor.a);
  } else {
    attributes.outlineColor = WorldWind.Color.BLACK;
  }

  if (geoJSON.properties.fillColor) {
    interiorColor = EMPWorldWind.utils.hexToRGBA(geoJSON.properties.fillColor);
    attributes.interiorColor = new WorldWind.Color(interiorColor.r, interiorColor.g, interiorColor.b, interiorColor.a);
  } else {
    attributes.drawInterior = false;
  }

  attributes.outlineWidth = geoJSON.properties.strokeWidth || attributes.outlineWidth;

  attributes.outlineStippleFactor = geoJSON.properties.stippleFactor || attributes.outlineStippleFactor;
  attributes.outlineStipplePattern = geoJSON.properties.stipplePattern || attributes.outlineStipplePattern;

  highlightAttributes = new WorldWind.ShapeAttributes();
  if (selectionStyle.lineColor) {
    selectedLineColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
    highlightAttributes.outlineColor = new WorldWind.Color(selectedLineColor.a, selectedLineColor.g, selectedLineColor.b, selectedLineColor.a);
  } else {
    highlightAttributes.outlineColor = WorldWind.Color.YELLOW;
  }
  if (selectionStyle.fillColor) {
    selectedFillColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.fillColor);
    highlightAttributes.interiorColor = new WorldWind.Color(selectedFillColor.a, selectedFillColor.g, selectedFillColor.b, selectedFillColor.a);
  } else {
    highlightAttributes.drawInterior = false;
  }

  polygonPrimitive = new WorldWind.SurfacePolygon(boundaries, attributes);
  polygonPrimitive.altitudeMode = geoJSON.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  polygonPrimitive.displayName = geoJSON.properties.name;
  polygonPrimitive.highlightAttributes = new WorldWind.ShapeAttributes(highlightAttributes);

  return polygonPrimitive;
};

/**
 * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfaceRectangle} primitive
 * This handles rectangles and squares
 * @param {emp.typeLibrary.Feature} feature
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.SurfaceRectangle}
 */
EMPWorldWind.editors.primitiveBuilders.constructSurfaceRectangle = function(feature, selectionStyle) {
  var attributes, location, width, height, rectPrimitive;

  // Construct the rectangle/square attributes
  attributes = EMPWorldWind.editors.primitiveBuilders.createShapeAttributes(feature, selectionStyle);

  // Set the location
  location = new WorldWind.Location(feature.coordinates[1], feature.coordinates[0]);

  // Determine rect or square
  if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) {
    // Rectangle
    width = feature.properties.width;
    height = feature.properties.height;
  } else {
    // Square, width equals height
    width = feature.properties.width;
    height = feature.properties.width;
  }

  // Construct the primitive
  rectPrimitive = new WorldWind.SurfaceRectangle(location, width, height, feature.properties.azimuth, attributes.attributes);

  // Set the primitive properties
  rectPrimitive.displayName = feature.name;
  rectPrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  rectPrimitive.highlightAttributes = attributes.highlightAttributes;

  return rectPrimitive;
};

/**
 * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.Text} primitive
 * @param {emp.typeLibrary.Feature} feature
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.Text}
 */
EMPWorldWind.editors.primitiveBuilders.constructText = function(feature, selectionStyle) {
  var attributes, location, textPrimitive;

  // Construct circle attributes
  attributes = EMPWorldWind.editors.primitiveBuilders.createShapeAttributes(feature, selectionStyle);

  // Set the location
  location = new WorldWind.Location(feature.coordinates[1], feature.coordinates[0]);

  // Construct the text
  textPrimitive = new WorldWind.GeographicText(location, feature.name);

  // Set the primitive properties
  textPrimitive.attributes = attributes.attributes;
  textPrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  textPrimitive.highlightAttributes = attributes.highlightAttributes;

  return textPrimitive;
};

/**
 * @param {object} geoJSON
 * @param {SelectionStyle} selectionStyle
 * @returns {WorldWind.Text}
 */
EMPWorldWind.editors.primitiveBuilders.constructTextFromGeoJSON = function(geoJSON, selectionStyle) {
  var textPrimitive, attributes, highlightAttributes, color, selectedColor, location;

  attributes = new WorldWind.TextAttributes(null);
  attributes.depthTest = false;

  if (geoJSON.properties.labelStyle && geoJSON.properties.labelStyle.color) {
    color = EMPWorldWind.utils.hexToRGBA(geoJSON.properties.labelStyle.color);
    attributes.color = new WorldWind.Color(color.r, color.g, color.b, color.a);
  } else {
    attributes.color = WorldWind.Color.BLACK;
  }

  if (geoJSON.properties.labelStyle && geoJSON.properties.labelStyle.family) {
    attributes.font.family = geoJSON.properties.labelStyle.family;
  }

  if (geoJSON.properties.labelStyle && geoJSON.properties.labelStyle.justification) {
    attributes.font.horizontalAlignment = geoJSON.properties.labelStyle.justification;
  }

  if (geoJSON.properties.labelStyle && geoJSON.properties.labelStyle.size) {
    attributes.font.size = geoJSON.properties.labelStyle.size;
  }

  if (geoJSON.properties.labelStyle && geoJSON.properties.labelStyle.scale) {
    attributes.scale = geoJSON.properties.labelStyle.scale;
  }

  highlightAttributes = new WorldWind.TextAttributes();
  if (selectionStyle.lineColor) {
    selectedColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
    highlightAttributes.color = new WorldWind.Color(selectedColor.r, selectedColor.g, selectedColor.b, selectedColor.a);
  } else {
    highlightAttributes.color = WorldWind.Color.YELLOW;
  }

  location = new WorldWind.Location(geoJSON.geometry.coordinates[1], geoJSON.geometry.coordinates[0]);

  textPrimitive = new WorldWind.GeographicText(location, geoJSON.properties.label);
  textPrimitive.attributes = attributes;
  textPrimitive.altitudeMode = geoJSON.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
  textPrimitive.highlightAttributes = highlightAttributes;

  return textPrimitive;
};
