emp.editors = emp.editors || {};

/**
 * Represents a point that can be manipulated by the user when the map is
 * in edit mode.
 *
 * @param {emp.typeLibrary.Feature} feature The feature this item Represents
 * @param {String} "add" or "vertex"  Determines if this is an add point or vertex.
 */
emp.editors.Vertex = function(feature, type) {

  if (!feature) {
    throw new Error("Missing parameter: feature");
  }

  if (!type) {
    throw new Error("Missing parameter: type");
  }
  
  this.feature = feature;
  this.type = type;
  this.next = null; // This is used by Vertices to determine the next vertex in the list.
  this.before = null;  // This is used by Vertices to determine th previous item in the list.
};
