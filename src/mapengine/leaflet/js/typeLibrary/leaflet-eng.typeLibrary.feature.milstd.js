/* global L, leafLet, emp, armyc2, sec */

leafLet.internalPrivateClass.MilStdFeature = function() {
    var publicInterface = {
        initialize: function (args) {
            var options = {
                oMilStdModifiers: {},
                sBasicSymbolCode: undefined,
                i2525Version: 0,
                bIsMultiPointTG: false
            };
            L.Util.setOptions(this, options);

            leafLet.typeLibrary.Feature.prototype.initialize.call(this, args);
        },
        getMilStdModifiers: function() {
            return this.options.oMilStdModifiers;
        },
        getBasicSymbolCode: function() {
            return this.options.sBasicSymbolCode;
        },
        getAzimuthUnits: function() {
            var sUnits = leafLet.utils.AngleUnits.DEGREES;
            var RendererSettings = armyc2.c2sd.renderer.utilities.RendererSettings;
            var oBasicSymbolCode = leafLet.utils.milstd.basicSymbolCode;

            switch (this.getBasicSymbolCode()) {
            case oBasicSymbolCode.RECTANGULAR_TARGET:
                switch (this.get2525Version()) {
                case RendererSettings.Symbology_2525Bch2_USAS_13_14:
                    sUnits = leafLet.utils.AngleUnits.MILS;
                    break;
                case RendererSettings.Symbology_2525C:
                    sUnits = leafLet.utils.AngleUnits.DEGREES;
                    break;
                }
                break;
            }
            return sUnits;
        },
        getAltitudeUnits: function() {
            var sRet = leafLet.utils.Units.FEET;

            return sRet;
        },
        getUnits: function() {
            var retValue = leafLet.utils.Units.METERS;
            var RendererSettings = armyc2.c2sd.renderer.utilities.RendererSettings;
            var oBasicSymbolCode = leafLet.utils.milstd.basicSymbolCode;

            switch (this.getBasicSymbolCode()) {
            case oBasicSymbolCode.RECTANGULAR_TARGET:
                /*
                                    switch (this.get2525Version())
                                    {
                                        case RendererSettings.Symbology_2525Bch2_USAS_13_14:
                                        case RendererSettings.Symbology_2525C:
                                            retValue = leafLet.utils.Units.METERS;
                                            break;
                                    }
                */
                break;
            }

            return retValue;
        },
        getPopupHeading: function() {
            var sText = this.getName();

            if (!sText || (typeof (sText) !== 'string') || (sText === "")) {
                // There is no name, check for a unique identifier.
                var cMilStdModifiers = leafLet.utils.milstd.Modifiers;
                var oModifiers = this.getMilStdModifiers();

                if (oModifiers.hasOwnProperty(cMilStdModifiers.UNIQUE_DESIGNATOR_1)) {
                    sText = oModifiers[cMilStdModifiers.UNIQUE_DESIGNATOR_1];
                } else {
                    sText = "";
                }
            }

            return sText;
        },
        getPopupText: function() {
            var sPopupText = "";
            if (this.options.leafletObject instanceof L.Marker) {
                var oCoordList = this.getCoordinateList();

                sPopupText = "<b>Symbol Code</b>:&nbsp;" + this.options.data.symbolCode +
                             "<br/>&nbsp;&nbsp;&nbsp;&nbsp;<b>Lat</b>:&nbsp;" + oCoordList[0].lat.toFixed(5) +
                             "<br/>&nbsp;&nbsp;&nbsp;&nbsp;<b>Lon</b>:&nbsp;" + oCoordList[0].lng.toFixed(5) +
                             (!isNaN(oCoordList[0].alt)? "<br/>&nbsp;&nbsp;&nbsp;&nbsp;<b>Alt</b>:&nbsp;" + oCoordList[0].alt + this._getAltUnitsAndModeText(): "") +
                             "<br/><br/>" + this._getPopupDescription();
            } else {
                sPopupText = "<b>Symbol Code</b>:&nbsp;" + this.options.data.symbolCode + "<br/><br/>" +
                             this._getPopupDescription();
            }

            return sPopupText;
        },
        _createMultiPointFeature: function(args, oModifier, i2525Version) {
            var leafletObject;
            var leafletObject2;
            var leafletObjectTemp;
            var sDescription = args.properties.description || "";
            var oMapBounds = this.getEngineInstanceInterface().leafletInstance.getBounds();
            var oEmpMapBounds = new leafLet.typeLibrary.EmpBoundary(oMapBounds.getSouthWest(), oMapBounds.getNorthEast());

            leafLet.utils.milstd.applyRequiredModifiers(args.data.symbolCode, oModifier, i2525Version, this.getEngineInstanceInterface().getLeafletMap());

            leafletObject = leafLet.utils.milstd.renderMPGraphic({
                instanceInterface: this.getEngineInstanceInterface(),
                isSelected: args.selected,
                sID: args.coreId,
                sName: args.name,
                sDescription: sDescription,
                sSymbolCode: args.data.symbolCode,
                oCoordData: args.data,
                oModifiers: oModifier,
                i2525Version: i2525Version,
                oFeature: this,
                empMapBounds: oEmpMapBounds
            });

            return leafletObject;
        },
        _createSinglePointFeature: function(oItem, oModifiers) {
            var oFeature;
            var oCoordinates = leafLet.utils.geoJson.convertCoordinatesToLatLng(oItem.data)[0];
            var oMilStdIcon = this._getSinglePointIcon(oItem, oModifiers);

            oFeature = new L.Marker(oCoordinates, {
                icon: oMilStdIcon,
                oFeature: this
            });

            return oFeature;
        },
        _modifierOnList: function(sModifier) {
            return ((this.getEngineInstanceInterface().oLabelList.indexOf(sModifier) === -1)? false: true);
        },
        _getSinglePointIcon: function(oItem, oMainModifiers) {
          var sModifier,
              oModifierArray = [],
              oModifiers = {},
              strippedSymbolCode = '',
              msa = armyc2.c2sd.renderer.utilities.MilStdAttributes,
              image,
              oMilStdIcon,
              oOffset,
              iconUrl,
              iconAnchor,
              iconSize,
              popupAnchor,
              oImageBounds,
              renderingOptimization,
              baseURL,
              sModifiers,
              svgColor;

          if (!oMainModifiers.hasOwnProperty('T') ||
            (oMainModifiers.hasOwnProperty('T') && (oMainModifiers.T !== oItem.name))) {
            // If there is no T or its diff than name.
            oMainModifiers["CN"] = oItem.name;
          }

          for (sModifier in oMainModifiers) {
            if (oMainModifiers.hasOwnProperty(sModifier)) {
              switch (sModifier) {
                case leafLet.utils.milstd.longModifiers.FILL_COLOR:
                  if (L.Browser.canvas) {
                    oModifiers[msa.FillColor] = '#' + oMainModifiers[sModifier];
                  } else {
                    oModifiers['fillcolor'] = oMainModifiers[sModifier];
                  }
                  break;
                case leafLet.utils.milstd.longModifiers.LINE_COLOR:
                  if (L.Browser.canvas) {
                    oModifiers[msa.LineColor] = '#' + oMainModifiers[sModifier];
                  } else {
                    oModifiers['linecolor'] = oMainModifiers[sModifier];
                  }
                  break;
                case leafLet.utils.milstd.Modifiers.STANDARD:
                  oModifiers[sModifier] = oMainModifiers[sModifier];
                  break;
                default:
                  if (this._modifierOnList(sModifier)) {
                    oModifiers[sModifier] = oMainModifiers[sModifier];
                  }
                  break;
              }
            }
          }

          oMainModifiers.SIZE = this.getEngineInstanceInterface().iMilStdIconSize;
          if (this.isSelected()) {
          }

          if (L.Browser.canvas) {
            image = armyc2.c2sd.renderer.MilStdIconRenderer.Render(oItem.data.symbolCode, oMainModifiers);
            iconUrl = image.toDataUrl();
            oOffset = image.getCenterPoint();
            iconAnchor = new L.Point(oOffset.x, oOffset.y);
            popupAnchor = new L.Point(oOffset.x, oOffset.y);
            oImageBounds = image.getImageBounds();
            iconSize = new L.Point(oImageBounds.width, oImageBounds.height);
            renderingOptimization = this.getEngineInstanceInterface().renderingOptimization;
            oMilStdIcon;
            if (renderingOptimization.viewInZone) {
              switch (renderingOptimization.viewInZone) {
                case "farDistanceZone":
                  switch (oItem.data.symbolCode.charAt(1)) {
                    case "H":
                    case "S":
                    case "J":
                    case "K":
                      svgColor = renderingOptimization.farDistanceThreshold.RED;
                      break;
                    case "F":
                    case "D":
                    case "A":
                    case "M":
                      svgColor = renderingOptimization.farDistanceThreshold.BLUE;
                      break;
                    case "N":
                    case "L":
                      svgColor = renderingOptimization.farDistanceThreshold.GREEN;
                      break;
                    case "U":
                    case "P":
                    case "G":
                    case "W":
                      svgColor = renderingOptimization.farDistanceThreshold.YELLOW;
                      break;
                    default:
                      svgColor = renderingOptimization.farDistanceThreshold.YELLOW;
                      break;
                  }
                  image = renderingOptimization.farDistanceThreshold.getSVG({
                    x: 6,
                    y: 6,
                    radius: 5,
                    color: svgColor
                  });
                  iconUrl = 'data:image/svg+xml,' + image;
                  iconAnchor = new L.Point(4, 5);
                  iconSize = new L.Point(12, 12);
                  popupAnchor = new L.Point(4, 5);
                  break;
                case "midDistanceZone":
                  image = armyc2.c2sd.renderer.MilStdIconRenderer.Render(oItem.data.symbolCode, {SIZE: oMainModifiers.SIZE});
                  iconUrl = image.toDataUrl();
                  oOffset = image.getCenterPoint();
                  iconAnchor = new L.Point(oOffset.x, oOffset.y);
                  popupAnchor = new L.Point(oOffset.x, oOffset.y);
                  oImageBounds = image.getImageBounds();
                  iconSize = new L.Point(oImageBounds.width, oImageBounds.height);
                  break;
              }
            }
            oMilStdIcon = new L.Icon({
              iconUrl: iconUrl,
              iconAnchor: iconAnchor,
              iconSize: iconSize,
              popupAnchor: popupAnchor
            });

            return oMilStdIcon;
          }
          sModifiers = "";
          for (sModifier in oModifiers) {
            if (oModifiers.hasOwnProperty(sModifier)) {
              oModifierArray.push(sModifier + "=" + oModifiers[sModifier]);
            }
          }

          if (oModifierArray.length > 0) {
            sModifiers = "?" + oModifierArray.join("&");
          }

          if (!emp.map.engine.rendererUrl || emp.map.engine.rendererUrl === "") {
            baseURL = location.protocol + "//" + location.host + "/";
          } else {
            baseURL = emp.map.engine.rendererUrl;
          }

          iconUrl = baseURL + "/mil-sym-service/renderer/image/" + oItem.data.symbolCode + sModifiers;
          size = oModifiers.size || 32;
          oMilStdIcon = new L.Icon({
            iconUrl: iconUrl,
            className: sClassName
          });

          return oMilStdIcon;
        },
        _updateSinglePointFeature: function(oItem, oModifiers, bUpdateIcon) {
            var oCoordinates = leafLet.utils.geoJson.convertCoordinatesToLatLng(oItem.data)[0];

            if (bUpdateIcon) {
                var oIcon = this._getSinglePointIcon(oItem, oModifiers);
                oItem.leafletObject.setLatLng(oCoordinates);
                oItem.leafletObject.setIcon(oIcon);
            } else {
                oItem.leafletObject.setLatLng(oCoordinates);
            }
            oItem.leafletObject.update();

            return oItem.leafletObject;
        },
        _createFeature: function(oOptions) {
            var oFeature = undefined;
            var sSymbolCode = oOptions.data.symbolCode;
            var oModifiers = leafLet.utils.milstd.convertModifiersTo2525(oOptions);
            var i2525Version = oModifiers[leafLet.utils.milstd.Modifiers.STANDARD];
            var isMultiPoint = armyc2.c2sd.renderer.utilities.SymbolUtilities.isMultiPoint(sSymbolCode, i2525Version);
            var sBasicSymbolCode = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(sSymbolCode);
            var oSymbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(sBasicSymbolCode, i2525Version);
            var oCoordList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oOptions.data);

            if (oSymbolDef && (oCoordList.length < oSymbolDef.minPoints)) {
                // We can't draw it yet.
                this.options.oMilStdModifiers = new leafLet.typeLibrary.MilStdModifiers(this, oModifiers);
                this.options.properties.modifiers = this.options.oMilStdModifiers.toLongModifiers();
                this.options.i2525Version = i2525Version;
                this.options.sBasicSymbolCode = sBasicSymbolCode;
                return undefined;
            }

            if (isMultiPoint) {
                oFeature = this._createMultiPointFeature(oOptions, oModifiers, i2525Version);
                oOptions.bIsMultiPointTG = true;
            } else if (oOptions.data.coordinates.length > 0) {
                oFeature = this._createSinglePointFeature(oOptions, oModifiers);
                oOptions.bIsMultiPointTG = false;
            }

            if (oFeature) {
                var oMapBoundry = this.getEngineInstanceInterface().leafletInstance.getBounds();
                this._updateLeafletObject(oMapBoundry, oFeature, false);
            }

            this.options.oMilStdModifiers = new leafLet.typeLibrary.MilStdModifiers(this, oModifiers);
            this.options.properties.modifiers = this.options.oMilStdModifiers.toLongModifiers();
            this.options.i2525Version = i2525Version;
            this.options.sBasicSymbolCode = sBasicSymbolCode;
            return oFeature;
        },
        getCoordinateList: function() {
            return leafLet.utils.geoJson.convertCoordinatesToLatLng(this.getData());
        },
        setCoordinates: function(oLatLngList) {
            leafLet.utils.geoJson.convertLatLngListToGeoJson(this.getData(), oLatLngList);
        },
        isMultiPointTG: function() {
            return this.options.bIsMultiPointTG;
        },
        getFeatureBounds: function() {
            var oEmpBoundary = leafLet.typeLibrary.Feature.prototype.getFeatureBounds.call(this);

            if (!oEmpBoundary || oEmpBoundary.isEmpty()) {
                var oCoordList = leafLet.utils.geoJson.convertCoordinatesToLatLng(this.options.data);

                oEmpBoundary = new leafLet.typeLibrary.EmpBoundary(oCoordList);
            }

            return oEmpBoundary;
        },
        get2525Version: function() {
            return this.options.i2525Version;
        },
        render: function() {
            if (this.isVisible()) {
                var oLeafletObject = this._createFeature(this.options);

                this.setLeafletObject(oLeafletObject);
            }
        },
        _updateMilStdFeature: function(args, oModifiers, bUpdateGraphic) {
            var oFeature = undefined;
            var sSymbolCode = args.data.symbolCode;
            var i2525Version = oModifiers[leafLet.utils.milstd.Modifiers.STANDARD];
            var isMultiPoint = armyc2.c2sd.renderer.utilities.SymbolUtilities.isMultiPoint(sSymbolCode, i2525Version);

            if (isMultiPoint) {
                oFeature = this._createMultiPointFeature(args, oModifiers, i2525Version);
                args.bIsMultiPointTG = true;
            } else {
                oFeature = this._updateSinglePointFeature(args, oModifiers, bUpdateGraphic);
            }

            if (oFeature) {
                var oMapBoundry = this.getEngineInstanceInterface().leafletInstance.getBounds();
                this._updateLeafletObject(oMapBoundry, oFeature, false);
            }

            return oFeature;
        },
        updateCoordinates: function(oMapBounds) {
            if (this.isVisible() && !this.isMultiPointTG()) {
                // We only update coordinates to the visible NON tactical graphics.
                // TG will get re-rendered.
                this._updateLeafletObject(oMapBounds, this.getLeafletObject(), false);
            }
        },
        _updateFeature: function(oArgs) {
            var oNewFeafure;
            var sModifier;
            var bUpdateGraphic = (oArgs.bUpdateGraphic === true);
            var oMilStdModifiers = this.options.oMilStdModifiers;
            var oMilStdUtil = leafLet.utils.milstd;
            var oModifiers = oMilStdUtil.convertModifiersTo2525(oArgs);

            if (!bUpdateGraphic) {
                if ((oArgs.hasOwnProperty('name') && (oArgs['name'] !== this.getName()))) {
                    bUpdateGraphic = true;
                } else if (oArgs.data.symbolCode !== this.options.data.symbolCode) {
                    // The symbol changed we need to regenerate the graphic.
                    bUpdateGraphic = true;
                } else {
                    for (sModifier in oModifiers) {
                        if (!oModifiers.hasOwnProperty(sModifier)) {
                            continue;
                        }
                        if (oMilStdModifiers.oModifiers[sModifier] === undefined) {
                            // There is a new modifiers.
                            // We need to regenerate the graphic.
                            bUpdateGraphic = true;
                            break;
                        } else if (!oMilStdUtil.areModifierValuesEqual(oMilStdModifiers.oModifiers[sModifier], oModifiers[sModifier])) {
                            // The modifier changed.
                            // We need to regenerate the graphic.
                            bUpdateGraphic = true;
                            break;
                        }
                    }

                    if (!bUpdateGraphic) {
                        for (sModifier in oMilStdModifiers.oModifiers) {
                            if (!oMilStdModifiers.oModifiers.hasOwnProperty(sModifier)) {
                                continue;
                            }
                            if ((sModifier !== 'CN') && (oModifiers[sModifier] === undefined)) {
                                // A modifier was removed.
                                // We need to regenerate the graphic.
                                bUpdateGraphic = true;
                                break;
                            }
                        }
                    }
                }
            }

            oNewFeafure = this._updateMilStdFeature(oArgs, oModifiers, bUpdateGraphic);
            this.options.oMilStdModifiers = new leafLet.typeLibrary.MilStdModifiers(this, oModifiers);
            this.options.properties.modifiers = this.options.oMilStdModifiers.toLongModifiers();
            this.options.bIsMultiPointTG = oArgs.bIsMultiPointTG;

            return oNewFeafure;
        },
        updateIconSize: function() {
            var sSymbolCode = this.options.data.symbolCode;
            var oModifiers = this.options.oMilStdModifiers.toModifiers();
            var i2525Version = oModifiers[leafLet.utils.milstd.Modifiers.STANDARD];
            var isMultiPoint = armyc2.c2sd.renderer.utilities.SymbolUtilities.isMultiPoint(sSymbolCode, i2525Version);

            if (!isMultiPoint) {
                this._updateSinglePointFeature(this.options, oModifiers, true);
            }
        },
        resetEditMode: function() {
            this.options.isEditMode = false;
            if (this.isSelected() && this.isMultiPointTG()) {
                this.render();
            }
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.MilStdFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.MilStdFeature());
