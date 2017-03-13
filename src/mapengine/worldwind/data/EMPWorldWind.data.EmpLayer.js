var EMPWorldWind = EMPWorldWind || {};
EMPWorldWind.data = EMPWorldWind.data || {};

/**
 * @classdesc This represents an EMP layer. Any interaction with the WorldWind layer itself will occur here.
 *
 * @class
 * @param {emp.typeLibrary.Overlay} overlay
 */
EMPWorldWind.data.EmpLayer = function(overlay) {
  /** @type {Object.<string, EMPWorldWind.Data.EmpLayer>} */
  this.subLayers = {};

  /** @type {Object.<string, EMPWorldWind.Data.EmpFeature>} */
  this.featureKeys = {};

  /** @member {string} */
  this.name = overlay.name || undefined;

  /** @member {string} */
  this.description = overlay.description;

  /** @member {string} */
  this.id = overlay.overlayId;

  /** @member {string} */
  this.parentId = overlay.parentId;

  /** @member {string} */
  this.globalType = overlay.globalType || "vector"; // vector, wms

  var _overlay = overlay;
  /**
   * @name EMPWorldWind.data.EmpLayer#overlay
   * @type {emp.typeLibrary.Overlay}
   */
  Object.defineProperty(this, 'overlay', {
    enumerable: true,
    value: _overlay
  });

  // TODO handle WMS, WMTS, KML...
  var _layer = new WorldWind.RenderableLayer(this.id);
  /**
   * @name EMPWorldWind.data.EmpLayer#layer
   * @type {WorldWind.RenderableLayer}
   */
  Object.defineProperty(this, 'layer', {
    enumerable: true,
    value: _layer
  });

  /** @member {boolean} */
  this.enabled = true; // true by default
};

/**
 *
 * @param {EMPWorldWind.data.EmpFeature} feature
 */
EMPWorldWind.data.EmpLayer.prototype.addFeature = function(feature) {
  if (!this.isFeaturePresent(feature)) {
    emp.util.each(feature.shapes, function(shape) {
      this.layer.addRenderable(shape);
    }.bind(this));

    this.featureKeys[feature.id] = {
      "id": feature.id,
      "type": EMPWorldWind.constants.FeatureType.RENDERABLE,
      "feature": feature
    };

    feature.overlayId = this.id;
  } else {
    // feature already present in map. First remove existing one and then add as new one. The updateFeature
    // does not remove the emp objects from engine hashes like entity, airspace, multipoint hashes.
    this.updateFeature(feature);
  }
};

/**
 * Expose a refresh for the actual WorldWind layer
 */
EMPWorldWind.data.EmpLayer.prototype.refresh = function() {
  this.layer.refresh();
};

/**
 *
 * @param {EMPWorldWind.data.EmpFeature[]} features
 */
EMPWorldWind.data.EmpLayer.prototype.addFeatures = function(features) {
  emp.util.each(features, function(feature) {
    this.addFeature(feature);
  }.bind(this));
};

/**
 *
 * @param entity
 * @param childEntity
 */
EMPWorldWind.data.EmpLayer.prototype.addFeatureChild = function(entity, childEntity) {
  if (this.isFeaturePresent(entity)) {
    if (!this.isFeatureChildPresent(entity, childEntity)) {
      if (!this.isFeaturePresent(childEntity)) {
        childEntity.parentFeature = entity;
        childEntity.overlayId = this.id;
        this.addFeature(childEntity);
        if (entity.childrenFeatureKeys === undefined) {
          entity.childrenFeatureKeys = {};
        }
        entity.childrenFeatureKeys[childEntity.id] = childEntity.id;
      }
    }
  }
};

/**
 *
 * @param entity
 * @param childEntity
 */
