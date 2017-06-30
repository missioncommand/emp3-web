/*global LatLon*/
emp.editors = emp.editors || {};

emp.editors.MilStdSectorRangeFan = function(args) {
  this.animation = undefined;
  this.radius = [];
  this.center = undefined;
  this.addRadius = undefined;
  emp.editors.EditorBase.call(this, args);
};

emp.editors.MilStdSectorRangeFan.prototype = Object.create(emp.editors.EditorBase.prototype);
emp.editors.MilStdSectorRangeFan.prototype.constructor = emp.editors.MilStdSectorRangeFan;

/**
 * Adds the control points to the map for an edit or a draw.
 */
emp.editors.MilStdSectorRangeFan.prototype.addControlPoints = function() {

  var controlPoint,
    transaction,
    items = [],
    vertex,
    addAzimuthPointLeft, addAzimuthPointRight,
    azimuthLeftVertex, azimuthRightVertex,
    azimuthLeft, azimuthRight, midRangeAzimuth, midRangePoint,
    latLonAzimuthLeft, latLonAzimuthRight,
    rangeVertex,rangePoint,
    newPoint,
    radiusVertex,
    distance,
    x, y;

  // We have an issue in that GEO_CIRCLE uses GeoJSON Point, and all
  // MIL-STD-2525 symbols use LineString, even though it is a single point.
  // So we store the x/y values so we can use them univerally throughout the
  // function.
  if (this.featureCopy.data.type === 'Point') {
    x = this.featureCopy.data.coordinates[0];
    y = this.featureCopy.data.coordinates[1];
  } else if (this.featureCopy.data.type === 'LineString') {
    x = this.featureCopy.data.coordinates[0][0];
    y = this.featureCopy.data.coordinates[0][1];
  }

  // Create a feature on the map for the center of the circle.
  controlPoint = new emp.typeLibrary.Feature({
    overlayId: "vertices",
    featureId: emp3.api.createGUID(),
    format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
    data: {
      coordinates: [x, y],
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

  // Create a vertex.  This is so the editingManager knows that
  // the center point is a control point and not the radius.
  // The vertices use type vertex to keep the ordering of radius control points.
  // the center and add radius control points are of type add.
  vertex = new emp.editors.Vertex(controlPoint, "add");
  this.vertices.push(vertex);
  this.center = vertex;
  items.push(controlPoint);

  // Create a range and azimuth control points.
  if (this.featureCopy.properties.modifiers.distance && this.featureCopy.properties.modifiers.distance.length > 0) {
    for (var index = 0; index < this.featureCopy.properties.modifiers.distance.length; index++) {
      distance = this.featureCopy.properties.modifiers.distance[index];
      //azimuth is next
      if (index === 0 )
      {
        // get left and right azimuth that will be used to calculate range azimuth of first range control point.
        // first  range (index = 0) and sencond range mid range azimuth are the same values.
        azimuthLeft = (this.featureCopy.properties.modifiers.azimuth[0]) ? this.featureCopy.properties.modifiers.azimuth[0] : -45;
        azimuthRight = (this.featureCopy.properties.modifiers.azimuth[1]) ? this.featureCopy.properties.modifiers.azimuth[1] : -45;
        newPoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
        }, distance, azimuthLeft);

        addAzimuthPointLeft = new emp.typeLibrary.Feature({
          overlayId: "vertices",
          featureId: emp3.api.createGUID(),
          format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
          data: {
            coordinates: [newPoint.x, newPoint.y],
            type: 'Point'
          },
          properties: {
            iconUrl: emp.ui.images.rotationPoint,
            iconXOffset: 10,
            iconYOffset: 10,
            xUnits: "pixels",
            yUnits: "pixels",
            altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
          }
        });

        newPoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
        }, distance, azimuthRight);

        addAzimuthPointRight = new emp.typeLibrary.Feature({
          overlayId: "vertices",
          featureId: emp3.api.createGUID(),
          format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
          data: {
            coordinates: [newPoint.x, newPoint.y],
            type: 'Point'
          },
          properties: {
            iconUrl: emp.ui.images.rotationPoint,
            iconXOffset: 10,
            iconYOffset: 10,
            xUnits: "pixels",
            yUnits: "pixels",
            altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
          }
        });
      }

      else if (index > 0) {
        azimuthLeft = (this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2]) ? this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2] : -45;
        azimuthRight = (this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2 + 1]) ? this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2 + 1] : -45;
        newPoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
        }, distance, azimuthLeft);

        addAzimuthPointLeft = new emp.typeLibrary.Feature({
          overlayId: "vertices",
          featureId: emp3.api.createGUID(),
          format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
          data: {
            coordinates: [newPoint.x, newPoint.y],
            type: 'Point'
          },
          properties: {
            iconUrl: emp.ui.images.rotationPoint,
            iconXOffset: 10,
            iconYOffset: 10,
            xUnits: "pixels",
            yUnits: "pixels",
            altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
          }
        });

        items.push(addAzimuthPointLeft);
        azimuthLeftVertex = new emp.editors.Vertex(addAzimuthPointLeft, "add");
        this.vertices.push(azimuthLeftVertex);

        newPoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
        }, distance, azimuthRight);

        addAzimuthPointRight = new emp.typeLibrary.Feature({
          overlayId: "vertices",
          featureId: emp3.api.createGUID(),
          format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
          data: {
            coordinates: [newPoint.x, newPoint.y],
            type: 'Point'
          },
          properties: {
            iconUrl: emp.ui.images.rotationPoint,
            iconXOffset: 10,
            iconYOffset: 10,
            xUnits: "pixels",
            yUnits: "pixels",
            altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
          }
        });

        items.push(addAzimuthPointRight);
        azimuthRightVertex = new emp.editors.Vertex(addAzimuthPointRight, "add");
        this.vertices.push(azimuthRightVertex);
      }

      //then add range control point
      // first calculate azimuth to locate range control point in between the azimuth control points.
      // get mid range azimuth  between left and right azimuth
      midRangeAzimuth = 0;
      if (addAzimuthPointLeft)
      {
         latLonAzimuthLeft =  new LatLon(addAzimuthPointLeft.data.coordinates[1], addAzimuthPointLeft.data.coordinates[0]);
         latLonAzimuthRight = new LatLon(addAzimuthPointRight.data.coordinates[1], addAzimuthPointRight.data.coordinates[0]);
         midRangePoint = latLonAzimuthLeft.midpointTo(latLonAzimuthRight);
         midRangeAzimuth = emp.geoLibrary.GetAzimuth({x:x,y:y},{x:midRangePoint.lon(),y:midRangePoint.lat()});
      }

      newPoint = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, distance,midRangeAzimuth);

      //add range control point
      rangePoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [newPoint.x, newPoint.y],
          type: 'Point'
        },
        properties: {
          iconUrl: emp.ui.images.radius,
          iconXOffset: 10,
          iconYOffset: 10,
          xUnits: "pixels",
          yUnits: "pixels",
          altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
        }
      });

      items.push(rangePoint);
      rangeVertex = new emp.editors.Vertex(rangePoint, "vertex");
      if (index > 0)
      {
        rangeVertex.azimuth = [];
        rangeVertex.azimuth.push(azimuthLeftVertex);
        rangeVertex.azimuth.push(azimuthRightVertex);
      }
      this.vertices.push(rangeVertex);

    } //for
  }

  //create an add type vertex control point that allows for the adding of new ranges. There a max of 3 circles for
  //this circular range fan.
  // project out the add control point 1.25 of the distance from the last radius to the center, and
  // right above the center point of the circle.
  if (!distance) {
    // no circles present. use a default distance
    distance = 5000;
  }

  if (this.featureCopy.properties.modifiers.distance) {
    newPoint = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, distance + distance * 0.2, 0);
    rangePoint = new emp.typeLibrary.Feature({
      overlayId: "vertices",
      featureId: emp3.api.createGUID(),
      format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
      data: {
        coordinates: [newPoint.x, newPoint.y],
        type: 'Point'
      },
      properties: {
        iconUrl: emp.ui.images.addPoint,
        iconXOffset: 10,
        iconYOffset: 10,
        xUnits: "pixels",
        yUnits: "pixels",
        altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
      }
    });

    items.push(rangePoint);
    radiusVertex = new emp.editors.Vertex(rangePoint, "add");
    radiusVertex.distance = distance;
    this.addRadius = radiusVertex;
    this.vertices.push(radiusVertex);
  }

  // run the transaction and add all the symbols on the map.
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

};

