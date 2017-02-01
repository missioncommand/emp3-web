if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * The camera manager stores the camera for maps externally from the core storage
 * The instance of the API manages the cameras as they are not shared with other clients
 * @ignore
 */
emp3.api.CameraManager = (function () {
  var INVALID_CAMERA_TYPE_ERROR = 'Invalid argument: expected camera to be emp3.api.Camera or geoId string';
  var INVALID_MAP_TYPE_ERROR = 'Invalid argument: expected map to be emp3.api.Map or geoId string';

  /**
   * Map to Current Camera associations
   * one to one relationship
   * {mapId: camera}
   */
  var _mapToCamera = {};

  function init() {
    _mapToCamera = {};
  }

  /**
   * Stores the camera for a map.
   *
   * @throws Will throw an error if arguments are missing
   * @throws Will throw an error if the camera is not of type {@link emp3.api.Camera}
   *
   * @param {object} args
   * @param {emp3.api.Camera} args.camera The Camera
   * @param {emp3.api.Map | string} args.map The map or geoId of the map
   */
  function setCameraForMap(args) {
    args = args || {};

    if (!args.camera) {
      throw new Error('Missing argument: camera');
    } else if (!(args.camera instanceof emp3.api.Camera)) {
      throw new TypeError('Invalid argument: camera is not of type emp3.api.Camera');
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

    _mapToCamera[mapId] = args.camera;
  }

  /**
   * Retrieves the current camera for a map
   *
   * @throws Will throw an error if arguments are missing
   * @throws Will throw an error if the map is not {emp3.api.Map | string}
   *
   * @param {object} args
   * @param {emp3.api.Map | string} args.map A map object or the geoId of the map
   * @returns {emp3.api.Camera}
   */
  function getCameraForMap(args) {
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

    return _mapToCamera[mapId];
  }

  /**
   * Retrieves any maps associated with a camera
   *
   * @throws Will throw an error if arguments are missing
   * @throws Will throw an error if the camera is not {string | emp3.api.Camera}
   *
   * @param {object} args
   * @param {string|emp3.api.Camera} args.camera The camera or the camera's geoId
   * @returns {string[]} The associated maps geoIds associated with the camera
   */
  function getMapsForCamera(args) {
    args = args || {};

    if (!args.camera) {
      throw new Error('Missing argument: camera');
    }

    var cameraId;
    if (typeof args.camera === 'string') {
      cameraId = args.camera;
    } else if (args.camera instanceof emp3.api.Camera) {
      cameraId = args.camera.geoId;
    } else {
      throw new TypeError(INVALID_CAMERA_TYPE_ERROR);
    }

    var maps = [];
    for (var map in _mapToCamera) {
      if (_mapToCamera[map].geoId === cameraId) {
        maps.push(map);
      }
    }
    return maps;
  }

  /**
   * Removes a map-to-camera association
   *
   * @throws Error if no args are setCamera
   * @throws Error if the map is not of type {string|emp3.api.Map}
   *
   * @param {object} args
   * @param {emp3.api.Map | string} args.map
   */
  function removeCameraForMap(args) {
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

    delete _mapToCamera[mapId];
  }

  // ===========================================================================
  // Public Interface
  // ===========================================================================
  return {
    init: init,
    setCameraForMap: setCameraForMap,
    getCameraForMap: getCameraForMap,
    getMapsForCamera: getMapsForCamera,
    removeCameraForMap: removeCameraForMap
  };
})();
