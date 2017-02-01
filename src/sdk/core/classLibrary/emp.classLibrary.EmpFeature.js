emp.classLibrary.privateClass = function () {
  return {
    /**
     * @memberof emp.classLibrary.EmpFeature#
     * @param {object} args
     */
    initialize: function (args) {
      /**
       * @memberof emp.classLibrary.EmpFeature#
       */
      var options = {
        //overlayId: emp.helpers.id.get.setId(args.overlayId),
        //parentId: emp.helpers.id.get.setId(args.parentId),
        featureId: args.featureId,
        menuId: emp.helpers.id.get.setId(args.menuId) || "",
        format: args.format,
        data: args.data,
        url: args.url,
        params: args.params || {},
        inEditMode: false,
        mapExtent: new emp.classLibrary.MapExtent()
      };
      emp.classLibrary.Util.setOptions(this, options);
      args.coreObjectType = emp.typeLibrary.types.FEATURE;
      emp.classLibrary.EmpRenderableObject.prototype.initialize.call(this, args);
      this.setMapExtent();
      this.verifyAltitudeMode();
      this.verifyMilStd();
      this.verifyReadOnly();
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    destroy: function () {
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    getFeatureId: function () {
      return this.options.featureId;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    getFormat: function () {
      return this.options.format;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    getData: function () {
      return this.options.data;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    setData: function (sData) {
      this.options.data = sData;
      this.setMapExtent();
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     * @deprecated
     */
    getMenuId: function () {
      return this.options.menuId;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     * @deprecated
     */
    setMenuId: function (sMenuId) {
      this.options.menuId = sMenuId;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    getURL: function () {
      return this.options.url;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    setURL: function (sValue) {
      this.options.url = sValue;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    getParams: function () {
      return this.options.params;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    setParams: function (sValue) {
      this.options.params = sValue;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    getObjectData: function (mapInstanceId, coreParentId) {
      var oParent = this.getParentByIndex(0);

      var oParams = {
        coreId: this.getCoreId(),
        coreParent: coreParentId,
        parentCoreId: emp.storage.getRootGuid(mapInstanceId),
        format: this.getFormat(),
        name: this.getName(),
        menuId: this.getMenuId(),
        description: this.getDescription(),
        featureId: this.getFeatureId(),
        data: emp.helpers.copyObject(this.getData()),
        properties: emp.helpers.copyObject(this.getProperties()),
        url: this.options.url,
        params: this.getParams(),
        visible: this.isVisibleOnMap(mapInstanceId)
      };

      if (oParent) {
        switch (oParent.getCoreObjectType()) {
          case emp.typeLibrary.types.FEATURE:
            oParams.parentId = oParent.getFeatureId();

            while (oParent.getCoreObjectType() !== emp.typeLibrary.types.OVERLAY) {
              oParent = oParent.getParentByIndex(0);
            }
            oParams.overlayId = oParent.getOverlayId();
            break;
          case emp.typeLibrary.types.OVERLAY:
            oParams.overlayId = oParent.getOverlayId();
            break;
        }
      }

      return new emp.typeLibrary.Feature(oParams);
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    verifyAltitudeMode: function () {
      var oProperties = this.getProperties(),
          basicSymbolID;

      if (emp.util.isEmptyString(oProperties.altitudeMode)) {
        // The client has not provided an altitudeMode.
        switch (this.getFormat()) {
          case emp.typeLibrary.featureFormatType.KML:
            // It should be in the KML.
            break;
          case emp.typeLibrary.featureFormatType.GEOJSON:
            oProperties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.CLAMP_TO_GROUND;
            break;
          case emp.typeLibrary.featureFormatType.WMS:
          case emp.typeLibrary.featureFormatType.IMAGE:
            oProperties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.CLAMP_TO_GROUND;
            break;
          case emp.typeLibrary.featureFormatType.MILSTD:
            oProperties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.CLAMP_TO_GROUND;
            basicSymbolID = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(this.getData().symbolCode);
            basicSymbolID = basicSymbolID.slice(0, 3);
            // Check Space Track/Air Track symbols and set the altitudeMode to "absolute" and "relativeToGround" respectivley
            switch (basicSymbolID) {
              case "S*P":
              case "I*P":
                oProperties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.ABSOLUTE;
                break;
              case "S*A":
              case "I*A":
                oProperties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.RELATIVE_TO_GROUND;
                break;
              default:
                break;
            }
            break;
          case emp.typeLibrary.featureFormatType.AIRSPACE:
            oProperties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.RELATIVE_TO_GROUND;
            break;
          default:
            oProperties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.CLAMP_TO_GROUND;
            break;
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    verifyMilStd: function () {
      var oProperties = this.getProperties();

      if (this.getFormat() === emp.typeLibrary.featureFormatType.MILSTD) {
        var bStdVersionNotFound = true;
        var iStdVersion = 0; // 2525B

        if (oProperties.hasOwnProperty('modifiers')) {
          if (oProperties.modifiers.hasOwnProperty('standard')) {
            iStdVersion = emp.typeLibrary.featureMilStdVersionType.convertToNumeric(oProperties.modifiers.standard);
            bStdVersionNotFound = false;
          }
        }

        if (bStdVersionNotFound && oProperties.hasOwnProperty('standard')) {
          iStdVersion = emp.typeLibrary.featureMilStdVersionType.convertToNumeric(oProperties.standard);
        }

        if (armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(this.getData().symbolCode, iStdVersion)
          && sec.web.renderer.utilities.JavaRendererUtilities.is3dSymbol(this.getData().symbolCode, oProperties.modifiers)) {
          if (oProperties.altitudeMode === emp.typeLibrary.featureAltitudeModeType.CLAMP_TO_GROUND) {
            oProperties.altitudeMode = emp.typeLibrary.featureAltitudeModeType.ABSOLUTE;
          }

          if (!oProperties.hasOwnProperty('fillColor')) {
            var sNewFillColor = emp.helpers.get3DMilStdAffiliationColor(this.getData().symbolCode);

            if (oProperties.hasOwnProperty('fillOpacity')
              && !isNaN(oProperties.fillOpacity)) {
              var sOpacity = Math.floor(oProperties.fillOpacity * 255).toString(16);

              if (sOpacity.length <= 1) {
                //forces an opacity of single digit to double digit
                sOpacity = '0' + sOpacity;
              }
              oProperties.fillColor = sOpacity + sNewFillColor;
            } else {
              oProperties.fillColor = '40' + sNewFillColor;
            }
          }

          if (!oProperties.hasOwnProperty('lineColor')) {
            var sLineColor = emp.helpers.get3DMilStdAffiliationColor(this.getData().symbolCode);

            if (oProperties.hasOwnProperty('lineOpacity')
              && !isNaN(oProperties.lineOpacity)) {
              sOpacity = Math.floor(oProperties.lineOpacity * 255).toString(16);

              if (sOpacity.length <= 1) {
                //forces an opacity of single digit to double digit
                sOpacity = '0' + sOpacity;
              }

              oProperties.lineColor = sOpacity + sLineColor;
            } else {
              oProperties.lineColor = 'FF' + sLineColor;
            }
          }
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    verifyReadOnly: function () {
      var oData;

      if (!this.isReadOnly()) {
        if (!emp.util.isEmptyString(this.options.url) && (this.options.url.length > 0)) {
          this.setReadOnly(true);
        }
        else switch (this.getFormat()) {
          case emp.typeLibrary.featureFormatType.KML:
            if (emp.helpers.isCompoundKML(this.getData())) {
              this.setReadOnly(true);
            }
            break;
          case emp.typeLibrary.featureFormatType.GEOJSON:
            oData = this.getData();

            if ((oData !== undefined)
              && oData.hasOwnProperty('type')
              && emp.helpers.isCompoundGeoJson(oData)) {
              this.setReadOnly(true);
            }
            break;
          case emp.typeLibrary.featureFormatType.WMS:
          case emp.typeLibrary.featureFormatType.IMAGE:
            this.setReadOnly(true);
            break;
          case emp.typeLibrary.featureFormatType.MILSTD:
          case emp.typeLibrary.featureFormatType.AIRSPACE:
            break;
        }
      }
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    getMilStdVersion: function () {
      var oProperties = this.getProperties();

      if (!oProperties.hasOwnProperty('modifiers')) {
        return emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B;
      }

      if (!oProperties.modifiers.hasOwnProperty('standard')) {
        return emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B;
      }

      if (oProperties.modifiers.standard.toUpperCase() === emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C) {
        return emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
      }

      return emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    getSymbolCode: function () {
      if (this.getFormat() === emp.typeLibrary.featureFormatType.MILSTD) {
        return this.getData().symbolCode;
      }
      return undefined;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    isInEditMode: function () {
      return this.options.inEditMode;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    setEditMode: function (bValue) {
      this.options.inEditMode = (bValue === true);
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    canMapEnginePlot: function (mapInstanceId) {
      return emp.helpers.canMapEnginePlotFeature(mapInstanceId, this);
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    canMapEngineEdit: function (mapInstanceId) {
      return emp.helpers.canMapEngineEditFeature(mapInstanceId, this);
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    isAOI: function () {
      var bRet = false;
      var oGeoJson = this.getData();

      if (this.getFormat() !== emp.typeLibrary.featureFormatType.GEOJSON) {
        return bRet;
      }

      if (oGeoJson.hasOwnProperty('type')
        && (oGeoJson.type.toLowerCase() === 'feature')) {
        if (oGeoJson.hasOwnProperty('properties') &&
          oGeoJson.properties.hasOwnProperty('aoi')) {
          bRet = true;
        }
      }
      return bRet;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    updateFeature: function (oUpdateFeature) {
      if (!emp.util.isEmptyString(oUpdateFeature.name)) {
        this.setName(oUpdateFeature.name);
      }

      if (!emp.util.isEmptyString(oUpdateFeature.description)) {
        this.setDescription(oUpdateFeature.description);
      }

      if ((oUpdateFeature.data !== null) && (oUpdateFeature.data !== undefined)) {
        this.setData(emp.helpers.copyObject(oUpdateFeature.data));
      }

      if (!emp.helpers.isEmptyString(oUpdateFeature.menuId)) {
        this.setMenuId(oUpdateFeature.menuId);
      }

      if (oUpdateFeature.properties) {
        this.setProperties(emp.helpers.copyObject(oUpdateFeature.properties));
      }
      this.verifyAltitudeMode();
      this.verifyMilStd();
      this.verifyReadOnly();
    },
    /**
     * @description This function returns an array of LatLon coordinates of the feature.
     * @memberof emp.classLibrary.EmpFeature#
     * @returns {LatLon[]} An array of LatLon coordinates.
     */
    getCoordinateList: function () {
      var oCoordList;
      var oParams;

      try {
        switch (this.getFormat()) {
          case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
          case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
          case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
          case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
          case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
          case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
          case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
          case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
          case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
          case emp.constant.featureFormatType.AIRSPACE:
          case emp.constant.featureFormatType.GEOJSON:
          case emp.constant.featureFormatType.MILSTD:
            oCoordList = emp.util.geoJson.toCoordinateArray(this.getData());
            break;
          case emp.constant.featureFormatType.KML:
            oCoordList = emp.util.kml.toCoordinateArray(this.getData());
            break;
          case emp.constant.featureFormatType.IMAGE:
            oParams = this.getParams();
            oCoordList = [];
            oCoordList.push(new emp.classLibrary.Coordinate(oParams.top, oParams.left));
            oCoordList.push(new emp.classLibrary.Coordinate(oParams.bottom, oParams.right));
            break;
        }
      } catch (Err) {
        oCoordList = [];
      }
      return oCoordList;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    compareProperty: function (mapInstanceId, sProperty, Value) {
      var bRet = false;

      if (!emp.util.isEmptyString(sProperty)) {
        switch (sProperty.toLowerCase()) {
          case 'name':
          case 'description':
          case 'readonly':
          case 'visible':
            bRet = emp.classLibrary.EmpRenderableObject.prototype.compareProperty.call(this, mapInstanceId, sProperty, Value);
            break;
          case 'menuid':
            bRet = this.compareValues(this.getMenuId(), Value);
            break;
          case 'format':
            bRet = this.compareValues(this.getFormat(), Value);
            break;
          case 'featureid':
            bRet = this.compareValues(this.getFeatureId(), Value);
            break;
          case 'url':
            bRet = this.compareValues(this.getURL(), Value);
            break;
        }
      }
      return bRet;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    getMapExtent: function (oMapExtent) {
      var oFeatureExtent = this.options.mapExtent;
      var mapExtent = emp.classLibrary.EmpRenderableObject.prototype.getMapExtent.call(this, oMapExtent);

      if (oFeatureExtent && !oFeatureExtent.isEmpty()) {
        mapExtent.addCoordinate(oFeatureExtent.getNorthEast());
        mapExtent.addCoordinate(oFeatureExtent.getSouthWest());
      }

      return mapExtent;
    },
    /**
     * @memberof emp.classLibrary.EmpFeature#
     */
    setMapExtent: function () {
      var iIndex;
      var oCoordinateArray = this.getCoordinateList();

      this.options.mapExtent.reset();

      if (oCoordinateArray && (oCoordinateArray.length > 0)) {
        for (iIndex = 0; iIndex < oCoordinateArray.length; iIndex++) {
          this.options.mapExtent.addCoordinate(oCoordinateArray[iIndex]);
        }
      }
    }
  };
};

/**
 * @constructor
 * @extends emp.classLibrary.EmpRenderableObject
 */
emp.classLibrary.EmpFeature = emp.classLibrary.EmpRenderableObject.extend(emp.classLibrary.privateClass());
