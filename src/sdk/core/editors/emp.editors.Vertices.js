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
    }
    else {
      vertex.before = this.tail;
      this.tail.next = vertex;
      vertex.next = null;
      this.tail = vertex;

    }

    this.list[vertex.feature.featureId] = vertex;

    this.length++;
  }
};

/**
 * Displays a string representation of this linked list.
 */
emp.editors.Vertices.prototype.toString = function() {
  var result = "";
  var current = this.head;

  result = "[";

  while (current !== null) {
    result += current.feature.featureId + " (" + current.type + ")";
    current = current.next;

    if (current !== null) {
      result += " => ";
    }
  }

  result += "]";

  return result;
};

/**
 * Inserts a vertex before the specified feature.
 */
emp.editors.Vertices.prototype.insert = function(featureId, vertex) {
  var target = this.find(featureId);

  // make sure target is found, if not ignore.
  if (target) {

    // set the new vertex's pointers.
    vertex.before = target.before;
    vertex.next = target;

    // If we are at the head, don't bother setting the item previous to
    // the target's next property.  It will be null.
    if (target.before === null) {
      target.before = vertex;

      // we are at the head so the new head is the new item
      // we are passing in.
      this.head = vertex;
    } else {
      target.before.next = vertex;
      target.before = vertex;
    }

    this.list[vertex.feature.featureId] = vertex;

    this.length++;
  }
};

/**
 * Appends a vertex after the specified feature.
 */
emp.editors.Vertices.prototype.append = function(featureId, vertex) {
  var target = this.find(featureId);

  // make sure target is found, if not ignore.
  if (target) {
    vertex.next = target.next;
    vertex.before = target;

    if (target.next === null) {
      target.next = vertex;
      this.tail = vertex;
    } else {
      target.next.before = vertex;
      target.next = vertex;
    }

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
  while (currentVertex !== null) {
    if (currentVertex.type === "vertex") {
      coordinates.push(currentVertex.feature.data.coordinates);
    }
    currentVertex = currentVertex.next;
  }

  return coordinates;
};

/**
 * Return only the vertices of this object as a geojson polygon array.
 */
emp.editors.Vertices.prototype.getVerticesAsPolygon = function() {
  var coordinates = [];
  var currentVertex;
  currentVertex = this.head;

  // loop through the coordinates starting at the beginning.
  // only get the coordinates that are a vertex.
  while (currentVertex !== null) {
    if (currentVertex.type === "vertex") {
      coordinates.push(currentVertex.feature.data.coordinates);
    }
    currentVertex = currentVertex.next;
  }

  return [coordinates];
};

/**
 * Removes all the control points out of vertices.
 */
emp.editors.Vertices.prototype.clear = function() {
  this.head = null;
  this.tail = null;
  this.list = [];
  this.length = 0;
};

/**
 * Returns the index of a vertex.  This does not find the index
 * of an "add" point.
 */
emp.editors.Vertices.prototype.getIndex = function(featureId) {
  var index = 0,
    currentVertex = this.head;


  // loop through the coordinates starting at the beginning.
  // only get the coordinates that are a vertex.

  while (currentVertex.feature.featureId !== featureId && currentVertex !== null) {
    currentVertex = currentVertex.next;

    if (currentVertex.type === "vertex") {
      index++;
    }
  }

  if (currentVertex === null) {
    index = -1;
  }

  return index;
};
