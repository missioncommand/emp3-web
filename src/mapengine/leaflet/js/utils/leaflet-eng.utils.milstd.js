/* global leafLet, L, emp, armyc2, sec */

leafLet.utils = leafLet.utils || {};

leafLet.utils.milstd = (function() {
    var privateInterface = {
        getAutoWidth: function(oMap) {
            var oBounds = oMap.getBounds();
            var dCenterLat = (oBounds.getNorth() - oBounds.getSouth()) / 2.0;
            var oCenterWest = new L.LatLng(dCenterLat, leafLet.utils.normilizeLongitude(oBounds.getWest()));
            var oCenterEast = new L.LatLng(dCenterLat, leafLet.utils.normilizeLongitude(oBounds.getEast()));
            return Math.round(oCenterWest.distanceTo(oCenterEast) / 32.0);
        },
        checkModifier: function(sBasicSymbol, sModifier, oModifiers, i2525Version, oMap) {
            var sBaseModifier;
            var sDigit;
            var iDigit;
            var oTGModifiers = armyc2.c2sd.renderer.utilities.ModifiersTG;
            var oBasicCodes = leafLet.utils.milstd.basicSymbolCode;

            sBaseModifier = sModifier;
            sDigit = "0";

            // See if the modifier has a digit or a # sign.
            if (leafLet.utils.isInt(sBaseModifier.charAt(sBaseModifier.length - 1))
            || (sBaseModifier.charAt(sBaseModifier.length - 1) === '#')) {
                sDigit = sBaseModifier.substr(sBaseModifier.length - 1);
                sBaseModifier = sBaseModifier.substr(0, sBaseModifier.length - 1);
            }

            iDigit = parseInt(sDigit, 10);
            if (isNaN(iDigit)) {
                iDigit = 0;
            }

            if (oModifiers[sBaseModifier] === undefined) {
                // This modifier is not present.
                switch (sBaseModifier) {
                case oTGModifiers.T_UNIQUE_DESIGNATION_1:
                    oModifiers[sModifier] = "";
                    break;
                case oTGModifiers.AM_DISTANCE:
                    oModifiers[sBaseModifier] = [];
                    break;
                case oTGModifiers.AN_AZIMUTH:
                    oModifiers[sBaseModifier] = [];
                    break;
                case oTGModifiers.S_OFFSET_INDICATOR:
                    oModifiers[sModifier] = "";
                    break;
                case oTGModifiers.V_EQUIP_TYPE:
                    oModifiers[sModifier] = "";
                    break;
                case oTGModifiers.W_DTG_1:
                    oModifiers[sModifier] = "";
                    break;
                case oTGModifiers.H_ADDITIONAL_INFO_1:
                    if ((sDigit === '2') && (i2525Version === 0)) {
                        switch (sBasicSymbol) {
                        case oBasicCodes.AIR_CORRIDOR:
                        case oBasicCodes.MINIMUM_RISK_ROUTE:
                        case oBasicCodes.STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE:
                        case oBasicCodes.UBMANNED_AERIAL_VEHICLE_ROUTE:
                        case oBasicCodes.LOW_LEVEL_TRANSIT_ROUTE:
                            if (oModifiers[oTGModifiers.AM_DISTANCE] === undefined) {
                                oModifiers[sModifier] = privateInterface.getAutoWidth(oMap);
                            } else if (oModifiers[oTGModifiers.AM_DISTANCE].length === 0) {
                                oModifiers[oTGModifiers.AM_DISTANCE].push(privateInterface.getAutoWidth(oMap));
                            }
                            break;
                        default:
                            break;
                        }
                    } else {
                        oModifiers[sModifier] = "";
                    }
                    break;
                case oTGModifiers.X_ALTITUDE_DEPTH:
                    oModifiers[sBaseModifier] = [];
                    break;
                }
            } else {
                // If we reach here the modifier has been provided, and if its an AM, AN, or X.
                // We need to make sure that its an array.
                switch (sBaseModifier) {
                case oTGModifiers.AM_DISTANCE:
                case oTGModifiers.AN_AZIMUTH:
                case oTGModifiers.X_ALTITUDE_DEPTH:
                    if (!(oModifiers[sBaseModifier] instanceof Array)) {
                        if (oModifiers[sBaseModifier] === undefined) {
                            oModifiers[sBaseModifier] = [];
                        } else {
                            var Value = oModifiers[sBaseModifier];
                            oModifiers[sBaseModifier] = [Value];
                            //oModifiers[sBaseModifier].splice(iDigit, 0, Value);
                        }
                    }
                    break;
                }
            }

            if (oModifiers[sBaseModifier] instanceof Array) {
                switch (sBaseModifier) {
                case oTGModifiers.AM_DISTANCE:
                    var dValue;
                    var dBaseValue;
                    switch (sBasicSymbol) {
                    case oBasicCodes.AIR_CORRIDOR:
                    case oBasicCodes.MINIMUM_RISK_ROUTE:
                    case oBasicCodes.STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE:
                    case oBasicCodes.UBMANNED_AERIAL_VEHICLE_ROUTE:
                    case oBasicCodes.LOW_LEVEL_TRANSIT_ROUTE:
                        if (oModifiers[oTGModifiers.AM_DISTANCE] === undefined) {
                            oModifiers[sModifier] = privateInterface.getAutoWidth(oMap);
                        } else if (oModifiers[oTGModifiers.AM_DISTANCE].length === 0) {
                            oModifiers[oTGModifiers.AM_DISTANCE].push(privateInterface.getAutoWidth(oMap));
                        }
                        break;
                    case oBasicCodes.CIRCULAR_RANGE_FAN:
                    case oBasicCodes.SECTOR_RANGE_FAN:
                    default:
                        dBaseValue = 5000.0;
                        if (sDigit.indexOf('#') !== -1) {
                            if (oModifiers[sBaseModifier].length === 0) {
                                oModifiers[sBaseModifier].push(dBaseValue);
                            }
                        } else if (oModifiers[sBaseModifier][iDigit] === undefined) {
                            oModifiers[sBaseModifier].splice(iDigit, 0, dBaseValue * (iDigit + 1));
                        }
                        break;
                    }
                    break;
                case oTGModifiers.AN_AZIMUTH:
                    switch (sBasicSymbol) {
                    case oBasicCodes.SECTOR_RANGE_FAN:
                        if (sDigit.indexOf('#') !== -1) {
                            for (var iIndex = 0; iIndex < 2; iIndex++) {
                                if (iIndex >= oModifiers[sBaseModifier].length) {
                                    // Only add the value if it does not contain one..
                                    oModifiers[sBaseModifier].splice(iIndex, 0, (((iIndex % 2) === 0)? 315.0: 45));
                                }
                            }
                        } else if (oModifiers[sBaseModifier][iDigit] === undefined) {
                            oModifiers[sBaseModifier].splice(iDigit, 0, (((iDigit % 2) === 0)? 315.0: 45));
                        }
                        break;
                    default:
                        if (sDigit.indexOf('#') !== -1) {
                            if (oModifiers[sBaseModifier].length === 0) {
                                // Only add the value if it does not contain one..
                                oModifiers[sBaseModifier].splice(0, 0, 0);
                            }
                        } else if (oModifiers[sBaseModifier][iDigit] === undefined) {
                            oModifiers[sBaseModifier].splice(iDigit, 0, 0);
                        }
                        break;
                    }
                    break;
                case oTGModifiers.X_ALTITUDE_DEPTH:
                    break;
                }
            }
        },
        createMilStdEditor: function(oPrivateInterface, oTransaction, oFeature, oEmpItem,  sBasicSymbolCode, oSymbolDef, i2525Version) {
            var oEditor = undefined;
            var isMultiPoint = armyc2.c2sd.renderer.utilities.SymbolUtilities.isMultiPoint(sBasicSymbolCode, i2525Version);
            var oSymbolDefTable = armyc2.c2sd.renderer.utilities.SymbolDefTable;
            var oParameters = {
                transaction: oTransaction,
                EmpDrawEditItem: oEmpItem,
                feature: oFeature,
                instanceInterface: oPrivateInterface,
                basicSymbolCode: sBasicSymbolCode,
                SymbolDef: oSymbolDef,
                multiPoint: isMultiPoint
            };

            if (!isMultiPoint) {
                oEditor = new leafLet.editor.MilStdSinglePoint(oParameters);
            } else switch (oSymbolDef.drawCategory) {
                /**
                * A polyline, a line with n number of points.
                * 0 control points
                */
                case oSymbolDefTable.DRAW_CATEGORY_LINE:
                /**
                * A polyline with n points (entered in reverse order)
                * 0 control points
                */
                case oSymbolDefTable.DRAW_CATEGORY_ARROW:
                    oEditor = new leafLet.editor.MilStdDCLine(oParameters);
                    break;
                /**
                * An animated shape, uses the animate function to draw.
                * 0 control points (every point shapes symbol)
                */
                case oSymbolDefTable.DRAW_CATEGORY_AUTOSHAPE:
                    oEditor = new leafLet.editor.MilStdDCAutoShape(oParameters);
                    break;
                /**
                * An enclosed polygon with n points
                * 0 control points
                */
                case oSymbolDefTable.DRAW_CATEGORY_POLYGON:
                    oEditor = new leafLet.editor.MilStdDCPolygon(oParameters);
                    break;
                /**
                * A graphic with n points whose last point defines the width of the graphic.
                * 1 control point
                */
                case oSymbolDefTable.DRAW_CATEGORY_ROUTE:
                    oEditor = new leafLet.editor.MilStdDCRoute(oParameters);
                    break;
                /**
                * A line defined only by 2 points, and cannot have more.
                * 0 control points
                */
                case oSymbolDefTable.DRAW_CATEGORY_TWOPOINTLINE:
                /**
                * A polyline with 2 points (entered in reverse order).
                * 0 control points
                */
                case oSymbolDefTable.DRAW_CATEGORY_TWOPOINTARROW:
                    oEditor = new leafLet.editor.MilStdDC2PointLine(oParameters);
                    break;
                /**
                * Shape is defined by a single point
                * 0 control points
                */
                case oSymbolDefTable.DRAW_CATEGORY_POINT:
                    oEditor = new leafLet.editor.MilStdSinglePoint(oParameters);
                    break;
                /**
                * An animated shape, uses the animate function to draw. Super Autoshape draw
                * in 2 phases, usually one to define length, and one to define width.
                * 0 control points (every point shapes symbol)
                *
                */
                case oSymbolDefTable.DRAW_CATEGORY_SUPERAUTOSHAPE:
                    oEditor = new leafLet.editor.MilStdDCSuperAutoShape(oParameters);
                    break;
                /**
                 * Circle that requires 1 AM modifier value.
                 * See ModifiersTG.js for modifier descriptions and constant key strings.
                 */
                case oSymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE:
                    oEditor = new leafLet.editor.MilStdDCCircularAutoShape(oParameters);
                    break;
                /**
                 * Rectangle that requires 2 AM modifier values and 1 AN value.";
                 * See ModifiersTG.js for modifier descriptions and constant key strings.
                 */
                case oSymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE:
                    oEditor = new leafLet.editor.MilStdDCRectParamAutoShape(oParameters);
                    break;
                /**
                 * Requires 2 AM values and 2 AN values per sector.
                 * The first sector can have just one AM value although it is recommended
                 * to always use 2 values for each sector.  X values are not required
                 * as our rendering is only 2D for the Sector Range Fan symbol.
                 * See ModifiersTG.js for modifier descriptions and constant key strings.
                 */
                case oSymbolDefTable.DRAW_CATEGORY_SECTOR_PARAMETERED_AUTOSHAPE:
                    oEditor = new leafLet.editor.MilStdDCSectorParamAutoShape(oParameters);
                    break;
                /**
                 *  Requires at least 1 distance/AM value"
                 *  See ModifiersTG.js for modifier descriptions and constant key strings.
                 */
                case oSymbolDefTable.DRAW_CATEGORY_CIRCULAR_RANGEFAN_AUTOSHAPE:
                    oEditor = new leafLet.editor.MilStdDCCircularRangeFan(oParameters);
                    break;
                /**
                 * Requires 1 AM value.
                 * See ModifiersTG.js for modifier descriptions and constant key strings.
                 */
                case oSymbolDefTable.DRAW_CATEGORY_TWO_POINT_RECT_PARAMETERED_AUTOSHAPE:
                    oEditor = new leafLet.editor.MilStdDC2PointRectAutoShape(oParameters);
                    break;
                /**
                 * 3D airspace, not a milstd graphic.
                 */
                case oSymbolDefTable.DRAW_CATEGORY_3D_AIRSPACE:
                    break;
                }

            return oEditor;
        }
    };

    var publicInterface = {
        areModifierValuesEqual: function(oValue1, oValue2) {
            if ((oValue1 instanceof Array) !== (oValue2 instanceof Array)) {
                // One is an array the other is not.
                return false;
            } else if (typeof oValue1 !== typeof oValue2) {
                return false;
            }

            if (oValue1 instanceof Array) {
                if (oValue1.length !== oValue2.length) {
                    // They are diff sizes.
                    return false;
                }

                for (var iIndex = 0; iIndex < oValue1.length; iIndex++) {
                    if (oValue1[iIndex] !== oValue2[iIndex]) {
                        // Diff value.
                        return false;
                    }
                }
            } else if (typeof oValue1 === 'object') {
                var sValue1 = JSON.stringify(oValue1);
                var sValue2 = JSON.stringify(oValue2);

                if (sValue1 !== sValue2) {
                    // Diff value.
                    return false;
                }
            } else if (oValue1 !== oValue2) {
                // Diff value.
                return false;
            }

            return true;
        },
        getRequiredModifiers: function(sBasicSymbol, i2525Version) {
            var sReqModifiers = "";
            var oSymbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(sBasicSymbol, i2525Version);
            var oSymDefTable = armyc2.c2sd.renderer.utilities.SymbolDefTable;
            var oBasicCodes = leafLet.utils.milstd.basicSymbolCode;

            if (oSymbolDef !== null) {
                switch (oSymbolDef.drawCategory) {
                case oSymDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE:
                    // Requires 1 AM.
                    sReqModifiers = "AM";
                    break;
                case oSymDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE:
                    // Requires 2 AM, 1 AN
                    sReqModifiers = "AM.AM1.AN";
                    break;
                case oSymDefTable.DRAW_CATEGORY_SECTOR_PARAMETERED_AUTOSHAPE:
                    // Requires 1 or more AMs, (2 * (the # AM)) ANs
                    sReqModifiers = "AM#.AN#";
                    break;
                case oSymDefTable.DRAW_CATEGORY_CIRCULAR_RANGEFAN_AUTOSHAPE:
                    // Requires 1 - 3 AMs.
                    sReqModifiers = "AM.AM1.AM2";
                    break;
                case oSymDefTable.DRAW_CATEGORY_TWO_POINT_RECT_PARAMETERED_AUTOSHAPE:
                    // Requires 1 AM.
                    sReqModifiers = "AM";
                    break;
                }

                switch (sBasicSymbol) {
                case oBasicCodes.AIR_CORRIDOR:
                case oBasicCodes.MINIMUM_RISK_ROUTE:
                case oBasicCodes.STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE:
                case oBasicCodes.UBMANNED_AERIAL_VEHICLE_ROUTE:
                case oBasicCodes.LOW_LEVEL_TRANSIT_ROUTE:
                    // Requires 1 AM.
                    sReqModifiers = "AM";
                    break;
                default:
                    break;
                }
            }

            return sReqModifiers;
        },
        applyRequiredModifiers: function(sSymbolCode, oModifier, i2525Version, oMap) {
            var sBasicSymbolCode = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(sSymbolCode);
            var sRequiredModifiers = publicInterface.getRequiredModifiers(sBasicSymbolCode, i2525Version);

            if (sRequiredModifiers.length === 0) {
                return;
            }

            var oRequiredModifiers = sRequiredModifiers.split(".");

            for (var iIndex = 0; iIndex < oRequiredModifiers.length; iIndex++) {
                if (oRequiredModifiers[iIndex].length === 0) {
                    continue;
                }
                privateInterface.checkModifier(sBasicSymbolCode, oRequiredModifiers[iIndex], oModifier, i2525Version, oMap);
            }
        },
        convertModifiersTo2525: function(args) {
            var sColor;
            var oModifiers = {};
            var oProperties = args.properties || {};
            var oPropModifiers = oProperties.modifiers || {};
            var longModifiers = leafLet.utils.milstd.longModifiers;
            var o2525Modifiers = leafLet.utils.milstd.Modifiers;

            //var modifierOnList = function(sModifier)
            //{
            //    return ((args.instanceInterface.oLabelList.indexOf(sModifier) === -1)? false: true);
            //};

            if (!oPropModifiers.hasOwnProperty(longModifiers.STANDARD) && !oPropModifiers.hasOwnProperty(o2525Modifiers.STANDARD)) {
                oPropModifiers[longModifiers.STANDARD] = emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B;
            }

            for (var sModifier in oPropModifiers) {
                if (!oPropModifiers.hasOwnProperty(sModifier)) {
                    continue;
                }
                var s2525Modifier = leafLet.utils.milstd.stringToModifiers[sModifier] || sModifier;
                /*
                                switch (s2525Modifier)
                                {
                                    case o2525Modifiers.STANDARD:
                                    case o2525Modifiers.AZIMUTH:
                                    case o2525Modifiers.DISTANCE:
                                    case o2525Modifiers.ALTITUDE_DEPTH:
                                        break;
                                    default:
                                        if (!modifierOnList(s2525Modifier))
                                        {
                                            // Its not on the list, jump over it.
                                            continue;
                                        }
                                        break;
                                }
                */
                if (s2525Modifier) {
                    if ((s2525Modifier === o2525Modifiers.STANDARD) && (typeof (oPropModifiers[sModifier]) === 'string')) {
                        //oModifiers[sModifier] = oPropModifiers[sModifier];
                        oModifiers[s2525Modifier] = emp.typeLibrary.featureMilStdVersionType.convertToNumeric(oPropModifiers[sModifier]);
                    } else {
                        oModifiers[s2525Modifier] = emp.helpers.copyObject(oPropModifiers[sModifier]);
                    }
                } else {
                    oModifiers[sModifier] = emp.helpers.copyObject(oPropModifiers[sModifier]);
                }
            }

            if (!emp.util.isEmptyString(oProperties[longModifiers.LINE_COLOR])) {
                sColor = oProperties[longModifiers.LINE_COLOR];
                if (sColor.length > 5) {
                    sColor = sColor.substr(sColor.length - 6, 6);
                }
                oModifiers[longModifiers.LINE_COLOR] = sColor;
            }

            if (!emp.util.isEmptyString(oProperties[longModifiers.FILL_COLOR])) {
                sColor = oProperties[longModifiers.FILL_COLOR];
                if (sColor.length > 5) {
                    sColor = sColor.substr(sColor.length - 6, 6);
                }
                oModifiers[longModifiers.FILL_COLOR] = sColor;
            }

            return oModifiers;
        },
        createEditor: function(oPrivateInterface, oTransaction, oEmpItem, oFeature) {
            var sSymbolCode;
            var i2525Version;

            if (oFeature) {
                var oModifiers = oFeature.getMilStdModifiers();
                sSymbolCode = oFeature.getData().symbolCode;
                i2525Version = oModifiers[leafLet.utils.milstd.Modifiers.STANDARD];
                i2525Version = i2525Version || 0;
            } else {
                // Its definitly a draw.
                var oProperties = oEmpItem.properties;
                var oModifiers = (oProperties? oProperties.modifiers: undefined);
                var symStd = (oModifiers? oModifiers[leafLet.utils.milstd.longModifiers.STANDARD]: "2525b");
                i2525Version = emp.typeLibrary.featureMilStdVersionType.convertToNumeric(symStd);
                sSymbolCode = oEmpItem.symbolCode;
            }

            var sBasicSymbolCode = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(sSymbolCode);
            var oSymbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(sBasicSymbolCode, i2525Version);

            return privateInterface.createMilStdEditor(oPrivateInterface, oTransaction, oFeature, oEmpItem, sBasicSymbolCode, oSymbolDef, i2525Version);
        },
        renderMPGraphic: function(oArgs) {
            //oArgs = {instanceInterface, isSelected, sID, sName, sDescription, sSymbolCode, oCoordData, oModifiers, i2525Version, empMapBounds}
            var iOutputFormat = 2;
            var oMap = oArgs.instanceInterface.getLeafletMap();
            var mapBounds = oMap.getBounds();
            var empMapBounds = oArgs.empMapBounds; // oMap.getBounds();
            var oRenderer = sec.web.renderer.SECWebRenderer;
            var sCoordinateStr = leafLet.utils.geoJson.convertCoordinatesToString(oArgs.oCoordData);
            var iZoom = oMap.getZoom();
            var dScale = oArgs.instanceInterface.getScale(iZoom);
            var dMaxLabelScale = oArgs.instanceInterface.dMaxLabelScale;
            var sBBox = null;
            var oDimension = oMap.getSize();
            var cModifiers = leafLet.utils.milstd.longModifiers;
            var bIsSelected = oArgs.oFeature.isSelected();
            var oSelectAttributes = oArgs.instanceInterface.selectAttributes;
            var bIDLInView = empMapBounds.containsIDL();
            var pointConverter = new leafLet.utils.renderer.PointConverter(oMap, oDimension.x, oDimension.y, mapBounds, empMapBounds);
            
            if ((mapBounds.getEast() - mapBounds.getWest()) < 180.0) {
                sBBox = empMapBounds.getWest() + "," + empMapBounds.getSouth() + "," + empMapBounds.getEast() + "," + empMapBounds.getNorth();
            }
            //console.log("BBox: " + sBBox);
            //console.log("    map BBox: " + mapBounds.getWest() + "," + mapBounds.getSouth() + "," + mapBounds.getEast() + "," + mapBounds.getNorth());
            //console.log("  center lng: " + oMap.getCenter().lng);
            //console.log("      size x: " + oDimension.x + " y:" + oDimension.y);

            try {
                var sGeoJsonData = oRenderer.RenderSymbol2D(oArgs.sID, oArgs.sName, oArgs.sDescription, oArgs.sSymbolCode, sCoordinateStr, oDimension.x, oDimension.y, sBBox, oArgs.oModifiers, iOutputFormat, oArgs.i2525Version, null, pointConverter);
                var oGeoJson = JSON.parse(sGeoJsonData);
/*
                console.log("Call to RenderSymbol2D:\n" +
                        "Symbol Code: " + oArgs.sSymbolCode + "\n" +
                        "id: " + oArgs.sID + "\n" +
                        "name: " + oArgs.sName + "\n" +
                        "description: " + oArgs.sDescription + "\n" +
                        "coordinates: " + sCoordinateStr + "\n" +
                        "width: " + oDimension.x + "\n" +
                        "height: " + oDimension.y + "\n" +
                        "bbox: " + sBBox + "\n" +
                        "modifiers: " + JSON.stringify(oArgs.oModifiers) + "\n" +
                        "outFormat: " + iOutputFormat + "\n" +
                        "2525 version: " + oArgs.i2525Version + "\n" +
                        "geoJSON returned:\n" + sGeoJsonData + "\n"
                        );
*/
                var oLeaftletGeoJSON = new L.GeoJSON(oGeoJson, {
                    style: function (oGeoJsonfeature) {
                        var oStyle = {};

                        switch (oGeoJsonfeature.geometry.type) {
                        case 'Point':
                            break;
                        case 'LineString':
                        case 'MultiLineString':
                            oStyle.color = oGeoJsonfeature.properties.strokeColor;
                            oStyle.opacity = oGeoJsonfeature.properties.lineOpacity;
                            oStyle.weight = oGeoJsonfeature.properties.strokeWidth;

                            if (bIsSelected) {
                                oStyle.tempColor = oStyle.color;
                                oStyle.tempWeight = oStyle.weight;
                                oStyle.color = '#' + oSelectAttributes.color;
                                oStyle.weight = oSelectAttributes.width;
                            }
                            break;
                        case 'Polygon':
                        case 'MultiPolygon':
                            oStyle.color = oGeoJsonfeature.properties.strokeColor;
                            oStyle.opacity = oGeoJsonfeature.properties.lineOpacity;
                            oStyle.weight = oGeoJsonfeature.properties.strokeWidth;
                            oStyle.fillColor = oGeoJsonfeature.properties.fillColor;
                            oStyle.fillOpacity = oGeoJsonfeature.properties.fillOpacity;

                            if (bIsSelected) {
                                oStyle.tempColor = oStyle.color;
                                oStyle.tempWeight = oStyle.weight;
                                oStyle.color = '#' + oSelectAttributes.color;
                                oStyle.weight = oSelectAttributes.width;
                            }
                            break;
                        }
                        oStyle.oFeature = oArgs.oFeature;
                        return oStyle;
                    },
                    pointToLayer: function(oGeoJsonfeature, latlng) {
                        var sLabelText = ((dScale <= dMaxLabelScale)? oGeoJsonfeature.properties.label: " ");
                        var iTextPixelDim = emp.helpers.getStringPixelDimensions(sLabelText,
                                            oGeoJsonfeature.properties.fontFamily,
                                            oGeoJsonfeature.properties.fontSize + "pt",
                                            oGeoJsonfeature.properties.fontWeight);
                        var iXOffset = 0;
                        var iYOffset = 0;
                        var myIcon;
                        var sTextAlignment = 'center';
                        //var sVerticalAlignment = 'baseline';

                        if (oGeoJsonfeature.properties.hasOwnProperty('labelAlign')) {
                            sTextAlignment = oGeoJsonfeature.properties.labelAlign.toLowerCase();
                            switch (sTextAlignment) {
                            case 'center':
                                iXOffset = Math.floor(iTextPixelDim.width / 2);
                                break;
                            case 'left':
                                iXOffset = 0;
                                break;
                            case 'right':
                                iXOffset = iTextPixelDim.width;
                                break;
                            }
                        }

                        if (oGeoJsonfeature.properties.hasOwnProperty('labelBaseline')) {
                            switch (oGeoJsonfeature.properties.labelBaseline) {
                            case 'alphabetic': // baseline
                                //sVerticalAlignment = 'baseline';
                                iYOffset = Math.floor(iTextPixelDim.height * 0.75);
                                break;
                            case 'top': // Top
                                //sVerticalAlignment = 'top';
                                iYOffset = 0;
                                break;
                            case 'middle': // middle
                                //sVerticalAlignment = 'middle';
                                iYOffset = Math.floor(iTextPixelDim.height / 2);
                                break;
                            case 'bottom': // Bottom
                                //sVerticalAlignment = 'bottom';
                                iYOffset = iTextPixelDim.height;
                                break;
                            }
                        }

                        myIcon = new L.DivIcon({
                            className: "milstdMPtext",
                            html: "<p " +
                            "style='font-family:" + oGeoJsonfeature.properties.fontFamily + "; " +
                            "font-size:" + oGeoJsonfeature.properties.fontSize + "pt; " +
                            "line-height: 1.2; " +
                            "white-space: nowrap; " +
                            "font-weight:" + oGeoJsonfeature.properties.fontWeight + "; " +
                            "color:" + oGeoJsonfeature.properties.fontColor + "; " +
//                                    "text-align:" + sTextAlignment + ";" +
//                                    "vertical-align:" + sVerticalAlignment + ";" +
                            "-webkit-transform: rotate(" + oGeoJsonfeature.properties.angle + "deg); " +
                            "-moz-transform: rotate(" + oGeoJsonfeature.properties.angle + "deg); " +
                            "-o-transform: rotate(" + oGeoJsonfeature.properties.angle + "deg); " +
                            "transform: rotate(" + oGeoJsonfeature.properties.angle + "deg);'>" +
                            sLabelText + "</p>",
                            iconSize: new L.Point(iTextPixelDim.width, iTextPixelDim.height),
                            iconAnchor: new L.Point(iXOffset, iYOffset)
                        });
                        return new L.Marker(latlng, {
                            icon: myIcon,
                            oFeature: oArgs.oFeature
                        });
                    },
                    onEachFeature: function (feature, layer) {
                        //filterCoordinates(layer);
                    },
                    coordsToLatLng: function(oCoord) {
                        var latLng = new L.LatLng(oCoord[1], oCoord[0]);
                        return latLng;
                    }
                });

                if (oLeaftletGeoJSON instanceof L.LayerGroup) {
                    if (oLeaftletGeoJSON.getLayers().length === 1) {
                        // The object created is a group but it only has one
                        // object in it.
                        // Make that object the object returned.
                        oLeaftletGeoJSON = oLeaftletGeoJSON.getLayers()[0];
                    } else if (oLeaftletGeoJSON.getLayers().length === 0) {
                        // This happens when the graphic bounding box intersects the map
                        // but there is nonthing to draw in the graphics bounding
                        // box portion that is visible.
                        oLeaftletGeoJSON = undefined;
                    }
                }

                if (oLeaftletGeoJSON instanceof L.LayerGroup) {
                    var oNewChildren = [];

                    // If the object is a group make sure we flaten
                    // all sub groups.
                    var FlantenGroup = function(oGroup) {
                        var oChild;
                        var oChildren = oGroup.getLayers();

                        for (var iIndex = 0; iIndex < oChildren.length; iIndex++) {
                            oChild = oChildren[iIndex];

                            oGroup.removeLayer(oChild);
                            if (oChild instanceof L.LayerGroup) {
                                FlantenGroup(oChild);
                            } else {
                                oNewChildren.push(oChild);
                            }
                        }
                    };

                    while(oLeaftletGeoJSON.getLayers().length > 0) {
                        var oChild = oLeaftletGeoJSON.getLayers()[0];

                        oLeaftletGeoJSON.removeLayer(oChild);
                        if (oChild instanceof L.LayerGroup) {
                            FlantenGroup(oChild);
                        } else {
                            oNewChildren.push(oChild);
                        }
                    }

                    for (var iIndex = 0; iIndex < oNewChildren.length; iIndex++) {
                        oLeaftletGeoJSON.addLayer(oNewChildren[iIndex]);
                    }
                }
            } catch (Ex) {
                console.log("GeoJSON Error:\n" +
                            "Symbol Code: " + oArgs.sSymbolCode + "\n" +
                            "id: " + oArgs.sID + "\n" +
                            "name: " + oArgs.sName + "\n" +
                            "description: " + oArgs.sDescription + "\n" +
                            "coordinates: " + sCoordinateStr + "\n" +
                            "width: " + oDimension.x + "\n" +
                            "height: " + oDimension.y + "\n" +
                            "bbox: " + sBBox + "\n" +
                            "modifiers: " + JSON.stringify(oArgs.oModifiers) + "\n" +
                            "outFormat: " + iOutputFormat + "\n" +
                            "2525 version: " + oArgs.i2525Version + "\n" +
                            "geoJSON returned:\n" + sGeoJsonData + "\n"
                           );
                throw Ex;
            }

            return oLeaftletGeoJSON;
        },
        createTGFromDraw: function(oEnginePrivateInterface, oLeafletMap, oSymbolDef, sBasicSymbolCode, oDrawItem) {
            var oCoordList = [];
            var oFeature = undefined;
            var oSymbolDefTable = armyc2.c2sd.renderer.utilities.SymbolDefTable;
            var oBasicCodes = leafLet.utils.milstd.basicSymbolCode;
            var oMapBounds = oLeafletMap.getBounds();
            var oMapSouthWest = oMapBounds.getSouthWest().wrap();
            var oMapNorthEast = oMapBounds.getNorthEast().wrap();
            var oMapCenter = oMapBounds.getCenter();
            var oMapCenterWest = new L.LatLng(oMapCenter.lat, oMapSouthWest.lng, 0);
            var oMapCenterEast = new L.LatLng(oMapCenter.lat, oMapNorthEast.lng, 0);
            var oMapCenterNorth = new L.LatLng(oMapNorthEast.lat, oMapCenter.lng, 0);
            var oMapCenterSouth = new L.LatLng(oMapSouthWest.lat, oMapCenter.lng, 0);
            var dViewWidth = oMapCenterWest.distanceTo(oMapCenterEast);
            var dViewHeight = oMapCenterSouth.distanceTo(oMapCenterNorth);
            var dQtrWidth = Math.floor(dViewWidth / 4);
            var d3rdHeight = Math.floor(dViewHeight / 3);
            var iStdVersion = emp.typeLibrary.featureMilStdVersionType.convertToNumeric();
            var dBrng;
            var dBrngInc;
            var oGeoJsonData = {
                symbolCode: oDrawItem.symbolCode,
                type: 'LineString',
                coordinates: []
            };
            var oProperties = emp.helpers.copyObject(oDrawItem.properties);
            var oModifiers = leafLet.utils.milstd.convertModifiersTo2525(oDrawItem);
            var o2525Modifiers = leafLet.utils.milstd.Modifiers;
            var iStdVersion = oModifiers[o2525Modifiers.STANDARD] || 0;

            oProperties.modifiers = oModifiers;

            switch (oSymbolDef.drawCategory) {
            case oSymbolDefTable.DRAW_CATEGORY_LINE: // A polyline, a line with n number of points.
            case oSymbolDefTable.DRAW_CATEGORY_ARROW: // A polyline, a line with n number of points.
                oCoordList.push(oMapCenter.destinationPoint(270.0, dQtrWidth));
                oCoordList.push(oMapCenter.destinationPoint(90.0, dQtrWidth));
                break;
            case oSymbolDefTable.DRAW_CATEGORY_AUTOSHAPE: // N points.
                switch (sBasicSymbolCode) {
                case oBasicCodes.TASK_ISOLATE:
                case oBasicCodes.TASK_OCCUPY:
                case oBasicCodes.TASK_RETIAN:
                case oBasicCodes.TASK_SECURE:
                case oBasicCodes.TASK_CORDON_SEARCH:
                case oBasicCodes.TASK_CORDON_KNOCK:
                    oCoordList.push(oMapCenter);
                    oCoordList.push(oMapCenter.destinationPoint(45.0, d3rdHeight));
                    break;
                case oBasicCodes.MINIMUM_SAFE_DISTANCE_ZONES:
                    oCoordList.push(oMapCenter);
                    oCoordList.push(oMapCenter.destinationPoint(45.0, dQtrWidth / 2.0));
                    oCoordList.push(oMapCenter.destinationPoint(45.0, dQtrWidth));
                    oCoordList.push(oMapCenter.destinationPoint(45.0, dQtrWidth * 1.5));
                    break;
                default:
                    dBrng = 240.0;
                    dBrngInc = 360.0 / oSymbolDef.minPoints;
                    oCoordList.push(oMapCenter.destinationPoint(dBrng, dQtrWidth));
                    while (oCoordList.length < oSymbolDef.minPoints) {
                        dBrng += dBrngInc;
                        oCoordList.push(oMapCenter.destinationPoint(dBrng, dQtrWidth));
                    }
                    break;
                }
                break;
            case oSymbolDefTable.DRAW_CATEGORY_POLYGON: // Polygon with N points.
                dBrng = 240.0;
                dBrngInc = 360.0 / oSymbolDef.minPoints;
                oCoordList.push(oMapCenter.destinationPoint(dBrng, dQtrWidth));
                while (oCoordList.length < oSymbolDef.minPoints) {
                    dBrng += dBrngInc;
                    oCoordList.push(oMapCenter.destinationPoint(dBrng, dQtrWidth));
                }
                break;
            case oSymbolDefTable.DRAW_CATEGORY_ROUTE: // A graphic with n points whose last point defines the width of the graphic.
                oCoordList.push(oMapCenter.destinationPoint(270.0, dQtrWidth));
                oCoordList.push(oMapCenter.destinationPoint(90.0, dQtrWidth));
                oCoordList.push(oMapCenter.destinationPoint(260.0, dQtrWidth * 0.9));
                break;
            case oSymbolDefTable.DRAW_CATEGORY_TWOPOINTLINE: // A line defined only by 2 points, and cannot have more.
            case oSymbolDefTable.DRAW_CATEGORY_TWOPOINTARROW: // A polyline with 2 points (entered in reverse order).
            case oSymbolDefTable.DRAW_CATEGORY_TWO_POINT_RECT_PARAMETERED_AUTOSHAPE: // 2 points.
                oCoordList.push(oMapCenter.destinationPoint(270.0, dQtrWidth));
                oCoordList.push(oMapCenter.destinationPoint(90.0, dQtrWidth));
                break;
            case oSymbolDefTable.DRAW_CATEGORY_POINT: // Shape is defined by a single point
            case oSymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE: // 1 point
            case oSymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE: // 1 point.
            case oSymbolDefTable.DRAW_CATEGORY_CIRCULAR_RANGEFAN_AUTOSHAPE: // 1 point.
                oCoordList.push(oMapCenter);
                break;
            case oSymbolDefTable.DRAW_CATEGORY_SECTOR_PARAMETERED_AUTOSHAPE: // 1 point.
                oCoordList.push(oMapCenter.destinationPoint(180.0, d3rdHeight));
                break;
            case oSymbolDefTable.DRAW_CATEGORY_SUPERAUTOSHAPE: // N Points.
                switch (sBasicSymbolCode) {
                case oBasicCodes.CCGM_OFFENCE_SUPPORT_BY_FIRE_POSITION:
                    dBrng = 315.0;
                    oCoordList.push(oMapCenter.destinationPoint(315.0,  dQtrWidth));
                    oCoordList.push(oMapCenter.destinationPoint(225.0, dQtrWidth));
                    oCoordList.push(oMapCenter.destinationPoint(45.0, dQtrWidth));
                    oCoordList.push(oMapCenter.destinationPoint(135.0, dQtrWidth));
                    break;
                default:
                    dBrng = 240.0;
                    dBrngInc = 360.0 / oSymbolDef.minPoints;
                    oCoordList.push(oMapCenter.destinationPoint(dBrng, dQtrWidth));
                    while (oCoordList.length < oSymbolDef.minPoints) {
                        dBrng += dBrngInc;
                        oCoordList.push(oMapCenter.destinationPoint(dBrng, dQtrWidth));
                    }
                    break;
                }
                break;
            }

            if (oCoordList.length === 1) {
                oGeoJsonData.type = 'Point';
            }

            leafLet.utils.geoJson.convertLatLngListToGeoJson(oGeoJsonData, oCoordList);

            switch (oSymbolDef.drawCategory) {
            case oSymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE:
                // Requires 1 AM.
                if (!oModifiers.hasOwnProperty(o2525Modifiers.DISTANCE)) {
                    oModifiers[o2525Modifiers.DISTANCE] = [dQtrWidth];
                } else if (!(oModifiers[o2525Modifiers.DISTANCE] instanceof Array)
                           && oModifiers[o2525Modifiers.DISTANCE]) {
                    oModifiers[o2525Modifiers.DISTANCE] = [oModifiers[o2525Modifiers.DISTANCE]];
                } else if (oModifiers[o2525Modifiers.DISTANCE].length === 0) {
                    oModifiers[o2525Modifiers.DISTANCE] = [dQtrWidth];
                }
                break;
            case oSymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE:
                // Requires 2 AM, 1 AN
                if (!oModifiers.hasOwnProperty(o2525Modifiers.DISTANCE)) {
                    oModifiers[o2525Modifiers.DISTANCE] = [];
                } else if (!(oModifiers[o2525Modifiers.DISTANCE] instanceof Array)) {
                    oModifiers[o2525Modifiers.DISTANCE] = [];
                }

                if (oModifiers[o2525Modifiers.DISTANCE].length === 0) {
                    oModifiers[o2525Modifiers.DISTANCE] = [dQtrWidth, Math.floor(dQtrWidth / 2)];
                } else if (oModifiers[o2525Modifiers.DISTANCE].length < 2) {
                    oModifiers[o2525Modifiers.DISTANCE].push(Math.floor(dQtrWidth / 2));
                }

                if (!oModifiers.hasOwnProperty(o2525Modifiers.AZIMUTH)) {
                    oModifiers[o2525Modifiers.AZIMUTH] = [];
                } else if (!(oModifiers[o2525Modifiers.AZIMUTH] instanceof Array)) {
                    oModifiers[o2525Modifiers.AZIMUTH] = [];
                }

                if (oModifiers[o2525Modifiers.AZIMUTH].length === 0) {
                    oModifiers[o2525Modifiers.AZIMUTH] = [0];
                }
                break;
            case oSymbolDefTable.DRAW_CATEGORY_SECTOR_PARAMETERED_AUTOSHAPE:
                // Requires 1 or more AMs, and 2 ANs per AM.
                if (!oModifiers.hasOwnProperty(o2525Modifiers.DISTANCE)) {
                    oModifiers[o2525Modifiers.DISTANCE] = [d3rdHeight];
                } else if (!(oModifiers[o2525Modifiers.DISTANCE] instanceof Array)) {
                    oModifiers[o2525Modifiers.DISTANCE] = [d3rdHeight];
                }

                if (!oModifiers.hasOwnProperty(o2525Modifiers.AZIMUTH)) {
                    oModifiers[o2525Modifiers.AZIMUTH] = [];
                } else if (!(oModifiers[o2525Modifiers.AZIMUTH] instanceof Array)) {
                    oModifiers[o2525Modifiers.AZIMUTH] = [];
                }

                if (oModifiers[o2525Modifiers.AZIMUTH].length === 0) {
                    oModifiers[o2525Modifiers.AZIMUTH].push(315.0);
                }

                if (oModifiers[o2525Modifiers.AZIMUTH].length < 2) {
                    oModifiers[o2525Modifiers.AZIMUTH].push(45.0);
                }
                break;
            case oSymbolDefTable.DRAW_CATEGORY_CIRCULAR_RANGEFAN_AUTOSHAPE:
                // Requires 1 AMs.
                /*
                                    if (!oModifiers.hasOwnProperty(o2525Modifiers.DISTANCE))
                                    {
                                        oModifiers[o2525Modifiers.DISTANCE] = [d3rdHeight];
                                    }
                                    else if (!(oModifiers[o2525Modifiers.DISTANCE] instanceof Array))
                                    {
                                        oModifiers[o2525Modifiers.DISTANCE] = [d3rdHeight];
                                    }
                                    else if (oModifiers[o2525Modifiers.DISTANCE].length < 1)
                                    {
                                        oModifiers[o2525Modifiers.DISTANCE] = [d3rdHeight];
                                    }
                */
                break;
            case oSymbolDefTable.DRAW_CATEGORY_TWO_POINT_RECT_PARAMETERED_AUTOSHAPE:
                // Requires 1 AM.
                if (!oModifiers.hasOwnProperty(o2525Modifiers.DISTANCE)) {
                    oModifiers[o2525Modifiers.DISTANCE] = [d3rdHeight];
                } else if (!(oModifiers[o2525Modifiers.DISTANCE] instanceof Array)) {
                    oModifiers[o2525Modifiers.DISTANCE] = [d3rdHeight];
                } else if (oModifiers[o2525Modifiers.DISTANCE].length < 1) {
                    oModifiers[o2525Modifiers.DISTANCE] = [d3rdHeight];
                }
                break;
            }

            switch (sBasicSymbolCode) {
            case oBasicCodes.AIR_CORRIDOR:
            case oBasicCodes.MINIMUM_RISK_ROUTE:
            case oBasicCodes.STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE:
            case oBasicCodes.UBMANNED_AERIAL_VEHICLE_ROUTE:
            case oBasicCodes.LOW_LEVEL_TRANSIT_ROUTE:
                // Requires 1 AM.
                if (!oModifiers.hasOwnProperty(o2525Modifiers.DISTANCE)) {
                    oModifiers[o2525Modifiers.DISTANCE] = [Math.floor(dQtrWidth / 2)];
                } else if (!(oModifiers[o2525Modifiers.DISTANCE] instanceof Array)) {
                    oModifiers[o2525Modifiers.DISTANCE] = [Math.floor(dQtrWidth / 2)];
                } else if (oModifiers[o2525Modifiers.DISTANCE].length < 1) {
                    oModifiers[o2525Modifiers.DISTANCE] = [Math.floor(dQtrWidth / 2)];
                }
                break;
            default:
                break;
            }

            oFeature = new leafLet.typeLibrary.MilStdFeature({
                item: {
                    name: oDrawItem.name,
                    coreId: oDrawItem.coreId,
                    parentCoreId: oDrawItem.parentCoreId,
                    visible: true,
                    featureId: oDrawItem.featureId,
                    overlayId: oDrawItem.overlayId,
                    parentId: oDrawItem.parentId,
                    format: emp.typeLibrary.featureFormatType.MILSTD,
                    data: oGeoJsonData,
                    properties: oProperties
                },
                instanceInterface: oEnginePrivateInterface
            });

            return oFeature;
        }
    };

    return publicInterface;
}());

