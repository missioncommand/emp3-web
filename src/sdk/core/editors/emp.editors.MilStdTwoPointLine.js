emp.editors = emp.editors || {};

/**
 * Controls the vertices on the map for a MIL-STD-2525 symbol
 * with a two points and is a line.  two point lines are different than
 * two point arrows in that they don't reverse their points.
 *
 * @param {Object} args All parmaters are members of the args object.
 * @param {string} args.feature The feature of the item we are editing.
 * @param {string} args.mapInstanceId The id of the mapInstance to which the
 * editing is occurring.
 */
emp.editors.MilStdTwoPointLine = function(args) {
  emp.editors.MilStdTwoPointArrow.call(this, args);
};


emp.editors.MilStdTwoPointLine.prototype = Object.create(emp.editors.MilStdTwoPointArrow.prototype);
emp.editors.MilStdTwoPointLine.prototype.constructor = emp.editors.MilStdTwoPointLine;

/**
 * Occurs when the map is clicked for the frist time after the draw has started.
 * This will just place a point on the map.
 */
emp.editors.MilStdTwoPointLine.prototype.drawClick = function(pointer) {
  var controlPoint,
    vertex,
    items = [],
    transaction,
    updateData;

  if (this.vertices.vertexLength < 2) {
    // create the feature, don't populate the coordinate, we will populate later
    // create new vertex.
    controlPoint = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [pointer.lon, pointer.lat],
        type: 'Point'
      },
      properties: {
        iconUrl: emp.ui.images.editPoint,
        iconXOffset: 10,
        iconYOffset: 10,
        xUnits: "pixels",
        yUnits: "pixels",
        altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
      }
    });

    vertex = new emp.editors.Vertex(controlPoint, "vertex");
    this.vertices.push(vertex);

    this.featureCopy.data.coordinates = this.vertices.getVerticesAsLineString();

    items.push(this.featureCopy);
    items.push(controlPoint);

    // Add the feature, along with all of its control points.
    transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.FEATURE_ADD,
      mapInstanceId: this.mapInstance.mapInstanceId,
      transactionId: null,
      sender: this.mapInstance.mapInstanceId,
      originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
      source: emp.api.cmapi.SOURCE,
      messageOriginator: this.mapInstance.mapInstanceId,
      originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
      items: items
    });

    transaction.run();

    updateData = this.getUpdateData();
  }

  return updateData;

};
