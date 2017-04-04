(function() {
  "use strict";
  /**
   * Handles the map.get channel messages. The results are returned from core storage.
   * This method handles the following methods
   *
   * - Feature.getChildren
   * - Overlay.getFeatures
   * - Overlay.getOverlays
   * - Overlay.getFeatureById
   * - Overlay.getChildren
   * - Map.getFeatures
   * - Map.getFeatureById
   * - Map.getChildren
   * - Map.getOverlays
   * - Map.getOverlayById
   * - Map.getMapServices
   * - Map.getChildren
   *
   * @ignore
   */
  function HandleMapGetBroker() {
  }

  // Extend emp3.api.ResponseBroker
  HandleMapGetBroker.prototype = Object.create(emp3.api.ResponseBroker.prototype);

  /**
   * Runs the onSuccess callbacks
   * @ignore
   * @param args
   * @param callbacks
   */
  function processSuccessCallbacks(args, callbacks) {
    try {
      callbacks.onSuccess(args);
    } catch (e) {
      console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
    }
  }

  /**
   * Runs the onError callbacks
   * @ignore
   * @param args
   * @param callbacks
   */
  function processErrorCallbacks(args, callbacks) {
    try {
      callbacks.onError(args);
    } catch (e) {
      console.error("onError function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
    }
  }

  /**
   * Converts the overlay hierarchy from a transaction complete to a
   * flat list.
   *
   * @ignore
   * @param  {Array} transactionOverlaySuccess
   * @param {emp3.api.Map} map
   * @returns {emp3.api.Overlay[]}
   */
  function getOverlaysFromTransactionComplete(transactionOverlaySuccess, map) {
    var overlay,
      overlays = [],
      childOverlays,
      i,
      len = transactionOverlaySuccess.length;

    for (i = 0; i < len; i += 1) {
      overlay = new emp3.api.Overlay({
        geoId: transactionOverlaySuccess[i].overlayId,
        name: transactionOverlaySuccess[i].name,
        properties: transactionOverlaySuccess[i].properties
      });

      overlay.visible = transactionOverlaySuccess[i].visible;
      overlay.parentId = transactionOverlaySuccess[i].parentId;

      overlays.push(overlay);

      // If the overlay has been added to a map, assign it now.
      // If the source is a map, it will not have the type field, then just use source.
      // If the source is an overlay, it will have a type field, then use the source.map property.
      // This is a hack but prevents having to pass in additional information just so we can set this property.
      overlay.map = map;

      if (transactionOverlaySuccess[i].children) {
        childOverlays = getOverlaysFromTransactionComplete(transactionOverlaySuccess[i].children, map);
      }
      if (childOverlays !== undefined && childOverlays !== null) {
        overlays = overlays.concat(childOverlays);
        // once the child overlays have been concatenated, clear them out.
        childOverlays = null;
      }
    }
    return overlays;
  }

  /**
   * @inheritDoc
   */
  HandleMapGetBroker.prototype.process = function(callbacks, details) {
    var methodCalled,
      feature,
      service,
      map,
      features = [],
      services = [],
      overlays = [],
      cbArgs = {},
      successes = details.successes,
      i,
      positions;

    if (callbacks.callInfo) {
      methodCalled = callbacks.callInfo.method;

      if (successes.feature) {
        // Check the to see if layers was part of the query, if not
        // we need to filter them out.

        for (i = 0; i < successes.feature.length; i += 1) {
          // if its a layer, it will have a url parameter.  But first,
          // check to make sure we are interested in layer by checking out
          // the useLayers flag.  If it is, we want to create a layer and return
          // it.
          if (successes.feature[i].url) {

            // Based on the format decide what type of layer to return.
            // There will be many more service types, coming.  left it as
            // a switch statement to accommodate future.
            switch (successes.feature[i].type) {
              case "wms":
                service = new emp3.api.WMS({
                  name: successes.feature[i].name,
                  geoId: successes.feature[i].id,
                  description: successes.feature[i].description,
                  url: successes.feature[i].url,
                  version: successes.feature[i].params.version,
                  layers: successes.feature[i].params.layers,
                  tileFormat: successes.feature[i].params.format
                });

                break;
              case "wmts":
                service = new emp3.api.WMTS({
                  name: successes.feature[i].name,
                  geoId: successes.feature[i].id,
                  description: successes.feature[i].description,
                  url: successes.feature[i].url,
                  version: successes.feature[i].params.version,
                  layer: successes.feature[i].params.layer,
                  tileFormat: successes.feature[i].params.format,
                  style: successes.feature[i].params.style,
                  sampleDimensions: successes.feature[i].params.sampleDimensions
                });
                break;
              case "kml":
                service = new emp3.api.KMLLayer({
                  name: successes.feature[i].name,
                  geoId: successes.feature[i].id,
                  description: successes.feature[i].description,
                  url: successes.feature[i].url
                });
            }

            if (service) {
              services.push(service);
            }
          } else {

            // grab the geojson from these coordinates and
            // convert them to GeoPositionGroup for features.
            positions = emp3.api.convertGeoJsonToCMAPIPositions(successes.feature[i].data);

            // based on the featureType, decide which feature to create.
            // This should be refactored to use emp3.api.buildFeature() utility
            // function.
            if (successes.feature[i].properties) {
              switch (successes.feature[i].properties.featureType) {
                case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
                  feature = new emp3.api.AirControlMeasure({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    acmType: successes.feature[i].data.symbolCode,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
                  feature = new emp3.api.Circle({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
                  feature = new emp3.api.Ellipse({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
                  feature = new emp3.api.MilStdSymbol({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    symbolCode: successes.feature[i].data.symbolCode,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
                  feature = new emp3.api.Path({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
                  feature = new emp3.api.Point({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
                  feature = new emp3.api.Polygon({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
                  feature = new emp3.api.Rectangle({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
                  feature = new emp3.api.Square({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
                  feature = new emp3.api.Text({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    positions: positions
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.KML:
                  feature = new emp3.api.KML({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    KMLString: successes.feature[i].data
                  });
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEOJSON:
                  feature = new emp3.api.GeoJSON({
                    geoId: successes.feature[i].featureId,
                    name: successes.feature[i].name,
                    GeoJSONData: JSON.stringify(successes.feature[i].data)
                  });
                  break;
              }

              emp3.api.convertCMAPIPropertiesToFeature(feature, successes.feature[i].properties);
            }

            features.push(feature);
          }
        }
      }

      if (successes.overlay) {
        map = (callbacks.source.type) ? callbacks.source.map : callbacks.source;
        overlays = getOverlaysFromTransactionComplete(successes.overlay, map);
      }

      // The rest of the variables sent back differ from function to
      // function.  Figure out which function was called so we can
      // send back the correct variables.  After we do that
      // we can call the callback function.
      switch (methodCalled) {
        case "Map.getFeatures":
        case "Feature.getChildren":
        case "Feature.getParentFeatures":
        case "Overlay.getFeatures":
          cbArgs.features = features;
          // The call succeeded, call the onSuccess function associated with this.
          processSuccessCallbacks(cbArgs, callbacks);
          break;
        case "global.findOverlay":
          cbArgs.overlay = overlays[0];
          processSuccessCallbacks(cbArgs, callbacks);
          break;
        case "global.findContainer":
          if (features.length > 0) {
            cbArgs.container = features[0];
          } else if (overlays.length > 0) {
            cbArgs.container = overlays[0];
          } else {
            cbArgs.container = undefined;
          }

          if (features.length + overlays.length > 1) {
            console.error("findContainer yielded multiple results with the same ID");
          }

          processSuccessCallbacks(cbArgs, callbacks);
          break;
        case "Feature.getParentOverlays":
        case "Overlay.getParents":
        case "Overlay.getOverlays":
        case "Map.getChildren":
        case "Map.getOverlays":
          cbArgs.overlays = overlays;

          processSuccessCallbacks(cbArgs, callbacks);
          break;
        case "Feature.getParents":
        case "Overlay.getChildren":
          cbArgs.overlays = overlays;
          cbArgs.features = features;

          processSuccessCallbacks(cbArgs, callbacks);
          break;
        case "global.findFeature":
          cbArgs.feature = features[0];
          // The call succeeded, call the onSuccess function associated with this.
          processSuccessCallbacks(cbArgs, callbacks);
          break;
        case "Map.getFeatureById":
        case "Overlay.getFeatureById":
          if (features.length > 0) {
            cbArgs.feature = features[0];
            // The call succeeded, call the onSuccess function associated with this.
            processSuccessCallbacks(cbArgs, callbacks);
          } else {
            cbArgs.errorMessage = "Could not find a feature with the provided id.";
            processErrorCallbacks(cbArgs, callbacks);
          }
          break;
        case "Map.getOverlayById":
          if (overlays.length > 0) {
            cbArgs.overlay = overlays[0];
            // The call succeeded, call the onSuccess function associated with this.
            processSuccessCallbacks(cbArgs, callbacks);
          } else {
            cbArgs.errorMessage = "Could not find a overlay with the provided id.";
            processErrorCallbacks(cbArgs, callbacks);
          }
          break;
        case "Map.getMapServices":
          cbArgs.services = services;
          processSuccessCallbacks(cbArgs, callbacks);
          break;
        default:
          console.error("Originating method " + methodCalled + " was not handled \nstack: handleMapGet");
      }
    }
  };

  //====================================================================================================================
  // Register with the broker factory
  emp3.api.ResponseBrokerFactory.registerBroker(emp3.api.enums.channel.get, new HandleMapGetBroker());
}());