leafLet.utils.milstd.longModifiers = {
    QUANTITY: "quantity",
    REDUCED_OR_REINFORCED: "reinforcedOrReduced",
    STAFF_COMMENTS: "staffComments",
    ADDITIONAL_INFO_1: "additionalInfo1",
    ADDITIONAL_INFO_2: "additionalInfo2",
    ADDITIONAL_INFO_3: "additionalInfo3",
    EVALUATION_RATING: "evaluationRating",
    COMBAT_EFFECTIVENESS: "combatEffectiveness",
    SIGNATURE_EQUIPMENT: "signatureEquipment",
    HIGHER_FORMATION: "higherFormation",
    HOSTILE: "hostile",
    IFF_SIF: "iffSif",
    DIRECTION_OF_MOVEMENT: "directionOfMovement",
    OFFSET_INDICATOR: "offsetIndicator",
    UNIQUE_DESIGNATOR_1: "uniqueDesignation1",
    UNIQUE_DESIGNATOR_2: "uniqueDesignation2",
    EQUIPMENT_TYPE: "equipmentType",
    DATE_TIME_GROUP: "dateTimeGroup1",
    DATE_TIME_GROUP_2: "dateTimeGroup2",
    ALTITUDE_DEPTH: "altitudeDepth",
    LOCATION: "location",
    SPEED: "speed",
    SPECIAL_C2_HEADQUARTERS: "specialC2Headquarters",
    DISTANCE: "distance",
    AZIMUTH: "azimuth",
    FILL_COLOR: "fillColor",
    LINE_COLOR: "lineColor",
    X_OFFSET: "xOffset",
    X_UNITS: "xUnits",
    Y_OFFSET: "yOffset",
    Y_UNITS: "yUnits",
    SIZE: "size",
    LINE_THICKNESS: "lineThickness",
    HEADING: "heading",
    STANDARD: "standard"
};

