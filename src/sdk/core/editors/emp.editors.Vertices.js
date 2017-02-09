emp.editors = emp.editors || {};

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
      this.head = vertex;
      vertex.before = null;
    }

    if (this.tail === null) {
      this.tail = vertex;
      vertex.next = null;
    } else {
      vertex.before = this.tail;
      this.tail.next = vertex;
      vertex.next = null;
      this.tail = vertex;

    }

    this.list[vertex.feature.featureId] = vertex;

    this.length++;
  }
};

emp.editors.Vertices.prototype.toString = function() {
  var result = "";
  var current = this.head;

  result = "[";

  while(current !== null) {
    result += current.feature.featureId;
    current = current.next;

    if (current !== null) {
      result += " => ";
    }
  }

  result += "]";

  return result;
};

emp.editors.Vertices.prototype.insert = function(featureId, vertex) {
  var target = this.find(featureId);

  if (target) {
    vertex.before = target.before;
    vertex.next = target;
    target.before.next = vertex;
    target.before = vertex;

    this.list[vertex.feature.featureId] = vertex;

    this.length++;
  }
};

emp.editors.Vertices.prototype.append = function(featureId, vertex) {
  var target = this.find(featureId);

  if (target) {
    vertex.next = target.next;
    vertex.before = target;
    target.next.before = vertex;
    target.next = vertex;

    this.list[vertex.feature.featureId] = vertex;

    this.length++;
  }

};

/**
 * Return the vertex of the specified id.
 */
emp.editors.Vertices.prototype.find = function(featureId) {
  return this.list[featureId];
};

/**
 * Returns the feature of the specified id.
 */
emp.editors.Vertices.prototype.findFeature = function(featureId) {
  return this.list[featureId].feature;
};

/**
 * Returns an array of all the features stored in the vertices.
 */
emp.editors.Vertices.prototype.getFeatures = function() {
  var id,
    vertex,
    result = [];

  for (id in this.list) {
    vertex = this.list[id];
    result.push(vertex.feature);
  }

  return result;
};

/**
 * Return only the vertices of this object as a geojson lineString array.
 */
emp.editors.Vertices.prototype.getVerticesAsLineString = function() {

  var coordinates = [];
  var currentVertex;
  currentVertex = this.head;

  // loop through the coordinates starting at the beginning.
  // only get the coordinates that are a vertex.
  while(currentVertex !== null) {
    if (currentVertex.type === "vertex") {
      coordinates.push(currentVertex.feature.data.coordinates);
    }
    currentVertex = currentVertex.next;
  }

  return coordinates;
};
