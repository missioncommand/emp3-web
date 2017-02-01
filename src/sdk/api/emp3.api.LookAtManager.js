if (!window.emp3) {
  window.emp3 = {};
}
if (!window.emp3.api) {
  window.emp3.api = {};
}

/**
 * The lookAt manager stores the lookAt for maps externally from the core storage
 * The instance of the API manages the lookAts as they are not shared with other clients
 * @ignore
 */
emp3.api.LookAtManager = (function () {
  var INVALID_LOOKAT_TYPE_ERROR = 'Invalid argument: expected lookAt to be emp3.api.LookAt or geoId string';
  var INVALID_MAP_TYPE_ERROR = 'Invalid argument: expected map to be emp3.api.Map or geoId string';

  /**
   * Map to Current lookAt associations
   * one to one relationship
   * {mapId: lookAt}
   */
  var _mapToLookAt = {};

  function init() {
    _mapToLookAt = {};
  }

  /**
   * Stores the lookAt for a map.
   *
   * @throws Will throw an error if arguments are missing
   * @throws Will throw an error if the lookAt is not {emp3.api.lookAt}
   *
   * @param {object} args
   * @param {emp3.api.LookAt} args.lookAt The lookAt
   * @param {emp3.api.Map | string} args.map The map or geoId of the map
   */
  function setLookAtForMap(args) {
    args = args || {};

    if (!args.lookAt) {
      throw new Error('Missing argument: lookAt');
    } else if (!(args.lookAt instanceof emp3.api.LookAt)) {
      throw new TypeError('Invalid argument: lookAt is not of type emp3.api.LookAt');
    }

    if (!args.map) {
      throw new Error('Missing argument: map');
    }

    var mapId;
    if (typeof args.map === 'string') {
      mapId = args.map;
    } else if (args.map instanceof emp3.api.Map) {
      mapId = args.map.geoId;
    } else {
      throw new TypeError(INVALID_MAP_TYPE_ERROR);
    }

    _mapToLookAt[mapId] = args.lookAt;
  }

  /**
   * Retrieves the current lookAt for a map
   *
   * @throws Will throw an error if arguments are missing
   * @throws Will throw an error if the map is not {emp3.api.Map | string}
   *
   * @param {object} args
   * @param {emp3.api.Map | string} args.map A map object or the geoId of the map
   * @returns {emp3.api.LookAt}
   */
  function getLookAtForMap(args) {
    args = args || {};

    if (!args.map) {
      throw new Error('Missing argument: map');
    }
    var mapId;
    if (typeof args.map === 'string') {
      mapId = args.map;
    } else if (args.map instanceof emp3.api.Map) {
      mapId = args.map.geoId;
    } else {
      throw new TypeError(INVALID_MAP_TYPE_ERROR);
    }

    return _mapToLookAt[mapId];
  }

  /**
   * Retrieves any maps associated with a lookAt
   *
   * @throws Will throw an error if arguments are missing
   * @throws Will throw an error if the lookAt is not {string | emp3.api.lookAt}
   *
   * @param {object} args
   * @param {string|emp3.api.LookAt} args.lookAt The lookAt or the lookAt's geoId
   * @returns {string[]} The associated maps geoIds associated with the lookAt
   */
  function getMapsForLookAt(args) {
    args = args || {};

    if (!args.lookAt) {
      throw new Error('Missing argument: lookAt');
    }

    var lookAtId;
    if (typeof args.lookAt === 'string') {
      lookAtId = args.lookAt;
    } else if (args.lookAt instanceof emp3.api.LookAt) {
      lookAtId = args.lookAt.geoId;
    } else {
      throw new TypeError(INVALID_LOOKAT_TYPE_ERROR);
    }

    var maps = [];
    for (var map in _mapToLookAt) {
      if (_mapToLookAt[map].geoId === lookAtId) {
        maps.push(map);
      }
    }
    return maps;
  }

  /**
   * Removes a map-to-lookAt association
   *
   * @throws Error if no args are set
   * @throws Error if the map is not of type {string|emp3.api.Map}
   *
   * @param {object} args
   * @param {emp3.api.Map | string} args.map
   */
  function removeLookAtForMap(args) {
    args = args || {};

    if (!args.map) {
      throw new Error('Missing argument: map');
    }
    var mapId;
    if (typeof args.map === 'string') {
      mapId = args.map;
    } else if (args.map instanceof emp3.api.Map) {
      mapId = args.map.geoId;
    } else {
      throw new TypeError(INVALID_MAP_TYPE_ERROR);
    }

    delete _mapToLookAt[mapId];
  }

  // ===========================================================================
  // Public Interface
  // ===========================================================================
  return {
    init: init,
    setLookAtForMap: setLookAtForMap,
    getLookAtForMap: getLookAtForMap,
    getMapsForLookAt: getMapsForLookAt,
    removeLookAtForMap: removeLookAtForMap
  };
})();
