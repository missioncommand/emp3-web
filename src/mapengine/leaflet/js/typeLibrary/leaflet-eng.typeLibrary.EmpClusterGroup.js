/* global leafLet, emp, L */

leafLet.internalPrivateClass.EmpClusterGroup = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
                oOverlay: args.overlay,
                instanceInterface: args.instanceInterface
            };
            L.Util.setOptions(this, options);

            var oClusterDef = args.overlay.getClusterDef();
            var oThis = this;
            
            L.MarkerClusterGroup.prototype.initialize.call(this, {
                maxClusterRadius: oClusterDef.getDistance(),
                zoomToBoundsOnClick: false,
                iconCreateFunction: function(oCluster){
                    return oThis._iconCreateFunction(oCluster);
                }
            });
        },
        getOverlay: function()
        {
            return this.options.oOverlay;
        },
        _ParamReplacementCB: function(oCluster, sParam)
        {
            var sRet = "";
            var oOverlay = this.getOverlay();
            var oClusterDef = oOverlay.getClusterDef();
            
            switch (sParam.toLowerCase())
            {
                case 'count':
                    sRet = oCluster.getChildCount().toString();
                    break;
                case 'name':
                    sRet = oOverlay.getName() || "";
                    break;
                case 'description':
                    sRet = oOverlay.getDescription() || "";
                    break;
                case 'featurenames':
                    var oFeatureList = oCluster.getAllChildMarkers();
                    
                    for (var iIndex = 0; iIndex < oFeatureList.length; iIndex++)
                    {
                        if (typeof (oFeatureList[iIndex].getName) === 'function')
                        {
                            sRet += oFeatureList[iIndex].getName();
                            sRet += "<br/>";
                        }
                    }
                    break;
                case 'maxclusterradius':
                    sRet = oClusterDef.getDistance() + "m";
                    break;
                case 'styletype':
                    var oClusterStyle = oClusterDef.getClusterStyle();
                    
                    if (oClusterStyle.getIconStyle())
                    {
                        sRet = "Icon Style";
                    }
                    else if (oClusterStyle.getPointStyle())
                    {
                        sRet = "Point Style";
                    }
                    break;
            }

            return sRet;
        },
        _setClusterHeadingText: function(oCluster)
        {
            var oThis = this;
            var sPopupText = "";
            var oOverlay = this.getOverlay();
            var oClusterDef = oOverlay.getClusterDef();
            var oClusterStyle = oClusterDef.getClusterStyle();
            var sTitle = emp.helpers.getReplacementString(oClusterStyle.getTitle(),
                function(sParam)
                {
                    return oThis._ParamReplacementCB(oCluster, sParam);
                }
            );

            if (sTitle.length > 0)
            {
                sPopupText += sTitle;
            }
            
            oCluster.setPopupHeading(sPopupText);
        },
        _setClusterPopupText: function(oCluster)
        {
            var oThis = this;
            var sPopupText = "";
            var oOverlay = this.getOverlay();
            var oClusterDef = oOverlay.getClusterDef();
            var oClusterStyle = oClusterDef.getClusterStyle();
            var sSummary = emp.helpers.getReplacementString(oClusterStyle.getSummary(), function(sParam)
                {
                    return oThis._ParamReplacementCB(oCluster, sParam);
                });
            var sDescription = emp.helpers.getReplacementString(oClusterStyle.getDescription(), function(sParam)
                {
                    return oThis._ParamReplacementCB(oCluster, sParam);
                });

            if (sSummary.length > 0)
            {
                sPopupText += sSummary + "<br/>";
            }

            if (sDescription.length > 0)
            {
                sPopupText += sDescription + "<br/>";
            }
            
            oCluster.setPopupText(sPopupText);
        },
        _iconCreateFunction: function(oCluster)
        {
            var oClusterIcon;
            var oThis = this;
            var oOverlay = this.getOverlay();
            var oClusterDef = oOverlay.getClusterDef();
            var oClusterStyle = oClusterDef.getClusterStyle();
            var oIconStyle = oClusterStyle.getIconStyle();
            var oPointStyle = oClusterStyle.getPointStyle();
            
            oCluster.options.overlay = oOverlay;

            if (oIconStyle)
            {
                var sStr = emp.helpers.getReplacementString(oClusterStyle.getLabel(), function(sParam)
                    {
                        return oThis._ParamReplacementCB(oCluster, sParam);
                    });

                var sURL = emp.helpers.getReplacementString(oIconStyle.getURL(), function(sParam)
                    {
                        return oThis._ParamReplacementCB(oCluster, sParam);
                    });

                if (sStr && sStr.length > 0)
                {
                    oClusterIcon = new L.DivIcon({
                        className: "iconStyleDiv",
                        html: "<table><tbody><tr><td><img class='iconStyleDivIcon' src='" + sURL + "'></td><td class='iconStyleDivLabel'>" + sStr + "</td></tr></tbody></table>"
                    });
                }
                else
                {
                    oClusterIcon = new L.Icon({
                        url: sURL
                    });
                }
            }
            else if (oPointStyle)
            {
                var sStr = emp.helpers.getReplacementString(oClusterStyle.getLabel(), function(sParam)
                    {
                        return oThis._ParamReplacementCB(oCluster, sParam);
                    });
                var sLabel = sStr.replace(" ", "\n");

                var oImage = oPointStyle.createIcon(sLabel);
                var iRadius = oPointStyle.getRadius();
                oClusterIcon = new L.Icon({
                    iconUrl: oImage.toDataURL(),
                    iconAnchor: new L.Point(iRadius, iRadius),
                    iconSize: new L.Point(oImage.width, oImage.height),
                    popupAnchor:  new L.Point(iRadius, 0)
                });
            }
            else
            {
                var sStr = emp.helpers.getReplacementString(oClusterStyle.getLabel(), function(sParam)
                    {
                        return oThis._ParamReplacementCB(oCluster, sParam);
                    });
                var sLabel = sStr.replace(" ", "\n");
                var iRadius = 25;
                var oImage = emp.helpers.createCircleCanvas({
                        iRadius: iRadius,
                        dOpacity: 1.0,
                        sStrokeColor: "darkBlue",
                        sFillColor: "lightblue",
                        sTextColor: "black",
                        sText: sLabel
                    });

                oClusterIcon = new L.Icon({
                    iconUrl: oImage.toDataURL(),
                    iconAnchor: new L.Point(iRadius / 2, iRadius / 2),
                    iconSize: new L.Point(oImage.width, oImage.height),
                    popupAnchor:  new L.Point(iRadius, 0)
                });
            }

            this._setClusterPopupText(oCluster);
            this._setClusterHeadingText(oCluster);

            oCluster.on('click', function(oEvent){
                if (oThis.getEngineInstanceInterface())
                {
                    oThis.getEngineInstanceInterface().handleFeatureClicked(oEvent);
                }
            }, this);

            oCluster.on('contextmenu', function(oEvent){
                if (oThis.getEngineInstanceInterface())
                {
                    oThis.getEngineInstanceInterface().handleFeatureClicked(oEvent);
                }
            }, this);

            return oClusterIcon;
        },
        addLayer: function (layer) {
            if (layer instanceof leafLet.typeLibrary.Feature)
            {
                var oChild;
                var oKeyList = layer.getChildKeyList();

                // If its a multi point TG we do not add it.
                if ((layer.getFormat() !== emp.typeLibrary.featureFormatType.MILSTD) ||
                        !layer.isMultiPointTG())
                {
                    if (layer.getLeafletObject())
                    {
                        var oThis = this;
                        var oLeafletObject = layer.getLeafletObject();
                        layer.removeLayer(oLeafletObject);
                        this.addLayer(oLeafletObject);

                        oLeafletObject.on('click', function(oEvent){
                            if (oThis.getEngineInstanceInterface())
                            {
                                oEvent.target = layer;
                                oThis.getEngineInstanceInterface().handleFeatureClicked(oEvent);
                            }
                        }, this);

                        oLeafletObject.on('contextmenu', function(oEvent){
                            if (oThis.getEngineInstanceInterface())
                            {
                                oEvent.target = layer;
                                oThis.getEngineInstanceInterface().handleFeatureClicked(oEvent);
                            }
                        }, this);
                    }
                }

                // Now we check to see if it
                // has children to add.
                if (layer.hasChildren())
                {
                    for (var iIndex = 0; iIndex < oKeyList.length; iIndex++)
                    {
                        oChild = layer.getChild(oKeyList[iIndex]);
                        this.addLayer(oChild);
                    }
                }
                return this;
            }

            if (layer instanceof L.LayerGroup) {
                for (var i in layer._layers) {
                    this.addLayer(layer._layers[i]);
                }
                return this;
            }

            //Don't cluster non point data
            if (!layer.getLatLng) {
                    this._nonPointGroup.addLayer(layer);
                    return this;
            }

            if (!this._map) {
                    this._needsClustering.push(layer);
                    return this;
            }

            if (this.hasLayer(layer)) {
                    return this;
            }


            //If we have already clustered we'll need to add this one to a cluster

            if (this._unspiderfy) {
                    this._unspiderfy();
            }

            this._addLayer(layer, this._maxZoom);

            //Work out what is visible
            var visibleLayer = layer,
                    currentZoom = this._map.getZoom();
            if (layer.__parent) {
                    while (visibleLayer.__parent._zoom >= currentZoom) {
                            visibleLayer = visibleLayer.__parent;
                    }
            }

            if (this._currentShownBounds.contains(visibleLayer.getLatLng())) {
                    if (this.options.animateAddingMarkers) {
                            this._animationAddLayer(layer, visibleLayer);
                    } else {
                            this._animationAddLayerNonAnimated(layer, visibleLayer);
                    }
            }
            return this;
        },
        removeLayer: function (layer) {
            if (layer instanceof leafLet.typeLibrary.Feature)
            {
                var oChild;
                var oKeyList = layer.getChildKeyList();

                // If its a multi point TG we do not process it.
                if ((layer.getFormat() !== emp.typeLibrary.featureFormatType.MILSTD) ||
                        !layer.isMultiPointTG())
                {
                    if (layer.getLeafletObject())
                    {
                        var oLeafletObject = layer.getLeafletObject();

                        this.removeLayer(oLeafletObject);
                        layer.addLayer(oLeafletObject);

                        oLeafletObject.off('click', function(oEvent){}, this);
                        oLeafletObject.off('contextmenu', function(oEvent){}, this);
                    }
                }

                // Now we check to see if it
                // has children to process.
                if (layer.hasChildren())
                {
                    for (var iIndex = 0; iIndex < oKeyList.length; iIndex++)
                    {
                        oChild = layer.getChild(oKeyList[iIndex]);
                        this.removeLayer(oChild);
                    }
                }
                return this;
            }

            if (layer instanceof L.LayerGroup)
            {
                    for (var i in layer._layers) {
                        this.removeLayer(layer._layers[i]);
                    }
                    return this;
            }

            //Non point layers
            if (!layer.getLatLng) {
                    this._nonPointGroup.removeLayer(layer);
                    return this;
            }

            if (!this._map) {
                    if (!this._arraySplice(this._needsClustering, layer) && this.hasLayer(layer)) {
                            this._needsRemoving.push(layer);
                    }
                    return this;
            }

            if (!layer.__parent) {
                    return this;
            }

            if (this._unspiderfy) {
                    this._unspiderfy();
                    this._unspiderfyLayer(layer);
            }

            //Remove the marker from clusters
            this._removeLayer(layer, true);

            if (this._featureGroup.hasLayer(layer)) {
                    this._featureGroup.removeLayer(layer);
                    if (layer.clusterShow) {
                            layer.clusterShow();
                    }
            }

            return this;
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.EmpClusterGroup = L.MarkerClusterGroup.extend(leafLet.internalPrivateClass.EmpClusterGroup());
