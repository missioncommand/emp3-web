
/* global L, leafLet */

leafLet.internalPrivateClass.MilStdSinglePointEditor = function()
{
    var publicInterface = {
        initialize: function (args) 
        {
            //var oOptions = {
            //};
            //L.Util.setOptions(this, oOptions);
            
            leafLet.editor.MilStd.prototype.initialize.call(this, args);
        },
        assembleControlPoints: function()
        {
            var oCoordList = this.getCoordinateList();
            
            if (oCoordList.length === 0)
            {
                return;
            }
            
            var oLeafletObject = this.getLeafletObject();

            if (oLeafletObject instanceof L.Marker)
            {
                //oLeafletObject.unbindPopup();
                this.setMarkerPopup();
            }
        },
        doAddControlPoint: function(oLatLng)
        {
            var oFeature = this.getFeature();
            var oCoordList = this.getCoordinateList();

            if (oCoordList.length !== 0)
            {
                return undefined;
            }
            
            oCoordList.push(oLatLng);
            this.setCoordinates(oCoordList);
            
            var oLeafletObject = oFeature._createFeature(oFeature.options);

            this.setLeafletObject(oLeafletObject);

            return undefined;
        },
        doFeatureMove: function(dBearing, dDistance)
        {
            var oLeafletObject = this.getLeafletObject();
            var oCoordList = this.getCoordinateList();

            oCoordList[0].moveCoordinate(dBearing, dDistance);
            this.setCoordinates(oCoordList);
            oLeafletObject.setLatLng(oCoordList[0]);
            
            this.setMarkerPopup();
            return true;
        }
   };

    return publicInterface;
};

leafLet.editor.MilStdSinglePoint = leafLet.editor.MilStd.extend(leafLet.internalPrivateClass.MilStdSinglePointEditor());
