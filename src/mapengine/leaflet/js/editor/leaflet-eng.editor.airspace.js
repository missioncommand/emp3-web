
/* global leafLet, armyc2, L, emp */

leafLet.internalPrivateClass.AirspaceEditor = function()
{
    var publicInterface = {
        initialize: function (args)
        {
            var oOptions = {
            };
            L.Util.setOptions(this, oOptions);

            leafLet.editor.AbstractEditor.prototype.initialize.call(this, args);
        },
        preapareForDrawOperation: function()
        {
            if (this.getFeature() === undefined)
            {
                var oGeoJsonData;
                var cAirspaceType = emp.typeLibrary.airspaceSymbolCode;

                switch (this.options.oEmpDrawEditItem.symbolCode)
                {
                    case cAirspaceType.SHAPE3D_CYLINDER:
                    case cAirspaceType.SHAPE3D_RADARC:
                        oGeoJsonData = {
                            symbolCode: this.options.oEmpDrawEditItem.symbolCode,
                            type: 'Point',
                            coordinates: []
                        };
                        break;
                    //case cAirspaceType.SHAPE3D_POLYGON:
                    //case cAirspaceType.SHAPE3D_ORBIT:
                    //case cAirspaceType.SHAPE3D_ROUTE:
                    //case cAirspaceType.SHAPE3D_TRACK:
                    //case cAirspaceType.SHAPE3D_POLYARC:
                    //case cAirspaceType.SHAPE3D_CURTAIN:
                    default:
                        oGeoJsonData = {
                            symbolCode: this.options.oEmpDrawEditItem.symbolCode,
                            type: 'LineString',
                            coordinates: []
                        };
                        break;
                }

                this.options.feature = leafLet.utils.airspace.createAirspace({
                    item: {
                        name: this.options.oEmpDrawEditItem.name,
                        coreId: this.options.oEmpDrawEditItem.coreId,
                        parentCoreId: this.options.oEmpDrawEditItem.parentCoreId,
                        visible: true,
                        featureId: this.options.oEmpDrawEditItem.featureId,
                        overlayId: this.options.oEmpDrawEditItem.overlayId,
                        parentId: this.options.oEmpDrawEditItem.parentId,
                        format: emp3.api.enums.FeatureTypeEnum.GEO_ACM,
                        data: oGeoJsonData,
                        properties: this.options.oEmpDrawEditItem.properties
                    },
                    instanceInterface: this.getEngineInstanceInterface()
                });
                this.addLayer(this.options.feature);
                this.options.bDestroyFeature = true;
            }
            this.preapareForEditOperation();
        },
        preapareForEditOperation: function()
        {
        },
        getCoordinateList: function()
        {
            return leafLet.utils.geoJson.convertCoordinatesToLatLng(this.getFeature().getData());
        },
        setCoordinates: function(oLatLngList)
        {
            leafLet.utils.geoJson.convertLatLngListToGeoJson(this.getFeature().getData(), oLatLngList);
        },
        updateLeafletObject: function(oCList)
        {
            var oFeature = this.getFeature();
            var oCoordList = oCList || this.getCoordinateList();

            if (oCoordList.length >= oFeature.getMinPoints())
            {
                var oLeafletObject;
                var cAirspaceType = emp.typeLibrary.airspaceSymbolCode;
                var oAttributeList = oFeature.getAttributeList();

                oFeature.getProperties()['attributes'] = oAttributeList.getAirspaceAttributeList();

                switch (this.options.oEmpDrawEditItem.symbolCode)
                {
                    case cAirspaceType.SHAPE3D_CURTAIN:
                    case cAirspaceType.SHAPE3D_POLYGON:
                        var oMapBounds = this.getLeafletMap().getBounds();

                        leafLet.utils.wrapCoordinates(oMapBounds, oCoordList, false);
                        oLeafletObject = this.getLeafletObject();
                        oLeafletObject.setLatLngs(oCoordList);
                        break;
                    case cAirspaceType.SHAPE3D_CYLINDER:
                    case cAirspaceType.SHAPE3D_ORBIT:
                    case cAirspaceType.SHAPE3D_ROUTE:
                    case cAirspaceType.SHAPE3D_TRACK:
                    case cAirspaceType.SHAPE3D_RADARC:
                    case cAirspaceType.SHAPE3D_POLYARC:
                    default:
                        oLeafletObject = oFeature._createFeature(oFeature.options);
                        this.setLeafletObject(oLeafletObject);
                        break;
                }

                return true;
            }

            return false;
        },
        doFeatureMove: function(dBearing, dDistance)
        {
            var oCoordList = this.getCoordinateList();
            var oCPList = this.options.oControlPointList;
            var oCoord;
            var iCoordIndex;

            for (var iIndex = 0; iIndex < oCPList.length; iIndex++)
            {
                iCoordIndex = oCPList[iIndex].getIndex();
                oCoord = oCPList[iIndex].getPosition();
                oCoord.moveCoordinate(dBearing, dDistance);
                oCPList[iIndex].setCPPosition(oCoord);
                if (oCPList[iIndex].getType() === leafLet.ControlPoint.Type.POSITION_CP)
                {
                    oCoordList[iCoordIndex] = oCoord;
                }
            }
            this.setCoordinates(oCoordList);
            this.updateLeafletObject();

            return true;
        }
   };

    return publicInterface;
};

leafLet.editor.Airspace = leafLet.editor.AbstractEditor.extend(leafLet.internalPrivateClass.AirspaceEditor());
