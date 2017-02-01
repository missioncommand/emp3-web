/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.OvalObject = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
                oMap: args.leafletMap,
                width: args.width,
                oAttributes: args.attributes,
                oOvalCoordList: args.coordinates,
                isSelected: args.isSelected,
                selectAttributes: args.selectAttributes,
                oCoordList: [],
                oPolygonOptions: {},
                oFeature: args.oFeature
            };
            
            if (!(args.coordinates instanceof Array))
            {
                throw new Error("Invalid coordinates type. It must be a 2 element array of L.LatLng objects.");
            }
            else if (args.coordinates.length !== 2)
            {
                throw new Error("Invalid number of elements. It must be a 2 element array of L.LatLng objects.");
            }
            
            L.Util.setOptions(this, options);
                
            this._generatePolygon();

            L.Polygon.prototype.initialize.call(this, this.options.oCoordList, this.options.oPolygonOptions);
        },
        isSelected: function()
        {
            return this.options.isSelected;
        },
        _generatePolygon: function()
        {
            var oPartialCoordList;
            var cAirspaceAttribute = leafLet.typeLibrary.AirspaceAttribute;
            var oAttributes = this.options.oAttributes;
            var dWidth = this.options.width;
            var oMap = this.options.oMap;
            var oPt1 = this.options.oOvalCoordList[0];
            var oPt2 = this.options.oOvalCoordList[1];
            var dBearingPt1Pt2 = oPt1.bearingTo(oPt2);
            var dRadius = dWidth / 2.0;
            var dLeftBearing = (dBearingPt1Pt2 + 270.0) % 360;
            var dRightBearing = (dBearingPt1Pt2 + 90.0) % 360;
            var oCoordList = this.options.oCoordList;
            var oLineColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_COLOR));
            var oFillColor = leafLet.utils.convertColor(oAttributes.getValue(cAirspaceAttribute.AIRSPACE_FILL_COLOR));
            var oPolygonOptions = this.options.oPolygonOptions;
            
            oPolygonOptions.stroke = true;
            oPolygonOptions.color = oLineColor.sColor;
            oPolygonOptions.opacity = oLineColor.opacity;
            oPolygonOptions.fill = true;
            oPolygonOptions.fillColor = oFillColor.sColor;
            oPolygonOptions.fillOpacity = oFillColor.opacity;
            oPolygonOptions.weight = oAttributes.getValue(cAirspaceAttribute.AIRSPACE_LINE_WIDTH);

            if (this.isSelected())
            {
                var oSelectAttributes = this.options.selectAttributes;
                
                oPolygonOptions.tempColor = oPolygonOptions.color;
                oPolygonOptions.tempWeight = oPolygonOptions.weight;
                
                oPolygonOptions.color = '#' + oSelectAttributes.color;
                oPolygonOptions.weight = oSelectAttributes.width;
            }

            if (oCoordList.length > 0)
            {
                // Clear the coordinates.
                oCoordList.splice(0, oCoordList.length);
            }

            oPartialCoordList = leafLet.utils.getArcCoordinates(oMap, oPt1, dRadius, dLeftBearing, dRightBearing, false);
            
            for  (var iIndex = 0; iIndex < oPartialCoordList.length; iIndex++)
            {
                oCoordList.push(oPartialCoordList[iIndex]);
            }

            oPartialCoordList = leafLet.utils.getArcCoordinates(oMap, oPt2, dRadius, dRightBearing, dLeftBearing, false);
                
            for  (var iIndex = 0; iIndex < oPartialCoordList.length; iIndex++)
            {
                oCoordList.push(oPartialCoordList[iIndex]);
            }

//console.log("Oval points: " + oCoordList.length);
        }
    };

    return publicInterface;
};

leafLet.utils.OvalObject = L.Polygon.extend(leafLet.internalPrivateClass.OvalObject());
