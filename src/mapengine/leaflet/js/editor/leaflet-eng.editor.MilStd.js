
/* global leafLet, armyc2, L, emp */

leafLet.internalPrivateClass.MilStdEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            var oOptions = {
                bMultiPoint: args.multiPoint,
                sBasicSymbolCode: args.basicSymbolCode,
                oSymbolDef: args.SymbolDef,
                oMilStdModifiers: undefined,
                oCurrentCoordianteList: []
            };
            L.Util.setOptions(this, oOptions);
            
            leafLet.editor.AbstractEditor.prototype.initialize.call(this, args);
        },
        isMultiPoint: function()
        {
            return this.options.bMultiPoint;
        },
        getBasicSymbolCode: function()
        {
            return this.options.sBasicSymbolCode;
        },
        getSymbolDef: function()
        {
            return this.options.oSymbolDef;
        },
        preapareForDrawOperation: function()
        {
            if (this.getFeature() === undefined)
            {
                var oFeature;
                var oDrawItem = this.options.oEmpDrawEditItem;
                
                if (this.isMultiPoint())
                {
                    oFeature = leafLet.utils.milstd.createTGFromDraw(
                            this.getEngineInstanceInterface(),
                            this.getLeafletMap(),
                            this.getSymbolDef(),
                            this.getBasicSymbolCode(),
                            oDrawItem
                    );
                }
                else
                {
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
                            data: {
                                symbolCode: oDrawItem.symbolCode,
                                type: 'Point',
                                coordinates: []
                            },
                            properties: emp.helpers.copyObject(oDrawItem.properties)
                        },
                        instanceInterface: this.getEngineInstanceInterface()
                    });
                }
                this.setFeature(oFeature);
                this.options.bDestroyFeature = true;
            }
            this.preapareForEditOperation();
        },
        preapareForEditOperation: function()
        {
            var oRendererUtils = armyc2.c2sd.renderer.utilities;
            var oFeature = this.getFeature();
            var oData = oFeature.getData();
            var sSymbolCode = oData.symbolCode;
            
            this.options.oMilStdModifiers = oFeature.options.oMilStdModifiers;
            this.options.sBasicSymbolCode = oRendererUtils.SymbolUtilities.getBasicSymbolID(sSymbolCode);
            this.options.bMultiPoint = oFeature.isMultiPointTG();
            this.options.oSymbolDef = oRendererUtils.SymbolDefTable.getSymbolDef(this.options.sBasicSymbolCode, oFeature.get2525Version());
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
            var oSymbolDef = this.getSymbolDef();
            var oCoordList = oCList || this.getCoordinateList();
                    
            if (!this.isMultiPoint() || (oCoordList.length >= oSymbolDef.minPoints))
            {
                var oFeature = this.getFeature();
                var oModifiers = oFeature.getMilStdModifiers();

                oFeature.getProperties()['modifiers'] = oModifiers.toLongModifiers();
                var oLeafletObject = oFeature._createFeature(oFeature.options);
                this.setLeafletObject(oLeafletObject);
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

leafLet.editor.MilStd = leafLet.editor.AbstractEditor.extend(leafLet.internalPrivateClass.MilStdEditor());