EMPWorldWind.data.EmpLayer.prototype.allocateFeatureChild = function(entity, childEntity) {
  if (this.isFeaturePresent(entity)) {
    if (!this.isFeatureChildPresent(entity, childEntity)) {
      if (this.isFeaturePresent(childEntity)) // must be present in layer
      {
        childEntity.parentFeature = entity;
        childEntity.overlayId = this.id;
        if (entity.childrenFeatureKeys === undefined) {
          entity.childrenFeatureKeys = {};
        }
        entity.childrenFeatureKeys[childEntity.id] = childEntity.id;
      }
    }
  }
};

/**
 *
 * @param parentEntity
 * @param childEntity
 * @returns {boolean}
 */
EMPWorldWind.data.EmpLayer.prototype.isFeatureChildPresent = function(parentEntity, childEntity) {
  if (parentEntity && childEntity) {
    if (parentEntity.childrenFeatureKeys) {
      return (childEntity.id in parentEntity.childrenFeatureKeys);
    } else {
      return false;
    }
  }
};

/**
 *
 * @param subLayer
 */
EMPWorldWind.data.EmpLayer.prototype.addSubLayer = function(subLayer) {
  if (!this.isSubLayerPresent(subLayer.id)) {
    subLayer.parentId = this.id;
    this.subLayers[subLayer.id] = subLayer;
  }
};

/**
 *
 * @returns {boolean}
 */
EMPWorldWind.data.EmpLayer.prototype.isLayerEmpty = function() {
  return (this.featuresLength() + this.subOverlaysLength() <= 0);
};

/**
 *
 * @param id
 */
