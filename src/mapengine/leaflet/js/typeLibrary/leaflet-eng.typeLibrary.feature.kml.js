/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.KMLFeature = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            var options = {
                sKMLName: undefined,
                sKMLDesctiption: undefined
            };
            L.Util.setOptions(this, options);
            leafLet.typeLibrary.Feature.prototype.initialize.call(this, args);
        },
        getPopupHeading: function(oLeafletObject)
        {
            var sText = this.options.name;
            var sKMLName = '';
            
            if (oLeafletObject && oLeafletObject.options.hasOwnProperty('kmlName'))
            {
                sKMLName = oLeafletObject.options.kmlName;
            }
            
            if ((typeof (sText) === 'string') && (sText.length > 0))
            {
                if ((typeof (sKMLName) === 'string') && (sKMLName.length > 0))
                {
                    if (sText !== sKMLName)
                    {
                        sText += " (" + sKMLName + ")";
                    }
                }
            }
            else if ((typeof (sKMLName) === 'string') && (sKMLName.length > 0))
            {
                sText = sKMLName;
            }
            
            return sText;
        },
        getPopupText: function(oLeafletObject)
        {
            var sPopupText = "";
            var sKMLDescription = '';
            
            if (oLeafletObject && oLeafletObject.options.hasOwnProperty('kmlDescription'))
            {
                sKMLDescription = oLeafletObject.options.kmlDescription;
            }

            if (oLeafletObject instanceof L.Marker)
            {
                var oLatLng = oLeafletObject.getLatLng().wrap();
                sPopupText += 
                        "<center><b>Lat</b>:&nbsp;" + oLatLng.lat.toFixed(5) + "<br/><b>Lon</b>:&nbsp;" + oLatLng.lng.toFixed(5) +
                        ((oLatLng.alt)? "<br/><b>Alt</b>:&nbsp;" + oLatLng.alt + this._getAltUnitsAndModeText(): "") + "</center><br/>";
            }

            if (!emp.util.isEmptyString(this._getPopupDescription()))
            {
                sPopupText += this._getPopupDescription();
            }
            else if (!emp.util.isEmptyString(sKMLDescription))
            {
                //sPopupText += "<br/><center><b>Description</b></center>" +
                //    this.options.sKMLDesctiption;
                sPopupText += sKMLDescription;
            }
            return sPopupText;
        },
        _getUrlViaProxy: function(sURL)
        {
            var data = "mime=text/xml&url=" + escape(sURL),
                proxyUrl;
            // Check for V2 environment
            if (emp.hasOwnProperty("appSetup")) {
              proxyUrl = emp.appSetup.urlProxy;
            } else {
              proxyUrl = emp.util.config.getProxyUrl();
            }
            
            return proxyUrl + "?" + data;
        },
        _setKMLParameters: function(oKmlDoc, oOptions)
        {
            if (oKmlDoc)
            {
                // We need the name and description if there was any in the KML in case there is
                // none in the feature.
                // However if the KML has more than one name and description,
                // we take the first one we find.
                emp.$.each(emp.$(oKmlDoc).find("name"), function(i, oNameElem)
                {
                    if (oOptions.sKMLName === undefined)
                    {
                        oOptions.sKMLName = oNameElem.textContent;
                    }
                });
                emp.$.each(emp.$(oKmlDoc).find("description"), function(i, oDescElem)
                {
                    if (oOptions.sKMLDesctiption === undefined)
                    {
                        oOptions.sKMLDesctiption = oDescElem.textContent;
                    }
                });
            }
        },
        _createFeatureFromString: function(oOptions)
        {
            var oFeature = new leafLet.typeLibrary.EmpKmlObject(oOptions.data, {
                async: false,
                kmlDoc: undefined,
                oFeature: this,
                oFeatureProperties: oOptions.properties,
                sProxyUrl: (this.options.instanceInterface.bUseProxy? this.options.instanceInterface.getProxyURL(): undefined),
                basePath: this.getEngineInstanceInterface().getBasePath()
            });

            if (oFeature === undefined)
            {
                throw new Error("KML returned no object.");
            }
            else if ((oFeature instanceof L.LayerGroup) &&
                    (oFeature.getLayers().length === 1))
            {
                var oChild = oFeature.getLayers()[0];

                if ((oChild instanceof L.Polygon) ||
                    (oChild instanceof L.Polyline) ||
                    (oChild instanceof L.Marker))
                {
                    oOptions.bEditable = true;
                }
                else
                {
                    oOptions.bEditable = false;
                }
            }
            else
            {
                oOptions.bEditable = false;
            }

            this._setKMLParameters(oFeature.options.kmlDoc, oOptions);

            return oFeature;
        },
        _createFeatureFromURL: function(oOptions)
        {
            var oFeature = new leafLet.typeLibrary.EmpKmlObject(oOptions.url, {
                async: false,
                kmlDoc: undefined,
                oFeature: this,
                oFeatureProperties: oOptions.properties,
                sProxyUrl: (this.options.instanceInterface.bUseProxy? this.options.instanceInterface.getProxyURL(): undefined),
                basePath: this.getEngineInstanceInterface().getBasePath()
            });

            if (oFeature === undefined)
            {
                throw new Error("KML returned no object.");
            }
            else
            {
                oOptions.bEditable = false;
                this._setKMLParameters(oFeature.options.kmlDoc, oOptions);
            }

            return oFeature;
        },
        _createFeature: function(args)
        {
            var oFeature = undefined;

            if (args.url && (args.url !== ""))
            {
                oFeature = this._createFeatureFromURL(args);
            }
            else
            {
                oFeature = this._createFeatureFromString(args);
            }

            return oFeature;
        },
        _updateFeature: function(oArgs)
        {
            return this._createFeature(oArgs);
        },