leafLet.utils.milstd.Modifiers = {
    QUANTITY: "C",
    REDUCED_OR_REINFORCED: "F",
    STAFF_COMMENTS: "G",
    ADDITIONAL_INFO_1: "H",
    ADDITIONAL_INFO_2: "H1",
    ADDITIONAL_INFO_3: "H2",
    EVALUATION_RATING: "J",
    COMBAT_EFFECTIVENESS: "K",
    SIGNATURE_EQUIPMENT: "L",
    HIGHER_FORMATION: "M",
    HOSTILE: "N",
    IFF_SIF: "P",
    DIRECTION_OF_MOVEMENT: "Q",
    OFFSET_INDICATOR: "S",
    UNIQUE_DESIGNATOR_1: "T",
    UNIQUE_DESIGNATOR_2: "T1",
    EQUIPMENT_TYPE: "V",
    DATE_TIME_GROUP: "W",
    DATE_TIME_GROUP_2: "W1",
    ALTITUDE_DEPTH: "X",
    LOCATION: "Y",
    SPEED: "Z",
    SPECIAL_C2_HEADQUARTERS: "AA",
    DISTANCE: "AM",
    AZIMUTH: "AN",
    STANDARD: "SYMSTD"
};

leafLet.utils.milstd.stringToModifiers = (function() {
    var mapping = {};
    var longModifiers = leafLet.utils.milstd.longModifiers;
    var s2525Modifiers = leafLet.utils.milstd.Modifiers;

    mapping[longModifiers.QUANTITY] = s2525Modifiers.QUANTITY;
    mapping[longModifiers.REDUCED_OR_REINFORCED] = s2525Modifiers.REDUCED_OR_REINFORCED;
    mapping[longModifiers.STAFF_COMMENTS] = s2525Modifiers.STAFF_COMMENTS;
    mapping[longModifiers.ADDITIONAL_INFO_1] = s2525Modifiers.ADDITIONAL_INFO_1;
    mapping[longModifiers.ADDITIONAL_INFO_2] = s2525Modifiers.ADDITIONAL_INFO_2;
    mapping[longModifiers.ADDITIONAL_INFO_3] = s2525Modifiers.ADDITIONAL_INFO_3;
    mapping[longModifiers.EVALUATION_RATING] = s2525Modifiers.EVALUATION_RATING;
    mapping[longModifiers.COMBAT_EFFECTIVENESS] = s2525Modifiers.COMBAT_EFFECTIVENESS;
    mapping[longModifiers.SIGNATURE_EQUIPMENT] = s2525Modifiers.SIGNATURE_EQUIPMENT;
    mapping[longModifiers.HIGHER_FORMATION] = s2525Modifiers.HIGHER_FORMATION;
    mapping[longModifiers.HOSTILE] = s2525Modifiers.HOSTILE;
    mapping[longModifiers.IFF_SIF] = s2525Modifiers.IFF_SIF;
    mapping[longModifiers.DIRECTION_OF_MOVEMENT] = s2525Modifiers.DIRECTION_OF_MOVEMENT;
    mapping[longModifiers.OFFSET_INDICATOR] = s2525Modifiers.OFFSET_INDICATOR;
    mapping[longModifiers.UNIQUE_DESIGNATOR_1] = s2525Modifiers.UNIQUE_DESIGNATOR_1;
    mapping[longModifiers.UNIQUE_DESIGNATOR_2] = s2525Modifiers.UNIQUE_DESIGNATOR_2;
    mapping[longModifiers.EQUIPMENT_TYPE] = s2525Modifiers.EQUIPMENT_TYPE;
    mapping[longModifiers.DATE_TIME_GROUP] = s2525Modifiers.DATE_TIME_GROUP;
    mapping[longModifiers.DATE_TIME_GROUP_2] = s2525Modifiers.DATE_TIME_GROUP_2;
    mapping[longModifiers.ALTITUDE_DEPTH] = s2525Modifiers.ALTITUDE_DEPTH;
    mapping[longModifiers.LOCATION] = s2525Modifiers.LOCATION;
    mapping[longModifiers.SPEED] = s2525Modifiers.SPEED;
    mapping[longModifiers.SPECIAL_C2_HEADQUARTERS] = s2525Modifiers.SPECIAL_C2_HEADQUARTERS;
    mapping[longModifiers.DISTANCE] = s2525Modifiers.DISTANCE;
    mapping[longModifiers.AZIMUTH] = s2525Modifiers.AZIMUTH;
    mapping[longModifiers.FILL_COLOR] = longModifiers.FILL_COLOR;
    mapping[longModifiers.LINE_COLOR] = longModifiers.LINE_COLOR;
    mapping[longModifiers.X_OFFSET] = longModifiers.X_OFFSET;
    mapping[longModifiers.X_UNITS] = longModifiers.X_UNITS;
    mapping[longModifiers.Y_OFFSET] = longModifiers.Y_OFFSET;
    mapping[longModifiers.Y_UNITS] = longModifiers.Y_UNITS;
    mapping[longModifiers.SIZE] = longModifiers.SIZE;
    mapping[longModifiers.LINE_THICKNESS] = longModifiers.LINE_THICKNESS;
    mapping[longModifiers.HEADING] = s2525Modifiers.DIRECTION_OF_MOVEMENT;
    mapping[longModifiers.STANDARD] = s2525Modifiers.STANDARD;

    return mapping;
}());

