emp.editors = {} || emp.editors;

/**
 * Controls the vertices on the map during an edit or draw and the animation
 * of those graphics.
 *
 * @param {Object} args All parmaters are members of the args object.
 * @param {string} args.featureId The featureId of the item we are editing.
 * @param {string} args.mapInstanceId The id of the mapInstance to which the
 * editing is occurring.
 */
emp.editors.EditorBase = function(args) {

  var featureCopy,
    mapInstance,
    controlPoints = [];

  // Retrieve this feature from storage and make a copy of it in case a
  // cancel is issued.
  featureCopy = emp.storage.findFeature(null, args.featureId);

  // Retrieve the mapInstance used for this feature.
  mapInstance = emp.instanceManager.getInstance(args.mapInstanceId);

  var publicInterface = {
    /**
     * Adds the control points to the map for an edit or a draw.
     */
    addControlPoints: function() {
      var i,
        controlPoint,
        transaction,
        length,
        coordinates;

      // normalize the geojson coordinates so we only have
      // to write one for loop.
      if (featureCopy.options.data.type === 'LineString') {
        length = featureCopy.options.data.coordinates.length;
        coordinates = featureCopy.options.data.coordinates;
      } else if (featureCopy.options.data.type === 'Polygon') {
        length = featureCopy.options.data.coordinates[0].length;
        coordinates = featureCopy.options.data.coordinates[0];
      } else if (featureCopy.options.data.type === 'Point') {
        length = 1;
        coordinates = [featureCopy.options.data.coordinates];
      }

      // default implementation: add a control point at every vertex.
      for (i = 0; i < length; i++) {
        // create a feature for each of these coordinates.
        controlPoint = new emp.typeLibrary.Feature({
            overlayId: "vertices",
            featureId: emp3.api.createGUID(),
            format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
            data: {
              coordinates: coordinates[i],
              type: 'Point'
            }
        });

        controlPoints.push(controlPoint);
      }

      transaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.FEATURE_ADD,
          mapInstanceId: mapInstance.mapInstanceId,
          transactionId: null,
          sender: mapInstance.mapInstanceId,
          originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
          source: emp.api.cmapi.SOURCE,
          messageOriginator: mapInstance.mapInstanceId,
          originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
          items: controlPoints
      });

      transaction.queue();

    },

    removeControlPoints: function() {
      var transaction;

      transaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.CMAPI_GENERIC_FEATURE_REMOVE,
          mapInstanceId: mapInstance.mapInstanceId,
          transactionId: null,
          sender: mapInstance.mapInstanceId,
          originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
          source: emp.api.cmapi.SOURCE,
          messageOriginator: mapInstance.mapInstanceId,
          originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
          items: controlPoints
      });

      transaction.queue();

    }
  };

  return publicInterface;
};
