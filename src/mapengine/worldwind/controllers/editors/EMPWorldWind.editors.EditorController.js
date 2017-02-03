var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.editors = EMPWorldWind.editors || {};

/**
 * @classdesc The EditorController handles all drawing, editing, and updating of features
 * @class
 */
EMPWorldWind.editors.EditorController = (function() {

  /**
   *
   * @param {emp.typeLibrary.Feature} feature
   * @returns {WorldWind.Polygon}
   */
  function constructAirControlMeasure(feature) {
    var primitivePolygon, boundaries, attributes,
      i,
      len = feature.data.coordinates.length;

    attributes = new WorldWind.ShapeAttributes();

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

    return primitivePolygon;
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfaceCircle} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @returns {WorldWind.SurfaceCircle}
   */
  function constructSurfaceCircle(feature) {
    var attributes, lineColor, fillColor, highlightAttributes, location, circlePrimitive;

    attributes = new WorldWind.ShapeAttributes();

    if (feature.properties.lineColor) {
      lineColor = EMPWorldWind.utils.hexToRGBA(feature.properties.lineColor);
      attributes.outlineColor = new WorldWind.Color(lineColor.r, lineColor.g, lineColor.b, lineColor.a);
    } else {
      attributes.outlineColor = WorldWind.Color.BLACK;
    }

    if (feature.properties.fillColor) {
      fillColor = EMPWorldWind.utils.hexToRGBA(feature.properties.fillColor);
      attributes.interiorColor = new WorldWind.Color(fillColor.r, fillColor.g, fillColor.b, fillColor.a);
    } else {
      attributes.drawInterior = false;
    }

    attributes.outlineWidth = feature.properties.lineWidth || attributes.outlineWidth;

    highlightAttributes = new WorldWind.ShapeAttributes(attributes);
    highlightAttributes.interiorColor = WorldWind.Color.WHITE;

    location = new WorldWind.Location(feature.coordinates[1], feature.coordinates[0]);

    circlePrimitive = new WorldWind.SurfaceCircle(location, feature.properties.radius, attributes);
    circlePrimitive.displayName = feature.name;
    circlePrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    circlePrimitive.highlightAttributes = highlightAttributes;

    return circlePrimitive;
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfaceEllipse} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @returns {WorldWind.SurfaceEllipse}
   */
  function constructSurfaceEllipse(feature) {
    var attributes, lineColor, fillColor, highlightAttributes, location, ellipsePrimitive;

    attributes = new WorldWind.ShapeAttributes();

    if (feature.properties.lineColor) {
      lineColor = EMPWorldWind.utils.hexToRGBA(feature.properties.lineColor, feature.properties.lineOpacity, true);
      attributes.outlineColor = new WorldWind.Color(lineColor.r, lineColor.g, lineColor.b, lineColor.a);
    } else {
      attributes.outlineColor = WorldWind.Color.BLACK;
    }

    if (feature.properties.fillColor) {
      fillColor = EMPWorldWind.utils.hexToRGBA(feature.properties.fillColor);
      attributes.interiorColor = new WorldWind.Color(fillColor.r, fillColor.g, fillColor.b, fillColor.a);
    } else {
      attributes.drawInterior = false;
    }

    attributes.outlineWidth = feature.properties.lineWidth || attributes.outlineWidth;

    highlightAttributes = new WorldWind.ShapeAttributes(attributes);
    highlightAttributes.interiorColor = WorldWind.Color.WHITE;
    location = new WorldWind.Location(feature.coordinates[1], feature.coordinates[0]);

    ellipsePrimitive = new WorldWind.SurfaceEllipse(location,
      feature.properties.semiMajor,
      feature.properties.semiMinor,
      feature.properties.azimuth,
      attributes);
    ellipsePrimitive.displayName = feature.name;
    ellipsePrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    ellipsePrimitive.highlightAttributes = highlightAttributes;

    return ellipsePrimitive;
  }

  /**
   * @param {emp.typeLibrary.Feature} feature
   * @param {object} modifiers
   * @returns {WorldWind.Placemark}
   * @private
   */
  function _constructSinglePointMilStdSymbol(feature, modifiers) {
    var placemark, attributes, position, imageInfo, imageCenter, imageBounds, imageOffset;

    attributes = new WorldWind.PlacemarkAttributes();

    // TODO pass in leaderline settings by feature or via config object
    // Leaderline settings
    attributes.drawLeaderLine = true;
    attributes.leaderLineAttributes.outlineColor = WorldWind.Color.RED;

    // Render
    imageInfo = armyc2.c2sd.renderer.MilStdIconRenderer.Render(feature.symbolCode, modifiers);
    imageCenter = imageInfo.getCenterPoint();
    imageBounds = imageInfo.getImageBounds();

    imageOffset = new WorldWind.Offset(
      WorldWind.OFFSET_FRACTION, imageCenter.x / imageBounds.width,
      WorldWind.OFFSET_FRACTION, 1 - (imageCenter.y / imageBounds.height)
    );

    attributes.imageScale = 1;
    attributes.imageOffset = imageOffset;
    attributes.imageSource = imageInfo.toDataUrl();

    position = new WorldWind.Position(
      feature.data.coordinates[1],
      feature.data.coordinates[0],
      EMPWorldWind.utils.defined(feature.data.coordinates[2]) ? feature.data.coordinates[2] : 0);

    placemark = new WorldWind.Placemark(position, true, null);
    placemark.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    placemark.attributes = new WorldWind.PlacemarkAttributes(attributes);

    return placemark;
  }

  /**
   *
   * @param {emp.typeLibrary.Feature} feature
   * @param {object} modifiers
   * @returns {WorldWind.SurfaceShape[]}
   * @private
   */
  function _constructMultiPointMilStdFeature(feature, modifiers) {
    var imageInfo, bbox, componentFeature, lineCount, subGeoJSON,
      i, j,
      positions = "",
      shapes = [];

    var featureCoords = feature.data.coordinates.join().split(",");

    // Compute bounding box information
    var lowerLeftX = feature.data.coordinates[0][0],
      lowerLeftY = feature.data.coordinates[0][1],
      upperRightX = feature.data.coordinates[0][0],
      upperRightY = feature.data.coordinates[0][1];

    for (i = 0; i < featureCoords.length; i += 2) {
      lowerLeftX = Math.min(feature.data.coordinates[i / 2][0], lowerLeftX);
      lowerLeftY = Math.min(feature.data.coordinates[i / 2][1], lowerLeftY);
      upperRightX = Math.max(feature.data.coordinates[i / 2][0], upperRightX);
      upperRightY = Math.max(feature.data.coordinates[i / 2][1], upperRightY);

      positions += featureCoords[i] + "," + featureCoords[i + 1] + " ";
    }

    positions.trim();
    bbox = lowerLeftX + "," + lowerLeftY + "," + upperRightX + "," + upperRightY;

    // preserve the bounding box information
    feature.positions = positions;
    feature.bbox = bbox;

    // TODO get update to renderer to pass back raw JSON object
    imageInfo = JSON.parse(sec.web.renderer.SECWebRenderer.RenderSymbol(
      feature.name,
      feature.coreId,
      feature.description,
      feature.symbolCode,
      positions,
      "clampToGround",
      this.worldWind.navigator.range * 10,
      bbox,
      modifiers,
      EMPWorldWind.constants.MultiPointRenderType.GEOJSON));

    for (i = 0; i < imageInfo.features.length; i++) {
      componentFeature = imageInfo.features[i];
      switch (componentFeature.geometry.type) {
        case "MultiLineString":
          lineCount = componentFeature.geometry.coordinates.length;

          for (j = 0; j < lineCount; j++) {
            subGeoJSON = {
              properties: componentFeature.properties,
              coordinates: componentFeature.geometry.coordinates[j]
            };

            shapes.push(constructSurfacePolylineFromGeoJSON(subGeoJSON));
          }
          break;
        case "LineString":
          shapes.push(constructSurfacePolylineFromGeoJSON(componentFeature));
          break;
        case "Point":
          shapes.push(constructPlacemarkFromGeoJSON(componentFeature));
          break;
        case "Polygon":
          shapes.push(constructSurfacePolygonFromGeoJSON(componentFeature));
          break;
        default:
          window.console.error("Unable to render symbol with type " + componentFeature.geometry.type);
      }
    }

    return shapes;
  }

  /**
   * Requires access to the current scope ie .bind .call .apply
   *
   * @param {emp.typeLibrary.Feature} feature
   */
  function processModifiers(feature) {
    var modifiers, enhancedModifiers, override;
    if (feature.data.type === "Point") {
      modifiers = EMPWorldWind.utils.milstd.updateModifierLabels(feature.properties, feature.name, this.state.labelStyles, this.state.pixelSize);
    } else {
      modifiers = EMPWorldWind.utils.milstd.updateModifierLabels(feature.properties, feature.name, {}, this.state.pixelSize);
    }

    modifiers = EMPWorldWind.utils.milstd.convertModifierStringTo2525(modifiers, this.state.labelStyles.CN === true);

    enhancedModifiers = EMPWorldWind.utils.milstd.checkForRequiredModifiers(feature);

    for (override in enhancedModifiers) {
      if (enhancedModifiers.hasOwnProperty(override)) {
        modifiers[override] = enhancedModifiers[override];
      }
    }

    return modifiers;
  }

  /**
   * Requires access to the current scope.
   * ie .bind .call .apply
   *
   * @param {emp.typeLibrary.Feature} feature
   * @returns {WorldWind.SurfaceShape[]}
   */
  function constructMilStdSymbol(feature) {
    var modifiers, shapes = [];

    // Process the modifiers
    modifiers = processModifiers.call(this, feature);

    if (feature.data.type === "Point") {
      shapes.push(_constructSinglePointMilStdSymbol(feature, modifiers));
    } else if (feature.data.type === "LineString") {
      // Requires access to the WorldWindow navigator, bind to the current scope
      shapes = shapes.concat(_constructMultiPointMilStdFeature.call(this, feature, modifiers));
    } else {
      window.console.error("Unhandled feature type: " + feature.data.type + " in EMPWorldWind");
    }

    return shapes;
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfacePolyline} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @returns {WorldWind.SurfacePolyline}
   */
  function constructSurfacePolyline(feature) {
    var i, color, pathPrimitive, attributes, highlightAttributes,
      len = feature.data.coordinates.length,
      locations = [];

    attributes = new WorldWind.ShapeAttributes();

    // SurfacePolyline uses the following attributes
    if (feature.properties.strokeColor) {
      color = EMPWorldWind.utils.hexToRGBA(feature.properties.strokeColor, feature.properties.lineOpacity, true);
      attributes.outlineColor = new WorldWind.Color(color.r, color.g, color.b, color.a);
    } else {
      attributes.outlineColor = WorldWind.Color.BLACK;
    }

    attributes.outlineWidth = feature.properties.strokeWidth || attributes.outlineWidth;

    for (i = 0; i < len; i++) {
      locations.push(new WorldWind.Location(feature.data.coordinates[i][1], feature.data.coordinates[i][0]));
    }

    highlightAttributes = new WorldWind.ShapeAttributes(attributes);
    highlightAttributes.interiorColor = WorldWind.Color.WHITE;

    pathPrimitive = new WorldWind.SurfacePolyline(locations, attributes);
    pathPrimitive.displayName = feature.name;
    pathPrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    pathPrimitive.highlightAttributes = highlightAttributes;

    return pathPrimitive;
  }

  /**
   * This function is similar to the feature based version except it takes a geoJSON object as the only parameter.
   * @param {object} geoJSON
   * @returns {WorldWind.SurfacePolyline}
   */
  function constructSurfacePolylineFromGeoJSON(geoJSON) {
    var i, color, attributes, polylinePrimitive,
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

    polylinePrimitive = new WorldWind.SurfacePolyline(locations, attributes);
    polylinePrimitive.altitudeMode = geoJSON.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;

    return polylinePrimitive;
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.Placemark} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @returns {WorldWind.Placemark}
   */
  function constructPlacemark(feature) {
    var position, placemark, highlightAttributes, attributes,
      eyeDistanceScaling = true;

    attributes = new WorldWind.PlacemarkAttributes();
    attributes.imageSource = WorldWind.configuration.baseUrl + "images/emp-default-icon.png";

    position = new WorldWind.Location(feature.data.coordinates[1], feature.data.coordinates[0]);

    highlightAttributes = new WorldWind.PlacemarkAttributes();
    highlightAttributes.imageScale = 1.5;

    placemark = new WorldWind.Placemark(position, eyeDistanceScaling, attributes);
    placemark.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    placemark.highlightAttributes = highlightAttributes;

    return placemark;
  }

  /**
   * @param {object} geoJSON
   * @returns {WorldWind.Placemark}
   */
  function constructPlacemarkFromGeoJSON(geoJSON) {
    var color, location, text;

    var attributes = new WorldWind.TextAttributes();

    color = EMPWorldWind.utils.hexToRGBA(geoJSON.properties.fontColor, null, true);
    attributes.color = new WorldWind.Color(color.r, color.g, color.b, color.a);

    attributes.font = new WorldWind.Font(
      geoJSON.properties.fontSize,
      "normal",
      "normal",
      geoJSON.properties.fontWeight,
      geoJSON.properties.fontFamily,
      geoJSON.properties.labelAlign);

    location = new WorldWind.Location(geoJSON.geometry.coordinates[1], geoJSON.geometry.coordinates[0], 0);

    text = new WorldWind.GeographicText(location, geoJSON.properties.label);
    text.altitudeMode = WorldWind.CLAMP_TO_GROUND;

    return text;
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfacePolygon} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @returns {WorldWind.SurfacePolygon}
   */
  function constructSurfacePolygon(feature) {
    var polygonPrimitive, attributes, highlightAttributes, interiorColor, outlineColor, boundaryLen,
      i, j,
      boundaries = [],
      numBounds = feature.data.coordinates.length;

    for (i = 0; i < numBounds; i++) {
      boundaryLen = feature.data.coordinates[i].length;
      var subBoundary = [];
      for (j = 0; j < boundaryLen; j++) {
        subBoundary.push(new WorldWind.Location(feature.data.coordinates[i][j][1], feature.data.coordinates[i][j][0]));
      }
      boundaries.push(subBoundary);
    }

    attributes = new WorldWind.ShapeAttributes();

    if (feature.properties.strokeColor) {
      outlineColor = EMPWorldWind.utils.hexToRGBA(feature.properties.strokeColor);
      attributes.outlineColor = new WorldWind.Color(outlineColor.r, outlineColor.g, outlineColor.b, outlineColor.a);
    } else {
      attributes.outlineColor = WorldWind.Color.BLACK;
    }

    if (feature.properties.fillColor) {
      interiorColor = EMPWorldWind.utils.hexToRGBA(feature.properties.fillColor);
      attributes.interiorColor = new WorldWind.Color(interiorColor.r, interiorColor.g, interiorColor.b, interiorColor.a);
    } else {
      attributes.drawInterior = false;
    }

    attributes.outlineWidth = feature.properties.strokeWidth || attributes.outlineWidth;

    attributes.outlineStippleFactor = feature.properties.stippleFactor || attributes.outlineStippleFactor;
    attributes.outlineStipplePattern = feature.properties.stipplePattern || attributes.outlineStipplePattern;

    highlightAttributes = new WorldWind.ShapeAttributes(attributes);
    highlightAttributes.interiorColor = WorldWind.Color.WHITE;

    polygonPrimitive = new WorldWind.SurfacePolygon(boundaries, attributes);
    polygonPrimitive.displayName = feature.name;
    polygonPrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    polygonPrimitive.highlightAttributes = highlightAttributes;

    return polygonPrimitive;
  }

  /**
   *
   * @param {object} geoJSON
   * @returns {WorldWind.SurfacePolygon}
   */
  function constructSurfacePolygonFromGeoJSON(geoJSON) {
    var attributes, interiorColor, outlineColor, boundaryLen, polygonPrimitive,
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

    polygonPrimitive = new WorldWind.SurfacePolygon(boundaries, attributes);
    polygonPrimitive.altitudeMode = geoJSON.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    polygonPrimitive.displayName = geoJSON.properties.name;

    return polygonPrimitive;
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfaceRectangle} primitive
   * This handles rectangles and squares
   * @param {emp.typeLibrary.Feature} feature
   * @returns {WorldWind.SurfaceRectangle}
   */
  function constructSurfaceRectangle(feature) {
    var attributes, lineColor, fillColor, highlightAttributes, location, rectPrimitive;

    attributes = new WorldWind.ShapeAttributes(null);

    if (feature.properties.lineColor) {
      lineColor = EMPWorldWind.utils.hexToRGBA(feature.properties.lineColor);
      attributes.outlineColor = new WorldWind.Color(lineColor.r, lineColor.g, lineColor.b, lineColor.a);
    } else {
      attributes.outlineColor = WorldWind.Color.BLACK;
    }

    if (feature.properties.fillColor) {
      fillColor = EMPWorldWind.utils.hexToRGBA(feature.properties.fillColor);
      attributes.interiorColor = new WorldWind.Color(fillColor.r, fillColor.g, fillColor.b, fillColor.a);
    } else {
      attributes.drawInterior = false;
    }

    attributes.outlineWidth = feature.properties.lineWidth || attributes.outlineWidth;

    highlightAttributes = new WorldWind.ShapeAttributes(attributes);
    highlightAttributes.interiorColor = WorldWind.Color.WHITE;
    location = new WorldWind.Location(feature.coordinates[1], feature.coordinates[0], (feature.coordinates.length > 2) ? feature.coordinates[1] : 0);

    if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE) {
      rectPrimitive = new WorldWind.SurfaceRectangle(location, feature.properties.width, feature.properties.height, feature.properties.azimuth, attributes);
    } else {
      rectPrimitive = new WorldWind.SurfaceRectangle(location, feature.properties.width, feature.properties.width, feature.properties.azimuth, attributes);
    }

    rectPrimitive.displayName = feature.name;
    rectPrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    rectPrimitive.highlightAttributes = highlightAttributes;

    return rectPrimitive;
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.Text} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @returns {WorldWind.Text}
   */
  function constructText(feature) {
    var attributes, location, textPrimitive, highlightAttributes, labelColor;

    attributes = new WorldWind.TextAttributes(null);
    attributes.depthTest = false;

    if (feature.properties.labelStyle && feature.properties.labelStyle.color) {
      labelColor = feature.properties.labelStyle.color;
      attributes.color = new WorldWind.Color(labelColor.red, labelColor.green, labelColor.blue, labelColor.alpha);
    } else {
      labelColor = EMPWorldWind.utils.hexToRGBA(EMPWorldWind.constants.propertyDefaults.FILL_COLOR_HEX);// white
      attributes.color = new WorldWind.Color(labelColor.r, labelColor.g, labelColor.b, labelColor.a);
    }

    if (feature.properties.labelStyle && feature.properties.labelStyle.family) {
      attributes.font.family = feature.properties.labelStyle.family;
    }

    if (feature.properties.labelStyle && feature.properties.labelStyle.justification) {
      attributes.font.horizontalAlignment = feature.properties.labelStyle.justification;
    }

    if (feature.properties.labelStyle && feature.properties.labelStyle.size) {
      attributes.font.size = feature.properties.labelStyle.size;
    }

    highlightAttributes = new WorldWind.ShapeAttributes(attributes);
    highlightAttributes.interiorColor = WorldWind.Color.WHITE;
    location = new WorldWind.Location(feature.coordinates[1], feature.coordinates[0]);

    textPrimitive = new WorldWind.GeographicText(location, feature.name);
    textPrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    textPrimitive.highlightAttributes = highlightAttributes;

    return textPrimitive;
  }

  return {
    /**
     * Creates a new EMPWorldWind feature and associated WorldWind features from an EMP feature and adds it to the map
     *
     * @param {emp.typeLibrary.Feature} empFeature
     * @this EMPWorldWind.map
     * @returns {{success: boolean, message: string, feature: EMPWorldWind.data.EmpFeature}}
     */
    plotFeature: function(empFeature) {
      var wwFeature, layer, buildShapes, shapes;

      var rc = {
        message: "",
        success: true,
        feature: undefined
      };

      switch (empFeature.format) {
        case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
          buildShapes = constructAirControlMeasure;
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
          buildShapes = constructSurfaceCircle;
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
          buildShapes = constructSurfaceEllipse;
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
          buildShapes = constructMilStdSymbol.bind(this);
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
          buildShapes = constructSurfacePolyline;
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
          buildShapes = constructPlacemark;
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
          buildShapes = constructSurfacePolygon;
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
        case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
          buildShapes = constructSurfaceRectangle;
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
          buildShapes = constructText;
          break;
        default:
          rc.success = false;
          rc.message = "Missing feature constructor for format: " + empFeature.format;
      }

      if (!rc.success) {
        return rc;
      }

      wwFeature = new EMPWorldWind.data.EmpFeature(empFeature);

      try {
        shapes = buildShapes(empFeature);

        wwFeature.addShapes(shapes);

        layer = this.getLayer(empFeature.parentCoreId);
        layer.addFeature(wwFeature);

        rc.feature = wwFeature;
        rc.success = true;
      } catch (err) {
        rc.message = err.message;
      }

      return rc;
    },
    /**
     * Updates a WorldWind Renderable object on the map and returns the updated objects in the response
     * @param {EMPWorldWind.data.EmpFeature} wwFeature
     * @param {emp.typeLibrary.Feature} empFeature
     * @returns {object}
     */
    updateFeature: function(wwFeature, empFeature) {
      var layer,
        rc = {
          success: true,
          message: "",
          feature: wwFeature
        };

      // TODO get update on how to move features instead of deleting them and redrawing new ones
      layer = this.getLayer(empFeature.parentCoreId);
      layer.removeFeature(wwFeature);
      wwFeature.clearShapes();

      switch (empFeature.format) {

        case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
          //modifiers = processModifiers.call(this, empFeature);

          // TODO see about checking if a re-render is necessary first once moving features is possible
          // reRender = (JSON.stringify(modifiers) !== JSON.stringify(wwFeature.userProperties.modifiers)) ||
          //   empFeature.name !== wwFeature.userProperties.feature.name ||
          //   empFeature.symbolCode !== wwFeature.userProperties.feature.symbolCode ||
          //   empFeature.symbolStandard !== wwFeature.userProperties.feature.symbolStandard;

          wwFeature.addShapes(constructMilStdSymbol.call(this, empFeature));
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
          wwFeature.addShapes(constructAirControlMeasure(empFeature));
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
          wwFeature.addShapes(constructSurfaceCircle(empFeature));
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
          wwFeature.addShapes(constructSurfaceEllipse(empFeature));
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
          wwFeature.addShapes(constructSurfacePolyline(empFeature));
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
          wwFeature.addShapes(constructPlacemark(empFeature));
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
          wwFeature.addShapes(constructSurfacePolygon(empFeature));
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
        case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
          wwFeature.addShapes(constructSurfaceRectangle(empFeature));
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
          wwFeature.addShapes(constructText(empFeature));
          break;
        default:
          rc.success = false;
      }

      // Redraw the new shapes
      if (rc.success) {
        layer.addFeature(wwFeature);
        rc.feature = wwFeature;
      }
      return rc;
    },
    /**
     *
     * @param {EMPWorldWind.data.EmpFeature} wwFeature
     * @this EMPWorldWind.map
     */
    updateFeatureLabelStyle: function(wwFeature) {
      var shapes,
        empLayer = this.getLayer(wwFeature.feature.parentCoreId);

      switch (wwFeature.feature.format) {
        case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
          empLayer.removeFeature(wwFeature);
          wwFeature.clearShapes();
          shapes = constructMilStdSymbol.call(this, wwFeature.feature);
          wwFeature.addShapes(shapes);
          empLayer.addFeature(wwFeature);
          break;
        case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
        case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
        case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
        case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
        case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
        case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
        case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
        case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
        case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
        default:
          // do nothing
      }
    }
  };
})();