/**
 * Begins the movement of a control point.
 */
emp.editors.MilStdSectorRangeFan.prototype.startMoveControlPoint = function(featureId, pointer) {

  var currentFeature,
    currentVertex,
    items = [],
    distance,
    index,
    coordinateUpdate,
    updateData = {},
    type = emp.typeLibrary.CoordinateUpdateType.UPDATE,
    newCoordinates,
    newPoint, addPoint,
    newRadiusPosition,
    maxRadiusDistance,
    azimuthVertex,
    azimuth, latLonAzimuthLeft, latLonAzimuthRight,
    rangePosition,
    midRangePoint, midAzimuth,
    azimuthPosition,
    newAzimuth,
    azimuthFeature,
    azimuthIndex, vertex,
    o,a,h, delta,
    //  isRadius = false,
    radiusVertex,
    x, y;

  // We have an issue in that GEO_CIRCLE uses GeoJSON Point, and all
  // MIL-STD-2525 symbols use LineString, even though it is a single point.
  // So we store the x/y values so we can use them univerally throughout the
  // function.
  if (this.featureCopy.data.type === 'Point') {
    x = this.featureCopy.data.coordinates[0];
    y = this.featureCopy.data.coordinates[1];
  } else if (this.featureCopy.data.type === 'LineString') {
    x = this.featureCopy.data.coordinates[0][0];
    y = this.featureCopy.data.coordinates[0][1];
  }

  currentVertex = this.vertices.find(featureId);

    // it could be an azimuth control point
    var features = this.vertices.getFeatures();
    for (index = 0; index < features.length; index++ )
    {
       vertex = this.vertices.find(features[index].featureId);
      if (vertex.azimuth && vertex.azimuth.length === 2)
      {
          if (vertex.azimuth[0].feature.featureId ===  featureId )
          {
            azimuthVertex = vertex.azimuth[0];
            currentVertex = vertex;
            azimuthIndex =  0;
            break;
          }
          if (vertex.azimuth[1].feature.featureId ===  featureId )
          {
            azimuthVertex = vertex.azimuth[1];
            currentVertex = vertex;
            azimuthIndex =  1;
            break;
          }
      }
    }

  currentFeature = currentVertex.feature;
  index = this.vertices.getIndex(currentFeature.featureId);

if (azimuthVertex)
{
  azimuth = this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2 + azimuthIndex];
  // moving an azimuth control point
  // currentFeature is the radius control point corresponding to the azimuth moving.
  distance = emp.geoLibrary.measureDistance(currentFeature.data.coordinates[1],
  currentFeature.data.coordinates[0],
    this.center.feature.data.coordinates[1],
    this.center.feature.data.coordinates[0], "meters");

    // the rotation vertex was dragged.
    // get the new azimuth from the center to the current mouse position.  that
    // will determine the new vertex.

    //  asin(o/h) will return the angle in radians of a right sided triangle.
    o = pointer.lat - y;
    a = pointer.lon - x;
    h = Math.sqrt(o*o + a*a);

    // get the angle but convert to radians.
    newAzimuth = (Math.asin(o/h) * 180 / Math.PI);

    if (azimuth > 180) {
      azimuth = azimuth - 360;
    } else if (azimuth < -180) {
      azimuth = azimuth + 360;
    }

    // determine the quadrant to correctly calculate the azimuth.
    if (pointer.lat >= y &&
        pointer.lon >= x) {
      newAzimuth = 90 - newAzimuth;
    } else if (pointer.lat >= y &&
        pointer.lon < x) {
      newAzimuth = -90 + newAzimuth;
    } else if (pointer.lat <= y &&
        pointer.lon <= x) {
      newAzimuth = -90 +  - newAzimuth;
    } else if (pointer.lat < y &&
        pointer.lon > x) {
      newAzimuth = 90 - newAzimuth;
    }

    // compare the old azimuth to the new azimuth and get the delta.   Add the
    // delta to the old azimuth to get your new azimuth.  We need to add 90 because
    // the rotation point is 90 degrees added to azimuth.
    delta = (newAzimuth - azimuth );

    newAzimuth = azimuth + delta;


    azimuthPosition = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, distance, newAzimuth);
    azimuthVertex.feature.data.coordinates = [azimuthPosition.x, azimuthPosition.y];
    items.push(azimuthVertex.feature);
    //update azimuth in modifiers
    index = this.vertices.getIndex(currentFeature.featureId);
    this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2 + azimuthIndex] = newAzimuth;

    // update location of range control point corresponding to dragged azimuth.

     latLonAzimuthLeft =  new LatLon(currentVertex.azimuth[0].feature.data.coordinates[1], currentVertex.azimuth[0].feature.data.coordinates[0]);
     latLonAzimuthRight = new LatLon(currentVertex.azimuth[1].feature.data.coordinates[1], currentVertex.azimuth[1].feature.data.coordinates[0]);
     midRangePoint = latLonAzimuthLeft.midpointTo(latLonAzimuthRight);
     midAzimuth = emp.geoLibrary.GetAzimuth({x:x,y:y},{x:midRangePoint.lon(),y:midRangePoint.lat()});

   newPoint = emp.geoLibrary.geodesic_coordinate({
     x: x,
     y: y
   }, distance,midAzimuth);
   currentVertex.feature.data.coordinates = [newPoint.x, newPoint.y];
   items.push(currentVertex.feature);

   if (index === 1)
   {
      // update mid range azimuth of first range if index == 1
      // // first and second range control points have the same mid range azimuth
     distance = this.featureCopy.properties.modifiers.distance[0];
     newPoint = emp.geoLibrary.geodesic_coordinate({
       x: x,
       y: y
     }, distance,midAzimuth);
     this.vertices.getVertexByIndex(0).feature.data.coordinates = [newPoint.x, newPoint.y];
     items.push( this.vertices.getVertexByIndex(0).feature);
   }

}
  // If the control point being moved is a range  control point,
  // calculate the new range.  Calculate the new position of where
  // we want the control point to be.
