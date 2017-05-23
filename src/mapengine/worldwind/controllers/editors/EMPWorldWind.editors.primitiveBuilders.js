var EMPWorldWind = window.EMPWorldWind || {};
EMPWorldWind.editors = EMPWorldWind.editors || {};

/**
 * Set of builder functions that produce singular WorldWind primitive shapes and renderables.
 * @namespace
 */
EMPWorldWind.editors.primitiveBuilders = (function() {

  /** @type {Object.<string,function>} */
  var builderMap = {};

  /**
   * @todo Use update from NASA WW to handle 3d airspaces
   * @param {emp.typeLibrary.Feature} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {WorldWind.Polygon}
   */
  function constructAirControlMeasure(feature, selectionStyle) {
    var primitivePolygon, boundaries, attributes, highlightAttributes,
      i, selectedFillColor,
      len = feature.data.coordinates.length;

    attributes = new WorldWind.ShapeAttributes();
    highlightAttributes = new WorldWind.ShapeAttributes();
    // TODO highlight attributes for ACM

    if (selectionStyle.fillColor) {
      selectedFillColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.fillColor);
      highlightAttributes.interiorColor = new WorldWind.Color(selectedFillColor.red, selectedFillColor.green, selectedFillColor.blue, selectedFillColor.alpha);
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
  }

  /**
   * Requires access to the current scope.
   * ie .bind .call .apply
   *
   * @param {emp.typeLibrary.Feature} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {WorldWind.SurfaceShape[]}
   */
  function constructMilStdSymbol(feature, selectionStyle) {
    var modifiers, shapes = [];

    /**
     * @param {emp.typeLibrary.Feature} feature
     * @param {object} modifiers
     * @param {SelectionStyle} selectionStyle
     * @returns {WorldWind.Placemark}
     * @private
     */
    function _constructSinglePointMilStdSymbol(feature, modifiers, selectionStyle) {
      var placemark, attributes, highlightAttributes, position, imageInfo, imageCenter, imageBounds, imageOffset,
        selectedImage, symbolCode, selectedModifiers,
        eyeDistanceScaling = false;

      attributes = new WorldWind.PlacemarkAttributes();

      // Leaderline settings
      attributes.drawLeaderLine = feature.properties.extrude || false;
      attributes.leaderLineAttributes.outlineColor = WorldWind.Color.BLACK;

      if (feature.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.HIGHEST_RANGE) {
        // Optimization
        attributes.imageScale = 1;
        attributes.imageSource = EMPWorldWind.utils.selectHighAltitudeRangeImage(feature.symbolCode);
        attributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);// Centers the image on the geographic position.
        highlightAttributes = new WorldWind.PlacemarkAttributes();
        highlightAttributes.imageColor = WorldWind.Color.WHITE;
        highlightAttributes.imageSource = attributes.imageSource;
      } else {

        if ((this.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.MID_RANGE) && feature.symbolCode) {
          // do not display country code
          symbolCode = feature.symbolCode.substr(0, 12) + "--" + feature.symbolCode.substr(14);
        } else {
          // display country code
          symbolCode = feature.symbolCode;
        }

        // Render
        imageInfo = armyc2.c2sd.renderer.MilStdIconRenderer.Render(symbolCode, modifiers);
        imageCenter = imageInfo.getCenterPoint();
        imageBounds = imageInfo.getImageBounds();

        // Calculate offset
        imageOffset = new WorldWind.Offset(
          WorldWind.OFFSET_FRACTION, imageCenter.x / imageBounds.width,
          WorldWind.OFFSET_FRACTION, 1 - (imageCenter.y / imageBounds.height)
        );

        attributes.imageScale = this.state.iconSize;
        attributes.imageOffset = imageOffset;
        attributes.imageSource = imageInfo.toDataUrl();

        // Highlight attributes
        highlightAttributes = new WorldWind.PlacemarkAttributes(attributes);
        highlightAttributes.imageColor = WorldWind.Color.WHITE;
        highlightAttributes.imageOffset = imageOffset;
        highlightAttributes.imageScale = this.state.selectionStyle.scale;

        // Note that this is done statically, if the selection style changes a bulk update to every feature will need to be done
        selectedModifiers = Object.assign({}, modifiers);
        selectedModifiers.LINECOLOR = selectionStyle.lineColor;
        selectedModifiers.FILLCOLOR = selectionStyle.fillColor;
        selectedImage = armyc2.c2sd.renderer.MilStdIconRenderer.Render(feature.symbolCode, selectedModifiers).toDataUrl();
        highlightAttributes.imageSource = selectedImage;
      }

      position = new WorldWind.Position(
        feature.data.coordinates[1],
        feature.data.coordinates[0],
        EMPWorldWind.utils.defined(feature.data.coordinates[2]) ? feature.data.coordinates[2] : 0);

      placemark = new WorldWind.Placemark(position, eyeDistanceScaling);
      placemark.alwaysOnTop = true;
      placemark.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
      placemark.attributes = new WorldWind.PlacemarkAttributes(attributes);
      placemark.highlightAttributes = new WorldWind.PlacemarkAttributes(highlightAttributes);

      return placemark;
    }


    if (feature.data.type === "Point") {
      modifiers = EMPWorldWind.editors.primitiveBuilders.processModifiers.call(this, feature);
      shapes.push(_constructSinglePointMilStdSymbol.call(this, feature, modifiers, selectionStyle));
    } else if (feature.data.type === "LineString") {
      shapes = shapes.concat(EMPWorldWind.editors.primitiveBuilders.constructMultiPointMilStdFeatures.call(this, [feature]));
    } else {
      // TODO alert the user more gracefully that the type is unhandled
      window.console.error("Unhandled feature type: " + feature.data.type + " in EMPWorldWind");
    }

    return shapes;
  }

  /**
   * Builds a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfaceCircle} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {WorldWind.SurfaceCircle}
   */
  function constructSurfaceCircle(feature, selectionStyle) {
    var attributes, location, circlePrimitive;

    // Construct circle attributes
    attributes = createShapeAttributes(feature, selectionStyle);

    // Set the location
    location = new WorldWind.Location(feature.coordinates[1], feature.coordinates[0]);

    // Construct the primitive
    circlePrimitive = new WorldWind.SurfaceCircle(location, feature.properties.radius, attributes.attributes);

    // Set the primitive properties
    circlePrimitive.displayName = feature.name;
    circlePrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    circlePrimitive.highlightAttributes = attributes.highlightAttributes;

    return circlePrimitive;
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfaceEllipse} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {WorldWind.SurfaceEllipse}
   */
  function constructSurfaceEllipse(feature, selectionStyle) {
    var attributes, location, ellipsePrimitive;

    // Construct the ellipse attributes
    attributes = createShapeAttributes(feature, selectionStyle);

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
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfacePolyline} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {WorldWind.SurfacePolyline}
   */
  function constructSurfacePolyline(feature, selectionStyle) {
    var i, pathPrimitive, attributes,
      len = feature.data.coordinates.length,
      locations = [];

    // Construct the path attributes
    attributes = createShapeAttributes(feature, selectionStyle);

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
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.Placemark} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {WorldWind.Placemark}
   */
  function constructPlacemark(feature, selectionStyle) {
    var position, placemark, attributes,
      eyeDistanceScaling = false;

    // Create the placemark attributes
    attributes = createShapeAttributes.call(this, feature, selectionStyle);

    // Set the position
    position = new WorldWind.Position(
      feature.data.coordinates[1],
      feature.data.coordinates[0],
      feature.data.coordinates[2] || 0);

    // Construct the primitive
    placemark = new WorldWind.Placemark(position, eyeDistanceScaling, attributes.attributes);

    // Set the placemark attributes
    placemark.alwaysOnTop = true;
    placemark.label = feature.name;
    placemark.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    placemark.highlightAttributes = new WorldWind.PlacemarkAttributes(attributes.highlightAttributes);

    return placemark;
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfacePolygon} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {WorldWind.SurfacePolygon}
   */
  function constructSurfacePolygon(feature, selectionStyle) {
    var polygonPrimitive, attributes, boundaryLen,
      i, j,
      boundaries = [],
      numBounds = feature.data.coordinates.length;

    // Construct the polygon attributes
    attributes = createShapeAttributes(feature, selectionStyle);

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
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.SurfaceRectangle} primitive
   * This handles rectangles and squares
   * @param {emp.typeLibrary.Feature} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {WorldWind.SurfaceRectangle}
   */
  function constructSurfaceRectangle(feature, selectionStyle) {
    var attributes, location, width, height, rectPrimitive;

    // Construct the rectangle/square attributes
    attributes = createShapeAttributes(feature, selectionStyle);

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
  }

  /**
   * Constructs a {@link EMPWorldWind.data.EmpFeature} using using the {@link WorldWind.Text} primitive
   * @param {emp.typeLibrary.Feature} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {WorldWind.Text}
   */
  function constructText(feature, selectionStyle) {
    var attributes, position, textPrimitive;

    // Construct circle attributes
    attributes = createShapeAttributes(feature, selectionStyle);

    // Set the position
    position = new WorldWind.Position(
      feature.coordinates[1], // Latitude
      feature.coordinates[0], // Longitude
      feature.coordinates[2] ? feature.coordinates[2] : 0); // Altitude

    // Construct the text
    textPrimitive = new WorldWind.GeographicText(position, feature.name);

    // Set the primitive properties
    textPrimitive.attributes = attributes.attributes;
    textPrimitive.altitudeMode = feature.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
    textPrimitive.highlightAttributes = attributes.highlightAttributes;

    return textPrimitive;
  }

  /**
   * @param {emp.typeLibrary.Feature | object} feature
   * @returns {WorldWind.TextAttributes}
   */
  function createTextAttributes(feature) {
    var textColor, size,
      attributes = new WorldWind.TextAttributes();

    // Set the offset
    attributes.offset = new WorldWind.Offset(
      WorldWind.OFFSET_FRACTION, -0.05, // To the right of the point by default
      WorldWind.OFFSET_FRACTION, 0.5 // Center Y be default
    );

    // Should not be occluded by terrain or objects when false
    attributes.depthTest = false;

    // Label Color
    if (feature.properties.labelStyle && feature.properties.labelStyle.color) {
      textColor = EMPWorldWind.utils.normalizeRGBAColor(feature.properties.labelStyle.color);
    } else if (feature.properties.fontColor) {
      textColor = EMPWorldWind.utils.hexToRGBA(feature.properties.fontColor);
    } else {
      textColor = EMPWorldWind.utils.hexToRGBA(EMPWorldWind.constants.propertyDefaults.FILL_COLOR_HEX);
    }
    attributes.color = new WorldWind.Color(textColor.red, textColor.green, textColor.blue, textColor.alpha);

    // Font Family
    if (feature.properties.labelStyle && feature.properties.labelStyle.family) {
      attributes.font.family = feature.properties.labelStyle.family;
    } else if (feature.properties.fontFamily) {
      attributes.font.family = feature.properties.fontFamily;
    }

    // Justification
    if (feature.properties.labelStyle && feature.properties.labelStyle.justification) {
      attributes.font.horizontalAlignment = feature.properties.labelStyle.justification;
    } else if (feature.properties.labelAlign) {
      attributes.font.horizontalAlignment = feature.properties.labelAlign;
    }

    // Font size
    if (feature.properties.labelStyle && feature.properties.labelStyle.size) {
      attributes.font.size = feature.properties.labelStyle.size;
    } else if (feature.properties.fontSize) {
      size = feature.properties.fontSize;
      size = size.substring(0, size.length - 2);
      if (!isNaN(size)) {
        attributes.font.size = parseInt(feature.properties.fontSize);
      }
    }

    // Label Scale
    if (feature.properties.labelStyle && feature.properties.labelStyle.scale) {
      attributes.scale = feature.properties.labelStyle.scale;
    }

    return attributes;
  }

  /**
   * Wrapper function for generating the appropriate attributes based on the given feature and selection style
   * @param {emp.typeLibrary.Feature | object} feature
   * @param {SelectionStyle} selectionStyle
   * @returns {{attributes: *, highlightAttributes: *}}
   */
  function createShapeAttributes(feature, selectionStyle) {
    var attributes;

    /**
     *
     * @param feature
     * @param selectionStyle
     * @returns {{attributes: (WorldWind.TextAttributes|*), highlightAttributes: (WorldWind.TextAttributes|*)}}
     * @private
     */
    function _createTextAttributes(feature, selectionStyle) {
      var attributes, highlightAttributes, selectedLabelColor;
      // GeographicText requires TextAttributes instead
      attributes = createTextAttributes(feature);

      // Create highlight attributes from the regular attributes, only update highlight color
      highlightAttributes = new WorldWind.TextAttributes(attributes);
      if (selectionStyle.lineColor) {
        selectedLabelColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
        highlightAttributes.color = new WorldWind.Color(selectedLabelColor.red, selectedLabelColor.green, selectedLabelColor.blue, selectedLabelColor.alpha);
      } else {
        highlightAttributes.color = WorldWind.Color.YELLOW;
      }

      return {
        attributes: attributes,
        highlightAttributes: highlightAttributes
      };
    }


    /**
     *
     * @param feature
     * @param selectionStyle
     * @private
     */
    function _createPlacemarkAttributes(feature, selectionStyle) {
      var attributes, highlightAttributes, selectedLineColor;

      // Use PlacemarkAttributes
      attributes = new WorldWind.PlacemarkAttributes();

      // Set the leaderline options
      attributes.drawLeaderLine = feature.properties.extrude || false;

      // Set the imageURL
      if (feature.properties.iconUrl) {
        attributes.imageSource = feature.properties.iconUrl;
        if (feature.properties.useProxy) {
          attributes.imageSource = emp3.api.global.configuration.urlProxy + "?url=" + attributes.imageSource;
        }
      } else {
        attributes.imageSource = WorldWind.configuration.baseUrl + "images/emp-default-icon.png";
      }

      // Set the image size
      attributes.imageScale = this.state.iconSize;

      // Create the label attributes
      attributes.labelAttributes = createTextAttributes(feature);

      // Create the highlight attributes
      highlightAttributes = new WorldWind.PlacemarkAttributes(attributes);

      // Create separate label highlights, will be linked and overridden to the normal attributes if not
      highlightAttributes.labelAttributes = new WorldWind.TextAttributes(attributes.labelAttributes);

      // Image scale may differ when selected
      if (selectionStyle.scale) {
        highlightAttributes.imageScale = selectionStyle.scale;
      }

      if (selectionStyle.lineColor) {
        selectedLineColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
        highlightAttributes.imageColor = new WorldWind.Color(selectedLineColor.red, selectedLineColor.green, selectedLineColor.blue, selectedLineColor.alpha);
      } else {
        highlightAttributes.imageColor = WorldWind.Color.YELLOW;
      }

      // Update the label attributes for highlighted labels
      highlightAttributes.labelAttributes.offset = attributes.labelAttributes.offset;
      highlightAttributes.labelAttributes.color = highlightAttributes.imageColor;


      return {
        attributes: attributes,
        highlightAttributes: highlightAttributes
      };
    }

    /**
     *
     * @param feature
     * @param selectionStyle
     * @returns {{attributes: (WorldWind.ShapeAttributes|*), highlightAttributes: (WorldWind.ShapeAttributes|*)}}
     * @private
     */
    function _createSurfaceShapeAttributes(feature, selectionStyle) {
      var attributes, highlightAttributes, lineColor, fillColor, selectedLineColor, selectedFillColor;

      attributes = new WorldWind.ShapeAttributes();
      // Set stroke color
      if (feature.properties.strokeStyle && feature.properties.strokeStyle.strokeColor) {
        lineColor = EMPWorldWind.utils.normalizeRGBAColor(feature.properties.strokeStyle.strokeColor);
        attributes.outlineColor = new WorldWind.Color(lineColor.red, lineColor.green, lineColor.blue, lineColor.alpha);
      } else {
        attributes.outlineColor = WorldWind.Color.BLACK;
      }

      // Set fill color
      if (feature.properties.fillColor) {
        fillColor = EMPWorldWind.utils.hexToRGBA(feature.properties.fillColor);
        attributes.interiorColor = new WorldWind.Color(fillColor.red, fillColor.green, fillColor.blue, fillColor.alpha);
      } else {
        attributes.drawInterior = false;
      }

      // TODO fillPattern is not yet supported by the ShapeAttributes class

      // Line width
      if (feature.properties.strokeStyle &&  feature.properties.strokeStyle.strokeWidth) {
        attributes.outlineWidth = (!isNaN(parseInt(feature.properties.strokeStyle.strokeWidth)))?parseInt(feature.properties.strokeStyle.strokeWidth): EMPWorldWind.constants.propertyDefaults.LINE_WIDTH ;
        // pixel size between ww and Cesium are not matching. WW outline width is
        //much wider than in Cesium for polylines
        attributes.outlineWidth *=.3;
      }
      else if (feature.properties.strokeWidth || feature.properties.lineWidth) {
        attributes.outlineWidth = parseInt(feature.properties.strokeWidth) || parseInt(feature.properties.lineWidth);
        // pixel size between ww and Cesium are not matching. WW outline width is
        //much wider than in Cesium for polylines
        attributes.outlineWidth *=.3;
      }

      // Stippling of outline
     if (feature.properties.strokeStyle &&  feature.properties.strokeStyle.stippleFactor) {
        attributes.outlineStippleFactor = parseInt(feature.properties.strokeStyle.stippleFactor);
      }
      else
      {
        attributes.outlineStippleFactor = parseInt(feature.properties.stippleFactor) || parseInt(attributes.outlineStippleFactor);
      }
      if (feature.properties.strokeStyle &&  feature.properties.strokeStyle.stipplePattern) {
         attributes.outlineStipplePattern = feature.properties.strokeStyle.stipplePattern;
       }
       else
       {
         attributes.outlineStipplePattern = feature.properties.stipplePattern || attributes.outlineStipplePattern;
       }




      // Generate the highlight attributes from the normal attributes
      highlightAttributes = new WorldWind.ShapeAttributes(attributes);

      // Update the selected lineColor
      if (selectionStyle.lineColor) {
        selectedLineColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
        highlightAttributes.outlineColor = new WorldWind.Color(selectedLineColor.red, selectedLineColor.green, selectedLineColor.blue, selectedLineColor.alpha);
      } else {
        highlightAttributes.outlineColor = WorldWind.Color.YELLOW;
      }

      // Update the selected fillColor
      if (selectionStyle.fillColor) {
        selectedFillColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.fillColor);
        highlightAttributes.interiorColor = new WorldWind.Color(selectedFillColor.red, selectedFillColor.green, selectedFillColor.blue, selectedFillColor.alpha);
      } else {
        highlightAttributes.drawInterior = false;
      }

      return {
        attributes: attributes,
        highlightAttributes: highlightAttributes
      };
    }

    switch (feature.format) {
      case emp3.api.enums.FeatureTypeEnum.GEO_ACM: // TODO handle GEO_ACM attributes
      case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL: // Do nothing, handled by renderer, no primitives
      case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
        attributes = _createPlacemarkAttributes.call(this, feature, selectionStyle);
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
        attributes = _createTextAttributes.call(this, feature, selectionStyle);
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
      case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
      case emp3.api.enums.FeatureTypeEnum.GEO_PATH: // Not all of the attributes are used for path/polyline
      case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
      case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
      case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
      default:
        attributes = _createSurfaceShapeAttributes(feature, selectionStyle);
    }

    return attributes;
  }

  // Add the builders to the map
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_ACM] = constructAirControlMeasure;
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE] = constructSurfaceCircle;
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE] = constructSurfaceEllipse;
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL] = constructMilStdSymbol;
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_PATH] = constructSurfacePolyline;
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_POINT] = constructPlacemark;
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_POLYGON] = constructSurfacePolygon;
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE] = constructSurfaceRectangle;
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_SQUARE] = constructSurfaceRectangle;
  builderMap[emp3.api.enums.FeatureTypeEnum.GEO_TEXT] = constructText;

  return {
    /**
     * @param {emp.typeLibrary.Feature} empFeature
     */
    getPrimitiveBuilderForFeature: function(empFeature) {
      if (empFeature.format in builderMap) {
        return builderMap[empFeature.format];
      }
    },
    /**
   *
   * @param {emp.typeLibrary.Feature[]} features
   * @private
   */
   constructMultiPointMilStdFeatures: function (features) {
    var bbox, bounds, scale, featureCoords,
      data = {};

    bounds = this.getBounds();
    bbox = bounds.west + "," + bounds.south + "," + bounds.east + "," + bounds.north;
    data.bbox = bbox;

    data.batch = [];

    scale = EMPWorldWind.utils.boundsWidth(bounds) >> 2;
    data.scale = scale;

    data.format = EMPWorldWind.constants.MultiPointRenderType.GEOJSON;
    data.pixelHeight = this.worldWindow.canvas.clientHeight;
    data.pixelWidth = this.worldWindow.canvas.clientWidth;
    data.fontInfo = EMPWorldWind.utils.getFontInfo("arial", 10, "bold");

    emp.util.each(features, function(feature) {
      var i,
        modifiers,
        batchObject = {},
        positions = "";

      // Get the correct modifiers
      modifiers = EMPWorldWind.editors.primitiveBuilders.processModifiers.call(this, feature);

      // Generate position string
      featureCoords = feature.data.coordinates.join().split(",");
      for (i = 0; i < featureCoords.length; i += 2) {
        positions += featureCoords[i] + "," + featureCoords[i + 1] + " ";
      }
      positions = positions.trim();
      modifiers[armyc2.c2sd.renderer.utilities.MilStdAttributes.GeoJSONFormat] = 1; // 0 for string geojson, 1 for object geojson


      var basicSymbolId = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(feature.symbolCode);
      var symbolDefTable = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbolId, 1);

      // minimum points has to be met for this symbol. Don't bother calling the worker for this feature.
      // while we can skip invalid features, the feature is already render on the map with zero shapes.
      // zero shapes means nothing is visible on the map. The API tester or cor  shoukd do the vaidation before
      // sending invalid data to the engines.
      if (featureCoords.length/2 >= symbolDefTable.minPoints )
      {
        batchObject.id = feature.coreId;
        batchObject.name = feature.name;
        batchObject.description = unescape(feature.description);
        batchObject.symbolID = feature.symbolCode;
        batchObject.scale = scale; //scale;
        batchObject.bbox = data.bbox;
        batchObject.modifiers = modifiers;
        batchObject.format = EMPWorldWind.constants.MultiPointRenderType.GEOJSON;
        batchObject.symstd = 1; //TODO remove this hard coding of symstd    1;//1=2525C, 0=2525Bch2
        batchObject.fontInfo = EMPWorldWind.utils.getFontInfo("arial", 10, "bold");
        batchObject.altMode = WorldWind.CLAMP_TO_GROUND;
        batchObject.points = positions;
        data.batch.push(batchObject);
      }

    }.bind(this));

    // Call sec renderer worker
    if (this.secRendererWorker.lastSelected === EMPWorldWind.constants.RendererWorker.B) {
      this.secRendererWorker.A.postMessage(data);
      this.secRendererWorker.lastSelected = EMPWorldWind.constants.RendererWorker.A;
    } else {
      this.secRendererWorker.B.postMessage(data);
      this.secRendererWorker.lastSelected = EMPWorldWind.constants.RendererWorker.B;
    }
    // TODO remove empty array return, it is a holdover from before using web workers
    return [];
  },

  /**
   * Requires access to the current scope ie .bind .call .apply
   *
   * @param {emp.typeLibrary.Feature} feature
   */
   processModifiers: function (feature) {
    var modifiers, enhancedModifiers, override, lowRangeMode, showLabels;

    lowRangeMode = feature.singlePointAltitudeRangeMode === EMPWorldWind.constants.SinglePointAltitudeRangeMode.LOW_RANGE;
    if (feature.data.type === "Point") {
      modifiers = EMPWorldWind.utils.milstd.updateModifierLabels(
        feature.properties,
        feature.name,
        this.state.labelStyles, // Single-point shows symbols based on settings
        this.state.pixelSize);

      // Show labels conditionally
      showLabels = (this.state.labelStyles.CN === true) && lowRangeMode;
    } else {
      modifiers = EMPWorldWind.utils.milstd.updateModifierLabels(
        feature.properties,
        feature.name,
        EMPWorldWind.constants.AllLabels, // Multi-point always shows symbols
        this.state.pixelSize);

      // TODO apply some altitude filtering
      // Always show labels
      showLabels = true;
    }

    modifiers = EMPWorldWind.utils.milstd.convertModifierStringTo2525(modifiers, showLabels);
    enhancedModifiers = EMPWorldWind.utils.milstd.checkForRequiredModifiers(feature);

    for (override in enhancedModifiers) {
      if (enhancedModifiers.hasOwnProperty(override)) {
        modifiers[override] = enhancedModifiers[override];
      }
    }

    return modifiers;
  },

    /**
     * This function is similar to the feature based version except it takes a geoJSON object as the only parameter.
     * @param {object} geoJSON
     * @param {SelectionStyle} selectionStyle
     * @returns {WorldWind.SurfacePolyline}
     */
    constructSurfacePolylineFromGeoJSON: function(geoJSON, selectionStyle) {
      var i, color, attributes, highlightAttributes, polylinePrimitive, selectedLineColor,
        len = geoJSON.coordinates.length,
        locations = [];

      attributes = new WorldWind.ShapeAttributes();
      // SurfacePolyline uses the following attributes
      if (geoJSON.properties.strokeColor) {
        color = EMPWorldWind.utils.hexToRGBA(geoJSON.properties.strokeColor, geoJSON.properties.lineOpacity);
        attributes.outlineColor = new WorldWind.Color(color.red, color.green, color.blue, color.alpha);
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
        highlightAttributes.outlineColor = new WorldWind.Color(selectedLineColor.red, selectedLineColor.green, selectedLineColor.blue, selectedLineColor.alpha);
      } else {
        highlightAttributes.outlineColor = WorldWind.Color.YELLOW;
      }

      polylinePrimitive = new WorldWind.SurfacePolyline(locations, attributes);
      polylinePrimitive.altitudeMode = geoJSON.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
      polylinePrimitive.highlightAttributes = new WorldWind.ShapeAttributes(highlightAttributes);

      return polylinePrimitive;
    },
    /**
     *
     * @param {object} geoJSON
     * @param {SelectionStyle} selectionStyle
     * @returns {WorldWind.SurfacePolygon}
     */
    constructSurfacePolygonFromGeoJSON: function(geoJSON, selectionStyle) {
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
        attributes.outlineColor = new WorldWind.Color(outlineColor.red, outlineColor.green, outlineColor.blue, outlineColor.alpha);
      } else {
        attributes.outlineColor = WorldWind.Color.BLACK;
      }

      if (geoJSON.properties.fillColor) {
        interiorColor = EMPWorldWind.utils.hexToRGBA(geoJSON.properties.fillColor);
        attributes.interiorColor = new WorldWind.Color(interiorColor.red, interiorColor.green, interiorColor.blue, interiorColor.alpha);
      } else {
        attributes.drawInterior = false;
      }

      attributes.outlineWidth = geoJSON.properties.strokeWidth || attributes.outlineWidth;

      attributes.outlineStippleFactor = geoJSON.properties.stippleFactor || attributes.outlineStippleFactor;
      attributes.outlineStipplePattern = geoJSON.properties.stipplePattern || attributes.outlineStipplePattern;

      highlightAttributes = new WorldWind.ShapeAttributes();
      if (selectionStyle.lineColor) {
        selectedLineColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
        highlightAttributes.outlineColor = new WorldWind.Color(selectedLineColor.red, selectedLineColor.green, selectedLineColor.blue, selectedLineColor.alpha);
      } else {
        highlightAttributes.outlineColor = WorldWind.Color.YELLOW;
      }
      if (selectionStyle.fillColor) {
        selectedFillColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.fillColor);
        highlightAttributes.interiorColor = new WorldWind.Color(selectedFillColor.red, selectedFillColor.green, selectedFillColor.blue, selectedFillColor.alpha);
      } else {
        highlightAttributes.drawInterior = false;
      }

      polygonPrimitive = new WorldWind.SurfacePolygon(boundaries, attributes);
      polygonPrimitive.altitudeMode = geoJSON.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
      polygonPrimitive.displayName = geoJSON.properties.name;
      polygonPrimitive.highlightAttributes = new WorldWind.ShapeAttributes(highlightAttributes);

      return polygonPrimitive;
    },
    /**
     * @param {object} geoJSON
     * @param {SelectionStyle} selectionStyle
     * @returns {WorldWind.Text}
     */
    constructTextFromGeoJSON: function(geoJSON, selectionStyle) {
      var textPrimitive, attributes, highlightAttributes, selectedColor, position;

      // Create the attributes
      attributes = createTextAttributes(geoJSON);

      // Create the highlight attributes
      highlightAttributes = new WorldWind.TextAttributes(attributes);
      if (selectionStyle.lineColor) {
        selectedColor = EMPWorldWind.utils.hexToRGBA(selectionStyle.lineColor);
        highlightAttributes.color = new WorldWind.Color(selectedColor.red, selectedColor.green, selectedColor.blue, selectedColor.alpha);
      } else {
        highlightAttributes.color = WorldWind.Color.YELLOW;
      }

      // Set the position
      position = new WorldWind.Position(
        geoJSON.geometry.coordinates[1], // Latitude
        geoJSON.geometry.coordinates[0], // Longitude
        geoJSON.geometry.coordinates[2] ? geoJSON.geometry.coordinates[0] : 0); // Altitude

      // Construct the primitive
      textPrimitive = new WorldWind.GeographicText(position, geoJSON.properties.label);

      // Set the attributes
      textPrimitive.attributes = attributes;
      textPrimitive.altitudeMode = geoJSON.properties.altitudeMode || WorldWind.CLAMP_TO_GROUND;
      textPrimitive.highlightAttributes = highlightAttributes;

      return textPrimitive;
    }
  };
}());