leafLet.utils.milstd.o2525ModifierToLong = (function() {
    var mapping = {};
    var longModifiers = leafLet.utils.milstd.longModifiers;
    var s2525Modifiers = leafLet.utils.milstd.Modifiers;

    mapping[s2525Modifiers.QUANTITY] = longModifiers.QUANTITY;
    mapping[s2525Modifiers.REDUCED_OR_REINFORCED] = longModifiers.REDUCED_OR_REINFORCED;
    mapping[s2525Modifiers.STAFF_COMMENTS] = longModifiers.STAFF_COMMENTS;
    mapping[s2525Modifiers.ADDITIONAL_INFO_1] = longModifiers.ADDITIONAL_INFO_1;
    mapping[s2525Modifiers.ADDITIONAL_INFO_2] = longModifiers.ADDITIONAL_INFO_2;
    mapping[s2525Modifiers.ADDITIONAL_INFO_3] = longModifiers.ADDITIONAL_INFO_3;
    mapping[s2525Modifiers.EVALUATION_RATING] = longModifiers.EVALUATION_RATING;
    mapping[s2525Modifiers.COMBAT_EFFECTIVENESS] = longModifiers.COMBAT_EFFECTIVENESS;
    mapping[s2525Modifiers.SIGNATURE_EQUIPMENT] = longModifiers.SIGNATURE_EQUIPMENT;
    mapping[s2525Modifiers.HIGHER_FORMATION] = longModifiers.HIGHER_FORMATION;
    mapping[s2525Modifiers.HOSTILE] = longModifiers.HOSTILE;
    mapping[s2525Modifiers.IFF_SIF] = longModifiers.IFF_SIF;
    mapping[s2525Modifiers.DIRECTION_OF_MOVEMENT] = longModifiers.DIRECTION_OF_MOVEMENT;
    mapping[s2525Modifiers.OFFSET_INDICATOR] = longModifiers.OFFSET_INDICATOR;
    mapping[s2525Modifiers.UNIQUE_DESIGNATOR_1] = longModifiers.UNIQUE_DESIGNATOR_1;
    mapping[s2525Modifiers.UNIQUE_DESIGNATOR_2] = longModifiers.UNIQUE_DESIGNATOR_2;
    mapping[s2525Modifiers.EQUIPMENT_TYPE] = longModifiers.EQUIPMENT_TYPE;
    mapping[s2525Modifiers.DATE_TIME_GROUP] = longModifiers.DATE_TIME_GROUP;
    mapping[s2525Modifiers.DATE_TIME_GROUP_2] = longModifiers.DATE_TIME_GROUP_2;
    mapping[s2525Modifiers.ALTITUDE_DEPTH] = longModifiers.ALTITUDE_DEPTH;
    mapping[s2525Modifiers.LOCATION] = longModifiers.LOCATION;
    mapping[s2525Modifiers.SPEED] = longModifiers.SPEED;
    mapping[s2525Modifiers.SPECIAL_C2_HEADQUARTERS] = longModifiers.SPECIAL_C2_HEADQUARTERS;
    mapping[s2525Modifiers.DISTANCE] = longModifiers.DISTANCE;
    mapping[s2525Modifiers.AZIMUTH] = longModifiers.AZIMUTH;
    mapping[longModifiers.FILL_COLOR] = longModifiers.FILL_COLOR;
    mapping[longModifiers.LINE_COLOR] = longModifiers.LINE_COLOR;
    mapping[longModifiers.X_OFFSET] = longModifiers.X_OFFSET;
    mapping[longModifiers.X_UNITS] = longModifiers.X_UNITS;
    mapping[longModifiers.Y_OFFSET] = longModifiers.Y_OFFSET;
    mapping[longModifiers.Y_UNITS] = longModifiers.Y_UNITS;
    mapping[longModifiers.SIZE] = longModifiers.SIZE;
    mapping[longModifiers.LINE_THICKNESS] = longModifiers.LINE_THICKNESS;
    mapping[s2525Modifiers.HEADING] = longModifiers.DIRECTION_OF_MOVEMENT;
    mapping[s2525Modifiers.STANDARD] = longModifiers.STANDARD;

    return mapping;
}());