else if (featureId !== this.center.feature.featureId) {

    // measure the distance between the mouse location and the center.  This
    // will be the new radius.
    distance = emp.geoLibrary.measureDistance(pointer.lat,
      pointer.lon,
      this.center.feature.data.coordinates[1],
      this.center.feature.data.coordinates[0], "meters");

      midAzimuth = 0;
      if (index > 0 &&  currentVertex.azimuth)
      {
        latLonAzimuthLeft =  new LatLon(currentVertex.azimuth[0].feature.data.coordinates[1], currentVertex.azimuth[0].feature.data.coordinates[0]);
        latLonAzimuthRight = new LatLon(currentVertex.azimuth[1].feature.data.coordinates[1], currentVertex.azimuth[1].feature.data.coordinates[0]);
        midRangePoint = latLonAzimuthLeft.midpointTo(latLonAzimuthRight);
        midAzimuth = emp.geoLibrary.GetAzimuth({x:x,y:y},{x:midRangePoint.lon(),y:midRangePoint.lat()});
      }
      else if (index === 0 && this.vertices.getVertexByIndex(1))
      {
        latLonAzimuthLeft =  new LatLon(this.vertices.getVertexByIndex(1).azimuth[0].feature.data.coordinates[1], this.vertices.getVertexByIndex(1).azimuth[0].feature.data.coordinates[0]);
        latLonAzimuthRight = new LatLon(this.vertices.getVertexByIndex(1).azimuth[1].feature.data.coordinates[1], this.vertices.getVertexByIndex(1).azimuth[1].feature.data.coordinates[0]);
        midRangePoint = latLonAzimuthLeft.midpointTo(latLonAzimuthRight);
        midAzimuth = emp.geoLibrary.GetAzimuth({x:x,y:y},{x:midRangePoint.lon(),y:midRangePoint.lat()});
      }


    // retrieve the new range vertex.
    rangePosition = emp.geoLibrary.geodesic_coordinate({
      x: x,
      y: y
    }, distance, midAzimuth);

    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [rangePosition.x, rangePosition.y];

    if (this.addRadius && this.addRadius.feature.featureId === featureId) {
      // moving the addRadius control point
      this.featureCopy.properties.modifiers.distance.push(distance);
      this.featureCopy.properties.modifiers.azimuth.push(-45);
      this.featureCopy.properties.modifiers.azimuth.push(45);
      this.vertices.promoteVertex(currentVertex.feature.featureId);
      // Change the icon to be that of a vertex.
      currentFeature.properties.iconUrl = emp.ui.images.radius;
      //this.radius.push(currentVertex);
      this.addRadius = undefined;

      //add azimuths
      newPoint = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, distance, -45);

      addPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [newPoint.x, newPoint.y],
          type: 'Point'
        },
        properties: {
          iconUrl: emp.ui.images.rotationPoint,
          iconXOffset: 10,
          iconYOffset: 10,
          xUnits: "pixels",
          yUnits: "pixels",
          altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
        }
      });

      items.push(addPoint);
      azimuthVertex = new emp.editors.Vertex(addPoint, "azimuth");
      this.vertices.push(azimuthVertex);
      currentVertex.azimuth = [];
      currentVertex.azimuth.push(azimuthVertex);

      // add second azimuth
      newPoint = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, distance, 45);

      addPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [newPoint.x, newPoint.y],
          type: 'Point'
        },
        properties: {
          iconUrl: emp.ui.images.rotationPoint,
          iconXOffset: 10,
          iconYOffset: 10,
          xUnits: "pixels",
          yUnits: "pixels",
          altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
        }
      });

      items.push(addPoint);
      azimuthVertex = new emp.editors.Vertex(addPoint, "add");
      this.vertices.push(azimuthVertex);
      currentVertex.azimuth.push(azimuthVertex);
      this.featureCopy.properties.modifiers.distance.max = function() {
        return Math.max.apply(Math, this);
      }; //attach max funct
      maxRadiusDistance = this.featureCopy.properties.modifiers.distance.max();
      if (!maxRadiusDistance) {
        // no circles present. use a default distance
        maxRadiusDistance = 5000;
      }
      newPoint = emp.geoLibrary.geodesic_coordinate({
        x: x,
        y: y
      }, maxRadiusDistance + maxRadiusDistance * 0.2, 0);

      addPoint = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [newPoint.x, newPoint.y],
          type: 'Point'
        },
        properties: {
          iconUrl: emp.ui.images.addPoint,
          iconXOffset: 10,
          iconYOffset: 10,
          xUnits: "pixels",
          yUnits: "pixels",
          altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
        }
      });

      items.push(addPoint);
      radiusVertex = new emp.editors.Vertex(addPoint, "add");
      radiusVertex.distance = maxRadiusDistance;
      this.addRadius = radiusVertex;
      this.vertices.push(radiusVertex);
    } else {
      //moving range control point
      index = this.vertices.getIndex(featureId);
      this.featureCopy.properties.modifiers.distance[index] = distance;
      if (index > 0)
      {
        //update azimuth locations
        azimuthVertex = currentVertex.azimuth[0];
        azimuthFeature = azimuthVertex.feature;
        azimuth = this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2];
        newPoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
        }, distance, azimuth);
        azimuthFeature.data.coordinates = [newPoint.x, newPoint.y];
        items.push(azimuthFeature);

        azimuthVertex = currentVertex.azimuth[1];
        azimuthFeature = azimuthVertex.feature;
        azimuth = this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2 + 1];
        newPoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
        }, distance, azimuth);
        azimuthFeature.data.coordinates = [newPoint.x, newPoint.y];
        items.push(azimuthFeature);
    }
      if (this.addRadius) {
        // update location of add radius control point.
        this.featureCopy.properties.modifiers.distance.max = function() {
          return Math.max.apply(Math, this);
        }; //attach max funct
        maxRadiusDistance = this.featureCopy.properties.modifiers.distance.max();
        if (!maxRadiusDistance) {
          // no circles present. use a default distance
          maxRadiusDistance = 5000;
        }
        //distance =   maxRadiusDistance;
        newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
          x: this.center.feature.data.coordinates[0],
          y: this.center.feature.data.coordinates[1]
        }, maxRadiusDistance + maxRadiusDistance * 0.2, 0);
        this.addRadius.feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];
        items.push(this.addRadius.feature);
      }

    }

  } else {
    // If we are updating the center point, we need to move the center vertex
    // to a new location and we need to update the vertex of the range and azimuth  locations.
    this.featureCopy.data.type = "LineString";
    this.featureCopy.data.coordinates = [
      [pointer.lon, pointer.lat]
    ];


    // First update the control point with new pointer info.
    currentFeature.data.coordinates = [pointer.lon, pointer.lat];

    for (index = 0; index < this.featureCopy.properties.modifiers.distance.length; index++) {
      distance = this.featureCopy.properties.modifiers.distance[index];
      newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
        x: pointer.lon,
        y: pointer.lat
      }, distance, 0);
      vertex = this.vertices.getVertexByIndex(index);
      var feature = vertex.feature;
      feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];
      items.push(feature);
      if (index > 0)
      {
        //update azimuth locations
        azimuthVertex = vertex.azimuth[0];
        azimuthFeature = azimuthVertex.feature;
        azimuth = this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2];
        newPoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
        }, distance, azimuth);
        azimuthFeature.data.coordinates = [newPoint.x, newPoint.y];
        items.push(azimuthFeature);

        azimuthVertex = vertex.azimuth[1];
        azimuthFeature = azimuthVertex.feature;
        azimuth = this.featureCopy.properties.modifiers.azimuth[(index - 1) * 2 + 1];
        newPoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
        }, distance, azimuth);
        azimuthFeature.data.coordinates = [newPoint.x, newPoint.y];
        items.push(azimuthFeature);
    }

    } //for

    if (this.addRadius) {
      // update location of add range control point.
      this.featureCopy.properties.modifiers.distance.max = function() {
        return Math.max.apply(Math, this);
      }; //attach max funct
      maxRadiusDistance = this.featureCopy.properties.modifiers.distance.max();
      if (!maxRadiusDistance) {
        // no circles present. use a default distance
        maxRadiusDistance = 5000;
      }
      distance = maxRadiusDistance;
      newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
        x: pointer.lon,
        y: pointer.lat
      }, distance + distance * 0.2, 0);
      this.addRadius.feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];
      items.push(this.addRadius.feature);
    }
  }

  // make sure the symbol is updated with its new properties.
  items.push(this.featureCopy);

  // Add our updated feature onto the items we will be updating in our
  // transaction.
  items.push(currentFeature);

  var transaction = new emp.typeLibrary.Transaction({
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

  // Now send back the information to the editingManager that will
  // help with generating some events.
  index = this.vertices.getIndex(featureId);
  newCoordinates = [];
  newCoordinates.push({
    lat: y,
    lon: x
  });

  coordinateUpdate = {
    type: type,
    indices: [index],
    coordinates: newCoordinates
  };

  updateData.coordinateUpdate = coordinateUpdate;
  updateData.properties = this.featureCopy.properties;

  return updateData;

};



/**
 * Occurs when a feature on the map is double clicked after the draw has started.
 */
emp.editors.MilStdSectorRangeFan.prototype.drawDoubleClick = function(pointer) {
  var coordinateUpdate,
    updateData,
    items = [],
    updateTransaction,
    distance,
    index,
    newCoordinates, maxRadiusDistance, radiusVertex,latLonAzimuthRight,
    midRangePoint,midAzimuth,
    newRadiusPosition,latLonAzimuthLeft,
    rangePoint,x,y,
    i, currentVertex;

    if (this.featureCopy.data.type === 'Point') {
      x = this.featureCopy.data.coordinates[0];
      y = this.featureCopy.data.coordinates[1];
    } else if (this.featureCopy.data.type === 'LineString') {
      x = this.featureCopy.data.coordinates[0][0];
      y = this.featureCopy.data.coordinates[0][1];
    }

  if (pointer.target.toLowerCase() === "feature" && this.vertices.vertexLength > 1) {
    // check if control point was clicked
    currentVertex = this.vertices.find(pointer.featureId);
    if (currentVertex && currentVertex.type === "vertex") {
      index = this.vertices.getIndex(pointer.featureId);

      if (this.featureCopy.data.type === "Point")
      {
        // the core is somehow updating the range zone as type point. Fix it here
        this.featureCopy.data.type = "LineString";
        this.featureCopy.data.coordinates = [
        [this.featureCopy.data.coordinates[0], this.featureCopy.data.coordinates[1]]
        ];
      }


      //remove distance from modifiers
      this.featureCopy.properties.modifiers.distance.splice(index, 1);
      if (index === 0 && this.vertices.getVertexByIndex(1))
      {
        // removing range with index 0. In this case the next range becomes index 0 and
        // therefore the azimuths must be removed.
        this.featureCopy.properties.modifiers.azimuth.splice(1 , 1);
        this.featureCopy.properties.modifiers.azimuth.splice(0, 1);
        items.push(this.vertices.getVertexByIndex(1).azimuth[0].feature);
        items.push(this.vertices.getVertexByIndex(1).azimuth[1].feature);
        this.vertices.remove(this.vertices.getVertexByIndex(1).azimuth[0].feature.featureId);
        this.vertices.remove(this.vertices.getVertexByIndex(1).azimuth[1].feature.featureId);
        this.vertices.getVertexByIndex(1).azimuth = undefined;
        if (this.vertices.getVertexByIndex(2))
        {
          // next is to update the mid range azimuth of the first range control point by using
          // mid range azimuth of second range control point.
          latLonAzimuthLeft =  new LatLon(this.vertices.getVertexByIndex(2).azimuth[0].feature.data.coordinates[1], this.vertices.getVertexByIndex(2).azimuth[0].feature.data.coordinates[0]);
          latLonAzimuthRight = new LatLon(this.vertices.getVertexByIndex(2).azimuth[1].feature.data.coordinates[1], this.vertices.getVertexByIndex(2).azimuth[1].feature.data.coordinates[0]);
          midRangePoint = latLonAzimuthLeft.midpointTo(latLonAzimuthRight);
          midAzimuth = emp.geoLibrary.GetAzimuth({x:x,y:y},{x:midRangePoint.lon(),y:midRangePoint.lat()});
          distance = this.featureCopy.properties.modifiers.distance[0];
          rangePoint = emp.geoLibrary.geodesic_coordinate({
          x: x,
          y: y
          }, distance,midAzimuth);
          this.vertices.getVertexByIndex(1).feature.data.coordinates = [rangePoint.x, rangePoint.y];
          var transaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.FEATURE_ADD,
            mapInstanceId: this.mapInstance.mapInstanceId,
            transactionId: null,
            sender: this.mapInstance.mapInstanceId,
            originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
            source: emp.api.cmapi.SOURCE,
            messageOriginator: this.mapInstance.mapInstanceId,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
            items: [this.vertices.getVertexByIndex(1).feature]
          });
          transaction.run();
        }
      }
      else if ( index > 0)
      {
        this.featureCopy.properties.modifiers.azimuth.splice((index -1)*2 + 1, 1);
        this.featureCopy.properties.modifiers.azimuth.splice((index -1)*2, 1);
        this.vertices.remove(currentVertex.azimuth[0].feature.featureId);
        this.vertices.remove(currentVertex.azimuth[1].feature.featureId);
        items.push(currentVertex.azimuth[0].feature);
        items.push(currentVertex.azimuth[1].feature);
      }

      items.push(currentVertex.feature);
      this.vertices.remove(currentVertex.feature.featureId);

      var removeTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.FEATURE_REMOVE,
        mapInstanceId: this.mapInstance.mapInstanceId,
        transactionId: null,
        sender: this.mapInstance.mapInstanceId,
        originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
        source: emp.api.cmapi.SOURCE,
        messageOriginator: this.mapInstance.mapInstanceId,
        originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
        items: items
      });

      removeTransaction.run();

      items = [];


      if (!this.addRadius && this.featureCopy.properties.modifiers.distance) {
        // insert  add vertex again
        this.featureCopy.properties.modifiers.distance.max = function() {
          return Math.max.apply(Math, this);
        }; //attach max funct
        maxRadiusDistance = this.featureCopy.properties.modifiers.distance.max();
        if (!maxRadiusDistance) {
          // no circles present. use a default distance
          maxRadiusDistance = 5000;
        }
        var newPoint = emp.geoLibrary.geodesic_coordinate({
          x: this.center.feature.data.coordinates[0],
          y: this.center.feature.data.coordinates[1]
        }, maxRadiusDistance + maxRadiusDistance * 0.2, 0);
        var addPoint = new emp.typeLibrary.Feature({
          overlayId: "vertices",
          featureId: emp3.api.createGUID(),
          format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
          data: {
            coordinates: [newPoint.x, newPoint.y],
            type: 'Point'
          },
          properties: {
            iconUrl: emp.ui.images.addPoint,
            iconXOffset: 10,
            iconYOffset: 10,
            xUnits: "pixels",
            yUnits: "pixels",
            altitudeMode: cmapi.enums.altitudeMode.CLAMP_TO_GROUND
          }
        });

        items.push(addPoint);
        radiusVertex = new emp.editors.Vertex(addPoint, "add");
        radiusVertex.distance = maxRadiusDistance;
        this.addRadius = radiusVertex;
        this.vertices.push(radiusVertex);
      } else if (this.addRadius) {
        //reposition add control point
        this.featureCopy.properties.modifiers.distance.max = function() {
          return Math.max.apply(Math, this);
        }; //attach max funct
        maxRadiusDistance = this.featureCopy.properties.modifiers.distance.max();
        if (!maxRadiusDistance) {
          // no circles present. use a default distance
          maxRadiusDistance = 5000;
        }
        //distance =   maxRadiusDistance;
        newRadiusPosition = emp.geoLibrary.geodesic_coordinate({
          x: this.center.feature.data.coordinates[0],
          y: this.center.feature.data.coordinates[1]
        }, maxRadiusDistance + maxRadiusDistance * 0.2, 0);
        this.addRadius.feature.data.coordinates = [newRadiusPosition.x, newRadiusPosition.y];
        items.push(this.addRadius.feature);
      }

      items.push(this.featureCopy);

      updateTransaction = new emp.typeLibrary.Transaction({
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

      updateTransaction.run();


      // return updateData
      // Create the return object.  This will tell you which index was added,
      // the locations of the new indices, and the type of change it was.
      //
      // The coordinates will be formatted slightly different it is a GEO_MIL_SYMBOL.
      // We need to first account for that.
      newCoordinates = [];

      // if (this.featureCopy.data.type === "Point")
      // {
      //   // the core is somehow updating the range zone as type point. Fix it here
      //   this.featureCopy.data.type = "LineString";
      //   this.featureCopy.data.coordinates = [
      //   [this.featureCopy.data.coordinates[0], this.featureCopy.data.coordinates[1]]
      //   ];
      // }



      for (i = 0; i < this.featureCopy.data.coordinates.length; i++) {
        newCoordinates.push({
          lat: this.featureCopy.data.coordinates[i][1],
          lon: this.featureCopy.data.coordinates[i][0]
        });
      }


      //index = this.vertices.vertexLength - 1;

      coordinateUpdate = {
        type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
        indices: [index], //currentVertexIndex is the vertex that was removed
        coordinates: newCoordinates
      };

      updateData = {};
      updateData.coordinateUpdate = coordinateUpdate;
      updateData.properties = this.featureCopy.properties;

    } //   if (currentVertex && currentVertex.type === "vertex")
  } // if (pointer.target.toLowerCase() === "feature" && this.vertices.vertexLength > 3) {


  return updateData;
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.MilStdSectorRangeFan.prototype.moveControlPoint = function(featureId, pointer) {
  // startMoveControlPoint does everything we need to do.
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves control point passed in to the new location provided.
 * Also updates the control point and the feature with the change.
 */
emp.editors.MilStdSectorRangeFan.prototype.endMoveControlPoint = function(featureId, pointer) {
  // startMoveControlPoint does everything we need to do.
  return this.startMoveControlPoint(featureId, pointer);
};

/**
 * Moves the entire feature, offsetting from the starting position.
 */
emp.editors.MilStdSectorRangeFan.prototype.moveFeature = function() {
  // do not do anything here.  We do not want to let users move the feature.
};

/**
 * Removes control points added by the addControlPoints method from
 * the map.  This usually occurs at the end of and edit in response
 * to a cancel or a complete.
 */
emp.editors.MilStdSectorRangeFan.prototype.removeControlPoints = function() {
  // do nothing
  var transaction,
  index,
   items =[];
  var features = this.vertices.getFeatures();
  for (index = 0; index < features.length; index++ )
  {
    var vertex = this.vertices.find(features[index].featureId);
    if (vertex.azimuth && vertex.azimuth.length === 2)
    {
        items.push(vertex.azimuth[0].feature);
        items.push(vertex.azimuth[1].feature);
    }
    items.push(features[index]);
  }

  transaction = new emp.typeLibrary.Transaction({
    intent: emp.intents.control.FEATURE_REMOVE,
    mapInstanceId: this.mapInstance.mapInstanceId,
    transactionId: null,
    sender: this.mapInstance.mapInstanceId,
    originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
    source: emp.api.cmapi.SOURCE,
    messageOriginator: this.mapInstance.mapInstanceId,
    originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
    items: items
  });

  this.vertices.clear();

  // Hide the control points
  transaction.run();
};