/*
        setLeafletObject: function(oObject)
        {
            leafLet.typeLibrary.Feature.prototype.setLeafletObject.call(this, oObject);
            if (this.options.leafletObject)
            {
                if (this.isSelected())
                {
                    this._setSelected(this.options.leafletObject);
                }
            }
        },
        _setSelected: function(oLayer)
        {
            if (oLayer === undefined)
            {
                return;
            }
            
            if (oLayer instanceof L.LayerGroup)
            {
                for (var Key in oLayer._layers)
                {
                    this._setSelected(oLayer._layers[Key]);
                }
            }
            else if (oLayer instanceof L.Marker)
            {
                emp.$(oLayer._icon).addClass('icon-selected');
            }
        },
*/
        setFeatureStyleProperties: function(sType, oProperties)
        {
            var bDoUpdate = false;
            var bMultiGeometry = false;
            var oLeafletObject = this.getLeafletObject();
            var oFeatureProperties = this.getProperties();
            
            if (oLeafletObject instanceof L.LayerGroup)
            {
                if (oLeafletObject.getLayers().length === 1)
                {
                    oLeafletObject = oLeafletObject.getLayers()[0];
                }
                else
                {
                    bMultiGeometry = true;
                }
            }
            
            if ((sType === emp.typeLibrary.OverlayStyleType.POINT) &&
                    (oLeafletObject instanceof L.Marker))
            {
                if (oProperties.hasOwnProperty('iconUrl'))
                {
                    oFeatureProperties.iconUrl = oProperties.iconUrl;
                    bDoUpdate = true;
                }
            }
            else if ((sType === emp.typeLibrary.OverlayStyleType.LINE) &&
                    (oLeafletObject instanceof L.Polyline))
            {
                if (oProperties.hasOwnProperty('lineColor'))
                {
                    oFeatureProperties.lineColor = oProperties.lineColor;
                    if (oProperties.hasOwnProperty('lineWidth'))
                    {
                        oFeatureProperties.lineWidth = oProperties.lineWidth;
                    }                    
                    bDoUpdate = true;
                }
            }
            else if ((sType === emp.typeLibrary.OverlayStyleType.POLYGON) &&
                    (oLeafletObject instanceof L.Polygon))
            {
                if (oProperties.hasOwnProperty('lineColor'))
                {
                    oFeatureProperties.lineColor = oProperties.lineColor;
                    if (oProperties.hasOwnProperty('lineWidth'))
                    {
                        oFeatureProperties.lineWidth = oProperties.lineWidth;
                    }
                    
                    bDoUpdate = true;
                }

                if (oProperties.hasOwnProperty('fillColor'))
                {
                    oFeatureProperties.fillColor = oProperties.fillColor;
                    bDoUpdate = true;
                }
            }
            else if ((sType === emp.typeLibrary.OverlayStyleType.MULTIGEOMETRY) &&
                    bMultiGeometry)
            {
                if (oProperties.hasOwnProperty('lineColor'))
                {
                    oFeatureProperties.lineColor = oProperties.lineColor;
                    if (oProperties.hasOwnProperty('lineWidth'))
                    {
                        oFeatureProperties.lineWidth = oProperties.lineWidth;
                    }
                    
                    bDoUpdate = true;
                }

                if (oProperties.hasOwnProperty('fillColor'))
                {
                    oFeatureProperties.fillColor = oProperties.fillColor;
                    bDoUpdate = true;
                }
                
                if (oProperties.hasOwnProperty('iconUrl'))
                {
                    oFeatureProperties.iconUrl = oProperties.iconUrl;
                    bDoUpdate = true;
                }
            }

            if (bDoUpdate)
            {
                this.updateFeature(this.options);
            }
        },
        render: function()
        {
            this.updateFeature(this.options);
        }
    };

    return publicInterface;
};

leafLet.typeLibrary.KMLFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.KMLFeature());
