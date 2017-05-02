var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.editors = EMPWorldWind.editors || {};

/**
 * @classdesc The EditorController handles all drawing, editing, and updating of features
 * @class
 */
EMPWorldWind.editors.EditorController = (function() {

  /**
   * Async function
   * @param {emp.typeLibrary.Feature} feature
   * @param {PlotFeatureCB} callback
   * @this EMPWorldWind.Map
   */
  function asyncPlotKMLFeature(feature, callback) {
    var url, kmlFilePromise, kmlLayer, wwFeature,
      rc = {
        success: false
      };

    // Convert the kml string to a data url
    url = "data:text/xml," + encodeURIComponent(feature.data);

    // Build the KML file promise
    kmlFilePromise = new WorldWind.KmlFile(url);
    kmlFilePromise
      .then(function(kmlFile) {
        // Construct the KML layer to hold the document
        kmlLayer = new WorldWind.RenderableLayer(feature.coreId);

        // Add the KML layer to the map
        kmlLayer.addRenderable(kmlFile);
        this.worldWindow.addLayer(kmlLayer);

        // Use the standard data holder to keep track of the layer
        wwFeature = new EMPWorldWind.data.EmpFeature(feature);
        wwFeature.addShapes(kmlLayer); // This isn't a WW primitive but use it as if it was

        // Record the layer so we can remove/modify it later
        this.layers[feature.coreId] = kmlLayer;

        // Configure the callback args
        rc.success = true;
        rc.feature = wwFeature;

        // Fire the callback
        callback(rc);
      }.bind(this));
  }

  return {
    /**
     * Creates a new EMPWorldWind feature and associated WorldWind features from an EMP feature and adds it to the map
     *
     * @param {emp.typeLibrary.Feature} empFeature
     * @param {PlotFeatureCB} callback Callback to be invoked on completion
     * @this EMPWorldWind.Map
     */
    plotFeature: function(empFeature, callback) {
      var wwFeature, primitiveBuilder, shapes,
        rc = {
          message: "",
          success: true,
          feature: undefined
        };

      if (empFeature.format === emp3.api.enums.FeatureTypeEnum.KML) {
        // KML is not supported as native primitives in WorldWind
        // TODO KML selection, not sure how to support it or represent it
        return asyncPlotKMLFeature.call(this, empFeature, callback);
      } else {
        primitiveBuilder = EMPWorldWind.editors.primitiveBuilders.getPrimitiveBuilderForFeature(empFeature);

        if (!primitiveBuilder) {
          rc.success = false;
          rc.message = "Missing feature constructor for format: " + empFeature.format;

          return callback(rc);
        }
      }

      // Construct the feature
      wwFeature = new EMPWorldWind.data.EmpFeature(empFeature);
      wwFeature.singlePointAltitudeRangeMode = EMPWorldWind.utils.getSinglePointAltitudeRangeMode(this.worldWindow.navigator.range, this.singlePointAltitudeRanges);
      empFeature.singlePointAltitudeRangeMode = wwFeature.singlePointAltitudeRangeMode;
      empFeature.range = this.worldWindow.navigator.range;

      // Build the primitives
      // next call is  asynchronous for the case of mil std multi-points so shapes is initially an empty array. (SEC renderer worker)
      shapes = primitiveBuilder.call(this, empFeature, this.state.selectionStyle);

      // Store the native primitives
      wwFeature.addShapes(shapes);

      // Configure the callback
      rc.feature = wwFeature;

      // Fire the callback
      return callback(rc);
    },
    /**
     * Updates a WorldWind Renderable object on the map and returns the updated objects in the response
     * @param {EMPWorldWind.data.EmpFeature} wwFeature
     * @param {emp.typeLibrary.Feature} empFeature
     * @param {PlotFeatureCB} callback
     * @this EMPWorldWind.Map
     */
    updateFeature: function(wwFeature, empFeature, callback) {
      var primitiveBuilder,
        rc = {
          success: true,
          message: "",
          feature: wwFeature
        };

      var _handleMilStdUpdate = function() {

        var builder;
        var _symbolIsSame = function(oldSym, newSym) {
          return (oldSym.symbolCode === newSym.symbolCode &&
            JSON.stringify(oldSym.modifiers) === JSON.stringify(newSym.modifiers));
        };

        if (empFeature.data.type === "Point") {



          if (_symbolIsSame(empFeature, wwFeature.feature) && !empFeature.bCallRenderer) {
            // Just move it
            wwFeature.shapes[0].position = new WorldWind.Position(
              empFeature.data.coordinates[1],
              empFeature.data.coordinates[0],
              empFeature.data.coordinates[2] || 0);
            wwFeature.feature = empFeature;
          } else {
            // Re-render and replace it
            builder = EMPWorldWind.editors.primitiveBuilders.getPrimitiveBuilderForFeature(empFeature);
            this.rootLayer.removeFeature(wwFeature);
            wwFeature.clearShapes();
            wwFeature.addShapes(builder.call(this, empFeature, this.state.selectionStyle));
            this.rootLayer.addFeature(wwFeature);
            wwFeature.feature = empFeature;
            wwFeature.bCallRenderer = false;
            empFeature.bCallRenderer = false;
          }
        } else if (empFeature.data.type === "LineString") {
          // update with latest emp feature
          wwFeature.feature = empFeature;
          builder = EMPWorldWind.editors.primitiveBuilders.getPrimitiveBuilderForFeature(empFeature);
          builder.call(this, empFeature); // Pass it off to the web-worker
        } else {
          // TODO Fail gracefully
        }
      };

      var _handlePointUpdate = function() {

        var builder;

        if (empFeature.overlayId === "vertices") {
          // Just move it. It is a control point
          wwFeature.shapes[0].position = new WorldWind.Position(
            empFeature.data.coordinates[1],
            empFeature.data.coordinates[0],
            empFeature.data.coordinates[2] || 0);
          wwFeature.feature = empFeature;
        } else {
          builder = EMPWorldWind.editors.primitiveBuilders.getPrimitiveBuilderForFeature(empFeature);
          this.rootLayer.removeFeature(wwFeature);
          wwFeature.clearShapes();
          wwFeature.addShapes(builder.call(this, empFeature, this.state.selectionStyle));
          this.rootLayer.addFeature(wwFeature);
          wwFeature.feature = empFeature;
        }
      };


      if (empFeature.format === emp3.api.enums.FeatureTypeEnum.KML) {
        // Handle KML
        this.worldWindow.removeLayer(this.layers[empFeature.coreId]);
      } else if (empFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
        _handleMilStdUpdate.call(this);
      } else if (empFeature.format === emp3.api.enums.FeatureTypeEnum.GEO_POINT) {
        _handlePointUpdate.call(this);
      } else {
        primitiveBuilder = EMPWorldWind.editors.primitiveBuilders.getPrimitiveBuilderForFeature(empFeature);
        if (!primitiveBuilder) {
          rc.success = false;
          rc.message = "Missing feature constructor for format: " + empFeature.format;
          return callback(rc);
        }
      }

      empFeature.singlePointAltitudeRangeMode = wwFeature.singlePointAltitudeRangeMode;

      return callback(rc);

      //
      // // Remove existing primitives from the map
      // if (empFeature.format !== emp3.api.enums.FeatureTypeEnum.KML) {
      //   empFeature.singlePointAltitudeRangeMode = wwFeature.singlePointAltitudeRangeMode;
      // } else {
      //   // Handle KML
      //   this.worldWindow.removeLayer(this.layers[empFeature.coreId]);
      // }
      //
      // // Clear the primitives from the feature
      // wwFeature.clearShapes();
      //
      // switch (empFeature.format) {
      //   case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
      //     wwFeature.singlePointAltitudeRangeMode = EMPWorldWind.utils.getSinglePointAltitudeRangeMode(this.worldWindow.navigator.range, this.singlePointAltitudeRanges);
      //     empFeature.singlePointAltitudeRangeMode = wwFeature.singlePointAltitudeRangeMode;
      //     wwFeature.addShapes(constructMilStdSymbol.call(this, empFeature, this.state.selectionStyle));
      //     break;
      //   case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
      //     wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructAirControlMeasure(empFeature, this.state.labelStyles));
      //     break;
      //   case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
      //     wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfaceCircle(empFeature, this.state.labelStyles));
      //     break;
      //   case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
      //     wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfaceEllipse(empFeature, this.state.labelStyles));
      //     break;
      //   case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
      //     wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfacePolyline(empFeature, this.state.labelStyles));
      //     break;
      //   case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
      //     wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructPlacemark.call(this, empFeature, this.state.labelStyles));
      //     break;
      //   case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
      //     wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfacePolygon(empFeature, this.state.labelStyles));
      //     break;
      //   case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
      //   case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
      //     wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructSurfaceRectangle(empFeature, this.state.labelStyles));
      //     break;
      //   case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
      //     wwFeature.addShapes(EMPWorldWind.editors.primitiveBuilders.constructText(empFeature, this.state.labelStyles));
      //     break;
      //   case emp3.api.enums.FeatureTypeEnum.KML:
      //     // KML is not supported as native primitives in WorldWind
      //     return asyncPlotKMLFeature.call(this, empFeature, callback);
      //   default:
      //     rc.success = false;
      //     rc.message = "Missing feature constructor for format: " + empFeature.format;
      // }
      //
      // // Redraw the new shapes
      // if (rc.success) {
      //   // tag empFeature with current range.
      //   empFeature.range = this.worldWindow.navigator.range;
      //   // Update the empFeature stored in the wwFeature
      //   wwFeature.feature = empFeature;
      //   wwFeature.selected = this.isFeatureSelected(wwFeature.id);
      //
      //   // Update the layer
      //   layer.addFeature(wwFeature);
      //
      //   // Setup the return
      //   rc.feature = wwFeature;
      // }
      // callback(rc);
    },
    /**
     *
     * @param {EMPWorldWind.data.EmpFeature} wwFeature
     * @this EMPWorldWind.Map
     */
    updateFeatureLabelStyle: function(wwFeature) {
      var shapes, builder;

      switch (wwFeature.feature.format) {
        case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
          this.rootLayer.removeFeature(wwFeature);
          wwFeature.clearShapes();

          builder = EMPWorldWind.editors.primitiveBuilders.getPrimitiveBuilderForFeature(wwFeature.feature);

          shapes = builder.call(this, wwFeature.feature, this.state.selectionStyle);
          wwFeature.addShapes(shapes);
          this.rootLayer.addFeature(wwFeature);
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
    },
    /**
     * @param {emp.typeLibrary.Feature[]} features
     */
    redrawMilStdSymbols: function(features) {
      window.console.debug('updating', features);
      EMPWorldWind.editors.primitiveBuilders.constructMultiPointMilStdFeatures.call(this, features);
    }
  };
}());