leafLet.utils.milstd.basicSymbolCode = {
    AIR_CORRIDOR: "G*G*ALC---****X",
    STANDARD_ARMY_AIRCRAFT_FLIGHT_ROUTE: "G*G*ALS---****X",
    MINIMUM_RISK_ROUTE: "G*G*ALM---****X",
    UBMANNED_AERIAL_VEHICLE_ROUTE: "G*G*ALU---****X",
    LOW_LEVEL_TRANSIT_ROUTE: "G*G*ALL---****X",
    AIRSPACE_COORDINATION_AREA_IRREGULAR: "G*F*ACAI--****X",
    AIRSPACE_COORDINATION_AREA_RECTANGULAR: "G*F*ACAR--****X",
    AIRSPACE_COORDINATION_AREA_CIRCULAR: "G*F*ACAC--****X",
    RESTRICTED_OPERATIONS_ZONE: "G*G*AAR---****X",
    HIGH_DENSITY_AIRSPACE_CONTROL_ZONE: "G*G*AAH---****X",
    MISSILE_ENGAGEMENT_ZONE: "G*G*AAM---****X",
    MISSILE_ENGAGEMENT_ZONE_LOW_ALTITUDE: "G*G*AAML--****X",
    MISSILE_ENGAGEMENT_ZONE_HIGH_ALTITUDE: "G*G*AAMH--****X",

    CIRCULAR_RANGE_FAN: "G*F*AXC---****X",
    SECTOR_RANGE_FAN: "G*F*AXS---****X",

    RECTANGULAR_TARGET: "G*F*ATR---****X",
    CIRCULAR_TARGET: "G*FPATC---****X",

    FORD_EASY: "G*M*BCE---****X",
    FORD_DIFFICULT: "G*M*BCD---****X",

    ROADBLOCK_COMPLETE_EXECUTED: "G*M*ORC---****X",
    MINIMUM_SAFE_DISTANCE_ZONES: "G*M*NM----****X",

    SEIZE: "G*T*Z-----****X",

    AMBUSH: "G*G*SLA---****X",
    BLOCK_TASK: "G*T*B-----****X",
    TASK_ISOLATE: "G*T*E-----****X",
    TASK_OCCUPY: "G*T*O-----****X",
    TASK_RETIAN: "G*T*Q-----****X",
    TASK_SECURE: "G*T*S-----****X",
    TASK_CORDON_SEARCH: "G*T*V-----****X",
    TASK_CORDON_KNOCK: "G*T*2-----****X",

    CCGM_OFFENCE_SUPPORT_BY_FIRE_POSITION: "G*G*OAS---****X",

    BRIDGE_OR_GAP: "G*M*BCB---****X",
    ASSAULT_CROSSING_AREA: "G*M*BCA---****X",

    // Only in 2525B
    FORWARD_AREA_AIR_DEFENSE_ZONE: "G*G*AAF---****X",
    // Same Symbol Code with diff name in 2525C
    SHORT_RANGE_AIR_DEFENSE_ENGAGEMENT_ZONE: "G*G*AAF---****X",

    // Only in 2525B
    KILL_BOX_PURPLE_CIRCULAR: "G*F*AKPC--****X",
    KILL_BOX_PURPLE_RECTANGULAR: "G*F*AKPR--****X",
    KILL_BOX_PURPLE_IRREGULAR: "G*F*AKPI--****X"
};


emp.typeLibrary.featureMilStdVersionType.convertToString = function(iValue) {
    var sRet = emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B;
    switch (iValue) {
    case 0:
        sRet = emp.typeLibrary.featureMilStdVersionType.MILSTD_2525B;
        break;
    case 1:
        sRet = emp.typeLibrary.featureMilStdVersionType.MILSTD_2525C;
        break;
    }

    return sRet;
};
