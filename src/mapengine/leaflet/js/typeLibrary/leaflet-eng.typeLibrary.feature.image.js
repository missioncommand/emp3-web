/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.ImageFeature = function(){
    var publicInterface = {
        initialize: function (args)
        {
            var options = {
                oLatLngList: this._convertBBox(args.item.params),
                sImageURL: args.item.url
            };
            L.Util.setOptions(this, options);

            leafLet.typeLibrary.Feature.prototype.initialize.call(this, args);
        },
        _convertBBox: function(oBBox)
        {
            //{"left": 40.0,"right": 45.0,"top": 40.0,"bottom": 35.0}
            var oLatLngList = [];
            
            oLatLngList.push(new L.LatLng(oBBox.bottom, oBBox.left));
            oLatLngList.push(new L.LatLng(oBBox.top, oBBox.right));
            
            return oLatLngList;
        },
        _createFeature: function(args)
        {
            var oLeafletObject;
            
            oLeafletObject = new L.ImageOverlay(args.sImageURL, args.oLatLngList);
            
            return oLeafletObject;
        },
        _updateFeature: function(oArgs)
        {
            var oLeafletObject;
            var oOptions = {
                sImageURL: oArgs.url,
                oLatLngList: this._convertBBox(oArgs.params)
            };
            
            oLeafletObject = this._createFeature(oOptions);
            this.options.sImageURL = oOptions.url;
            this.options.oLatLngList = oOptions.params;
            
            if (oArgs.hasOwnProperty('name'))
            {
                this.setName(oArgs.name);
            }
            
            return oLeafletObject;
        },
        getPopupText: function()
        {
            // Each feature class can override this function.
            return "<center><b>URL:&nbsp;" + this.getURL + "</b></center><br/>" +
                    this._getPopupDescription();
        },
        getFeatureBounds: function()
        {
            var oBounds = undefined;
            var oLeafletObject = this.getLeafletObject();
            var oLatLngList = this.getParams();

            if (oLeafletObject)
            {
                oBounds = new leafLet.typeLibrary.EmpBoundary(oLatLngList[0].wrap(), oLatLngList[1].wrap());
            }

            return oBounds;
        },
        getURL: function()
        {
            return this.options.sImageURL;
        },
        getParams: function()
        {
            return this.options.oLatLngList;
        },
        render: function()
        {
            if (this.isVisible())
            {
                var oNewLeafletObject = this._createFeature(this.options);

                if (oNewLeafletObject)
                {
                    this.setLeafletObject(oNewLeafletObject);
                }
            }
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.ImageFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.ImageFeature());
