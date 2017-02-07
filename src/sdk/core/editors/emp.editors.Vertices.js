/*global LatLon*/

/**
 * Keeps track of the control points of an edit graphic while in
 * edit
 */
emp.editors.Vertices = function() {
  this.head = null;
  this.tail = null;
  this.list = [];
  this.length = 0;
};

/**
 * Adds a vertex to the end of the list.
 *
 * @param {emp.editors.Vertex} vertex - The point that is being added to end of
 * the list.
 */
emp.editors.Vertices.prototype.push = function(vertex) {

  // Make sure we have the appropriate data available.
  if (vertex.feature && vertex.type) {

    if (this.head === null) {
      this.head === vertex;
      vertex.before = null;
    }

    if (this.tail === null) {
      this.tail === vertex;
      vertex.next = null;
    } else {
      this.tail.next = vertex;
      vertex.next = null;
    }

    this.list[vertex.feature.featureId] = vertex;

    this.length++;
  }
};

/**
 * Changes the vertex passed in to a new vertex, and creates
 * two new add points.  The vertex passed in must be an add point,
 * That vertex will turn into a vertex, and two new add points will get
 * created in front and back of that vertex.
 *
 * @return [emp.typeLibrary.Feature] returns back two new points
 */
emp3.editors.Vertices.prototype.add = function(featureId) {
  var vertex = this.find(featureId);
  var front;
  var back;
  var frontFeature;
  var backFeature;
  var newFrontFeature;
  var newBackFeature;
  var currentFeature;
  var result = [];
  var pt1, pt2, pt3, midpoint;

  if (vertex) {
    if (vertex.type === 'add') {
      vertex.type = 'vertex';

      currentFeature = vertex.feature;

      // get the midpoint between current point and previous point.
      backFeature = vertex.before.feature;

      pt1 = new LatLon(backFeature.data.coordinates[0][1], backFeature.data.coordinates[0][0]);
      pt2 = new LatLon(currentFeature.data.coordinates[0][1], currentFeature.data.coordinates[0][0]);

      // Get the mid point between this vertex and the next vertex.
      pt3 = pt1.midpointTo(pt2);
      midpoint = [pt3.lon(), pt3.lat()];

      newBackFeature = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint,
          type: 'Point'
        },
        properties: {
          iconUrl: "http://localhost:3000/src/sdk/assets/images/orangeHandle16.png"
        }
      });

      // get the midpoint between current point and next point.
      frontFeature = vertex.next.feature;

      pt1 = new LatLon(currentFeature.data.coordinates[0][1], currentFeature.data.coordinates[0][0]);
      pt2 = new LatLon(frontFeature.data.coordinates[0][1], frontFeature.data.coordinates[0][0]);

      // Get the mid point between this vertex and the next vertex.
      pt3 = pt1.midpointTo(pt2);
      midpoint = [pt3.lon(), pt3.lat()];

      newFrontFeature = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: emp3.api.createGUID(),
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: midpoint,
          type: 'Point'
        },
        properties: {
          iconUrl: "http://localhost:3000/src/sdk/assets/images/orangeHandle16.png"
        }
      });

      // update vertices with new items.
      front = new emp.editors.Vertex(newFrontFeature, "add");
      front.next = vertex.next;
      vertex.next = front;

      back = new emp.editors.Vertex(newBackFeature, "add");
      back.before = vertex.before;
      vertex.before = back;

      currentFeature.properties.iconUrl = "http://localhost:3000/src/sdk/assets/images/blueHandle32.png";

      result = [newBackFeature, newFrontFeature, currentFeature];
    }
  }

  return result;
};

/**
 * Return the vertex of the specified id.
 */
emp.editors.Vertices.prototype.find = function(featureId) {
  return this.list[featureId];
};