EMPWorldWind.data.EmpLayer.prototype.getFeature = function(id) {
  if (this.isFeaturePresentById(id)) {
    var empFeature = this.featureKeys[id];
    return empFeature.feature;
  }
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.data.EmpLayer.prototype.isPrimitive = function(id) {
  var isPrimitive = false;
  if (this.isFeaturePresentById(id)) {
    var empFeature = this.featureKeys[id];
    if (empFeature.type === EMPWorldWind.constants.FeatureType.PRIMITIVE || empFeature.type === EMPWorldWind.constants.FeatureType.PRIMITIVE_COLLECTION) {
      isPrimitive = true;
    }
  }

  return isPrimitive;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.data.EmpLayer.prototype.isDataSource = function(id) {
  var isDataSource = false;
  if (this.isFeaturePresentById(id)) {
    var empFeature = this.featureKeys[id];
    if (empFeature.type === EMPWorldWind.constants.FeatureType.DATA_SOURCE) {
      isDataSource = true;
    }
  }

  return isDataSource;
};

/**
 *
 * @returns {Array}
 */
EMPWorldWind.data.EmpLayer.prototype.getFeatures = function() {
  var features = [], id;
  for (id in this.featureKeys) {
    if (id && this.featureKeys.hasOwnProperty(id)) {
      features.push(this.getFeature(id));
    }
  }

  return features;
};

/**
 *
 * @param id
 * @returns {undefined}
 */
EMPWorldWind.data.EmpLayer.prototype.getSubLayer = function(id) {
  var subLayer = undefined;
  if (this.isSubLayerPresent(id)) {
    subLayer = this.subLayers[id];
  }

  return subLayer;
};

/**
 *
 * @param id
 * @returns {Array}
 */
EMPWorldWind.data.EmpLayer.prototype.getSubLayers = function(id) {
  var layers = [];
  for (id in this.subLayers) {
    if (this.subLayers.hasOwnProperty(id)) {
      layers.push(this.getSubLayer(id));
    }
  }

  return layers;
};

/**
 *
 */
EMPWorldWind.data.EmpLayer.prototype.removeFeatures = function() {
  for (var id in this.featureKeys) {
    if (this.featureKeys.hasOwnProperty(id)) {
      var entity = this.getFeature(id);
      this.removeFeature(entity);
    }
  }
};

/**
 *
 */
EMPWorldWind.data.EmpLayer.prototype.removeFeatureSelections = function() {
  for (var id in this.featureKeys) {
    if (this.featureKeys.hasOwnProperty(id)) {
      //TODO this.empWorldWind.removeFeatureSelection(id);
    }
  }
};

/**
 *
 * @param visibility
 */
EMPWorldWind.data.EmpLayer.prototype.showFeatures = function(visibility) {
  for (var id in this.featureKeys) {
    if (this.featureKeys.hasOwnProperty(id)) {
      var entity = this.getFeature(id);
      if (entity) {
        this.showFeature(entity.id, visibility);
      }
    }
  }
};

/**
 *
 * @param id
 * @param visibility
 */
EMPWorldWind.data.EmpLayer.prototype.showFeature = function(id, visibility) {
  var oMultiPoint,
    childrenFeatureId,
    childrenEntity,
    feature = this.getFeature(id);
  if (!feature) {
    return;
  }
  if (feature.featureType === EMPWorldWind.constants.FeatureType.ENTITY) {
    feature.show = visibility;
    if (feature.billboard !== undefined) {
      if (feature.reRenderBillboardRequired && visibility) {
        // when the overlay or parent if hidden the billboard is added to the entity collection with show = false but the loadImage is never called
        // in the Cesium sdk. Here I'm removing and then re adding the entity when the show visibility is set to true for the for the first  time.
        // This fixes the issue for kml and geojson points.
        feature.reRenderBillboardRequired = undefined;
        feature.show = visibility;
        feature.billboard.show = visibility;
        this.updateFeature(feature); // the update removes and then adds the feature to the entity or primitive collection. The children are not remove and re-added.
      }
      feature.billboard.show = visibility;
    }
    if (feature.path !== undefined) {
      feature.path.show = visibility;
    }
    if (feature.polyline !== undefined) {
      feature.polyline.show = visibility;
    }
    if (feature.polygon !== undefined) {
      feature.polygon.show = visibility;
    }
    if (feature.label !== undefined) {
      feature.label.show = visibility;
    }
    if (feature.rectangle !== undefined) {
      feature.show = visibility;
      if (this.empCesium.isMultiPointPresent(id)) {
        oMultiPoint = this.empCesium.getMultiPoint(id);
        if (oMultiPoint) {
          oMultiPoint.visible = visibility;
        }
      }
    }
    if (feature.childrenFeatureKeys !== undefined) {
      for (childrenFeatureId in feature.childrenFeatureKeys) {
        if (feature.childrenFeatureKeys.hasOwnProperty(childrenFeatureId)) {
          childrenEntity = this.getFeature(childrenFeatureId);
          if (childrenEntity) {
            this.showFeature(childrenEntity.id, visibility);
          }
        }
      }
    }
  }
  else if (feature.featureType === EMPWorldWind.constants.FeatureType.COMPOUND_ENTITY) {
    feature.show = visibility;
    if (feature.childrenFeatureKeys !== undefined) {
      for (childrenFeatureId in feature.childrenFeatureKeys) {
        if (feature.childrenFeatureKeys.hasOwnProperty(childrenFeatureId)) {
          childrenEntity = this.getFeature(childrenFeatureId);
          if (childrenEntity) {
            this.showFeature(childrenEntity.id, visibility);
          }
        }
      }
    }
  } else if (feature.featureType === EMPWorldWind.constants.FeatureType.PRIMITIVE) {
    feature.show = visibility;
    //primitive could represent a 3D multipoint that uses labels (entity.rectangle... with canvas)
    var airspaceLabelPresent = this.empCesium.isMultiPointPresent(id + "_label");
    if (airspaceLabelPresent) {
      var airspaceLabel = this.getFeature(id + "_label");
      if (airspaceLabel) {
        airspaceLabel.show = visibility;    //new this.empCesium.ConstantProperty(visibility);
      }
    }
  } else if (feature.featureType === EMPWorldWind.constants.FeatureType.PRIMITIVE_COLLECTION) {
    if (feature.length > 0) {
      feature.get(0).show = visibility;
    }
    if (this.empCesium.isAirspacePresent(id)) {
      var oAirspace = this.empCesium.getAirspace(id);
      if (oAirspace) {
        oAirspace.visible = visibility;
      }
    } else if (this.empCesium.isSinglePointPresent(id)) {
      var oSinglePoint = this.empCesium.getSinglePoint(id);
      if (oSinglePoint) {
        oSinglePoint.visible = visibility;
      }
    }
  }
};

/**
 *
 */
EMPWorldWind.data.EmpLayer.prototype.removeSubLayers = function() {
  for (var id in this.subLayers) {
    if (this.subLayers.hasOwnProperty(id)) {
      var subLayer = this.getSubLayer(id);
      if (subLayer) {
        subLayer.removeFeatures();
        subLayer.removeSubLayers();
        delete this.subLayers[id];
      }
    }
  }
};

/**
 *
 * @param visibility
 */
EMPWorldWind.data.EmpLayer.prototype.showSubLayers = function(visibility) {
  for (var id in this.subLayers) {
    if (this.subLayers.hasOwnProperty(id)) {
      var subLayer = this.getSubLayer(id);
      if (subLayer) {
        subLayer.visibility = visibility;
        subLayer.showFeatures(visibility);
        subLayer.showSubLayers(visibility);
      }
    }
  }
};

/**
 *
 */
EMPWorldWind.data.EmpLayer.prototype.clearLayer = function() {
  switch (this.globalType) {
    case EMPWorldWind.constants.LayerType.ARCGIS_93_REST_LAYER:
    case EMPWorldWind.constants.LayerType.BING_LAYER:
    case EMPWorldWind.constants.LayerType.IMAGE_LAYER:
    case EMPWorldWind.constants.LayerType.OSM_LAYER:
    case EMPWorldWind.constants.LayerType.WMS_LAYER:
    case EMPWorldWind.constants.LayerType.TMS_LAYER:
    case EMPWorldWind.constants.LayerType.WMTS_LAYER:
      this.enabled = false;
      break;
    default:
    // do nothing
  }
  this.removeFeatureSelections();
  this.removeFeatures();
  this.removeSubLayers();
};

/**
 *
 * @param isVisible
 */
EMPWorldWind.data.EmpLayer.prototype.showLayer = function(isVisible) {
  this.showFeatures(isVisible);
  this.showSubLayers(isVisible);
};

/**
 *
 * @param feature
 */
EMPWorldWind.data.EmpLayer.prototype.removeFeature = function(feature) {
  if (this.isFeaturePresent(feature)) {
    if (feature.childrenFeatureKeys !== undefined) {
      for (var id in feature.childrenFeatureKeys) {
        if (feature.childrenFeatureKeys.hasOwnProperty(id)) {
          var childrenEntity = this.getFeature(id);
          if (childrenEntity) {
            this.removeFeature(childrenEntity);
          }
        }
      }
    }
    if (EMPWorldWind.utils.defined(feature.parentFeature)) {
      this.deallocateFeatureChild(feature.parentFeature, feature);
    }

    emp.util.each(feature.shapes, function(shape){
      if (shape instanceof WorldWind.RenderableLayer) {
        // Handle KML features
        this.worldwind.removeLayer(shape);
      } else {
        // Handle normal primitives
        this.layer.removeRenderable(shape);
      }
    }.bind(this));

    delete this.featureKeys[feature.id];
  }
};

/**
 * feature already present in map. First remove existing one and then add as new one. The updateFeature
 * does not remove the emp objects from engine hashes like entity, airspace, multipoint hashes. The addFeature from the emp engine api
 * takes care of the case of an update. The updateFeature is used for internal removal and then re-adding the feature to map with same id. The
 * presence of the feature in the layers , and any child entities ( ojo - would a replace erase any children feature association to updated feature?) under the updated feature is mantained (v2)..
 *
 * @param feature
 */
EMPWorldWind.data.EmpLayer.prototype.updateFeature = function(feature) {
  var renderable;
  //feature already present in map. First remove existing one and then add as new one
  if (feature.id && feature.id !== null) {
    renderable = this.getFeature(feature.id); // entity is the current geometry rendered on map
    // keep children association to parent when updating
    feature.childrenFeatureKeys = renderable.childrenFeatureKeys;
    feature.parentFeature = renderable.parentFeature;
    this.layer.removeRenderable(renderable);
    this.layer.addRenderable(feature);
    this.featureKeys[feature.id].feature = feature;
    feature.overlayId = this.id;
  }
};

/**
 * remove feature recursively from layer but keep feature in the Cesium entityCollection
 * this function is used for the moving of features.
 */
EMPWorldWind.data.EmpLayer.prototype.deallocateFeature = function(entity) {
  if (this.isFeaturePresent(entity)) {
    if (entity.childrenFeatureKeys !== undefined) {
      for (var id in entity.childrenFeatureKeys) {
        if (entity.childrenFeatureKeys.hasOwnProperty(id)) {
          var childrenEntity = this.getFeature(id);
          if (childrenEntity) {
            this.deallocateFeature(childrenEntity);
          }
        }
      }
    }
    entity.overlayId = undefined;
    delete this.featureKeys[entity.id];
  }
};

/**
 * Add feature recursively to layer. the feature must  already be part of the Cesium entityCollection
 * this function is used for the moving of features.
 * @param feature
 */
EMPWorldWind.data.EmpLayer.prototype.allocateFeature = function(feature) {
  if (!this.isFeaturePresent(feature)) {
    if (feature.featureType === EMPWorldWind.constants.FeatureType.ENTITY) {
      this.featureKeys[feature.id] = {
        "id": feature.id,
        "type": EMPWorldWind.constants.FeatureType.ENTITY
      };
    }
    else if (feature.featureType === EMPWorldWind.constants.FeatureType.COMPOUND_ENTITY) {
      this.featureKeys[feature.id] = {
        "id": feature.id,
        "type": EMPWorldWind.constants.FeatureType.COMPOUND_ENTITY
      };
    }
    else if (feature.featureType === EMPWorldWind.constants.FeatureType.PRIMITIVE) {
      this.featureKeys[feature.id] = {
        "id": feature.id,
        "type": EMPWorldWind.constants.FeatureType.PRIMITIVE
      };
    }
    else if (feature.featureType === EMPWorldWind.constants.FeatureType.PRIMITIVE_COLLECTION) {
      this.featureKeys[feature.id] = {
        "id": feature.id,
        "type": EMPWorldWind.constants.FeatureType.PRIMITIVE_COLLECTION
      };
    }
    else if (feature.featureType === EMPWorldWind.constants.FeatureType.DATA_SOURCE) {
      this.featureKeys[feature.id] = {
        "id": feature.id,
        "type": EMPWorldWind.constants.FeatureType.DATA_SOURCE
      };
    }
    var featureChildrenLength = this.featureChildrenLength(feature);
    if (featureChildrenLength > 0) {
      var childrenFeatures = this.getFeatureChildrenEntityArray(feature);
      for (var index = 0; index < featureChildrenLength; index++) {
        var childrenFeature = childrenFeatures[index];
        this.allocateFeature(childrenFeature);
      }
    }
    feature.overlayId = this.id;
  }
};

/**
 *
 * @param entity
 */
EMPWorldWind.data.EmpLayer.prototype.clearFeature = function(entity) {
  if (this.isFeaturePresent(entity)) {
    if (entity.childrenFeatureKeys !== undefined) {
      for (var id in entity.childrenFeatureKeys) {
        if (entity.childrenFeatureKeys.hasOwnProperty(id)) {
          var childrenEntity = this.getFeature(id);
          if (childrenEntity) {
            this.removeFeature(childrenEntity);
          }
        }
      }
      entity.childrenFeatureKeys = undefined;
    }
  }
};

/**
 *
 * @param parentEntity
 * @param childEntity
 */
EMPWorldWind.data.EmpLayer.prototype.removeFeatureChild = function(parentEntity, childEntity) {
  if (this.isFeaturePresent(parentEntity) && this.isFeaturePresent(childEntity)) {
    if (parentEntity.childrenFeatureKeys !== undefined) {
      if (this.isFeatureChildPresent(parentEntity, childEntity)) {
        this.removeFeature(childEntity);
        delete parentEntity.childrenFeatureKeys[childEntity.id];
      }
    }
  }
};

/**
 *
 * @param parentEntity
 * @param childEntity
 */
EMPWorldWind.data.EmpLayer.prototype.deallocateFeatureChild = function(parentEntity, childEntity) {
  if (this.isFeaturePresent(parentEntity) && this.isFeaturePresent(childEntity)) {
    if (parentEntity.childrenFeatureKeys !== undefined) {
      if (this.isFeatureChildPresent(parentEntity, childEntity)) {
        //this.removeFeature(childEntity);
        delete parentEntity.childrenFeatureKeys[childEntity.id];
        childEntity.parentFeature = undefined;
        childEntity.overlayId = undefined;
      }
    }
  }
};

/**
 *
 * @param entity
 * @returns {Array}
 */
EMPWorldWind.data.EmpLayer.prototype.getFeatureChildrenEntityArray = function(entity) {
  var featureChildrenEntityArray = [];
  if (this.isFeaturePresent(entity)) {
    if (entity.childrenFeatureKeys !== undefined) {
      for (var id in entity.childrenFeatureKeys) {
        if (entity.childrenFeatureKeys.hasOwnProperty(id)) {
          var childrenEntity = this.getFeature(id);
          if (childrenEntity) {
            featureChildrenEntityArray.push(childrenEntity);
          }
        }
      }
    }
  }

  return featureChildrenEntityArray;

};
/**
 *
 * @param id
 */
EMPWorldWind.data.EmpLayer.prototype.removeFeatureById = function(id) {
  var feature;
  if (this.isFeaturePresentById(id)) {
    feature = this.getFeature(id);
    this.removeFeature(feature);
  }
};

/**
 *
 * @param subOverlay
 */
EMPWorldWind.data.EmpLayer.prototype.removeSubLayer = function(subOverlay) {
  if (this.isSubLayerPresent(subOverlay.id)) {
    this.subLayer.removeFeatures();
    this.subLayer.removeSubLayers();
    delete this.SubLayers[this.subLayer.id];
  }
};

/**
 *
 * @param id
 */
EMPWorldWind.data.EmpLayer.prototype.removeSubLayerById = function(id) {
  if (this.isSubLayerPresent(id)) {
    var subLayer = this.getLayer(id);
    this.removeSubLayer(subLayer);
  }
};

/**
 *
 * @returns {Number|*}
 */
EMPWorldWind.data.EmpLayer.prototype.featuresLength = function() {
  return Object.keys(this.featureKeys).length;
};

/**
 *
 * @param entity
 * @returns {number}
 */
EMPWorldWind.data.EmpLayer.prototype.featureChildrenLength = function(entity) {
  var length = 0;
  if (entity.childrenFeatureKeys) {
    length = Object.keys(entity.childrenFeatureKeys).length;
  }

  return length;
};

/**
 *
 * @returns {Number|*}
 */
EMPWorldWind.data.EmpLayer.prototype.subLayersLength = function() {
  return Object.keys(this.subLayers).length;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.data.EmpLayer.prototype.isFeaturePresentById = function(id) {
  if (id)
    return (id in this.featureKeys);
};

/**
 *
 * @param entity
 * @returns {boolean}
 */
EMPWorldWind.data.EmpLayer.prototype.isFeaturePresent = function(entity) {
  if (entity && entity.id) {
    return (entity.id in this.featureKeys);
  } else {
    return false;
  }
};

/**
 *
 * @param id
 * @returns {boolean}
 */
EMPWorldWind.data.EmpLayer.prototype.isSubLayerPresent = function(id) {
  if (id) {
    return (id in this.subLayers);
  }

  return false;
};
