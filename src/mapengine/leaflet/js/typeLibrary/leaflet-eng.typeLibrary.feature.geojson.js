/* global L, leafLet, emp, armyc2 */

leafLet.internalPrivateClass.GeoJsonFeature = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            leafLet.typeLibrary.Feature.prototype.initialize.call(this, args);
        },
        getPopupText: function()
        {
            var sPopupText = "";

            if (this.options.leafletObject instanceof L.Marker)
            {
                var oLatLng = this.options.leafletObject.getLatLng();
                if (oLatLng !== undefined)
                {
                    oLatLng = oLatLng.wrap();
                    sPopupText += 
                            "<center><b>Lat</b>:&nbsp;" + oLatLng.lat.toFixed(5) +
                            "<br/><b>Lon</b>:&nbsp;" + oLatLng.lng.toFixed(5) +
                            ((oLatLng.alt)? "<br/><b>Alt</b>:&nbsp;" + oLatLng.alt + this._getAltUnitsAndModeText(): "") + "</center><br/>";
                }
            }

            sPopupText += this._getPopupDescription();

            return sPopupText;
        },
        _createGeoJSONPolygon: function(oGeoJSON, oProperties)
        {
            var bIsSelected = this.isSelected();
            var oCoordList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oGeoJSON);

            if ((oCoordList === undefined) || (oCoordList.length < 3))
            {
                return undefined;
            }

            if (bIsSelected)
            {
                oProperties['tempColor'] = oProperties['color'] || L.LEAFLET_DEFAULT_LINE_COLOR;
                oProperties['tempWeight'] = oProperties['weigh'] || L.LEAFLET_DEFAULT_LINE_WEIGHT;

                oProperties['color'] = '#' + this.options.instanceInterface.selectAttributes.color;
                oProperties['weigh'] = this.options.instanceInterface.selectAttributes.width;
            }

            oProperties.oFeature = this;

            return new L.Polygon(oCoordList, oProperties);
        },
        _createGeoJSONLine: function(oGeoJSON, oProperties)
        {
            var oCoordList = leafLet.utils.geoJson.convertCoordinatesToLatLng(oGeoJSON);
            var bIsSelected = this.isSelected();

            if ((oCoordList === undefined) || (oCoordList.length < 2))
            {
                return undefined;
            }

            if (bIsSelected)
            {
                oProperties['tempColor'] = oProperties['color'] || L.LEAFLET_DEFAULT_LINE_COLOR;
                oProperties['tempWeight'] = oProperties['weigh'] || L.LEAFLET_DEFAULT_LINE_WEIGHT;

                oProperties['color'] = '#' + this.options.instanceInterface.selectAttributes.color;
                oProperties['weigh'] = this.options.instanceInterface.selectAttributes.width;
            }

            oProperties.oFeature = this;

            return new L.Polyline(oCoordList, oProperties);
        },
        _getDefaultIcon: function()
        {
            var oIcon;
            var oDefaultIcon = emp.utilities.icon.getDefaultIcon(this.getEngineInstanceInterface().getBasePath());
            var sURL = (this.options.instanceInterface.bUseProxy? 
                            this.getEngineInstanceInterface().getProxyURL() + "?" + "mime=image/*&url=" + escape(oDefaultIcon.iconUrl): 
                            oDefaultIcon.iconUrl);
            
            oIcon = new leafLet.typeLibrary.EmpIcon({
                iconUrl: sURL,
                iconAnchor: new L.Point(oDefaultIcon.offset.x, oDefaultIcon.offset.y),
                iconAnchorType: {x: oDefaultIcon.offset.xUnits, y: oDefaultIcon.offset.yUnits},
                basePath: this.getEngineInstanceInterface().getBasePath()
            });
            
            return oIcon;
        },
        _createGeoJSONPoint: function(oGeoJSON, oProperties)
        {
            var bIsSelected = this.isSelected();
            var oLatLon = leafLet.utils.geoJson.convertCoordinatesToLatLng(oGeoJSON)[0];

            if (oLatLon === undefined)
            {
                return undefined;
            }

            if (oProperties.iconOptions)
            {
                if (bIsSelected)
                {
                    oProperties.iconOptions.className = 'icon-selected';
                }
                
                oProperties.iconOptions.basePath = this.getEngineInstanceInterface().getBasePath();
                oProperties.icon = new leafLet.typeLibrary.EmpIcon(oProperties.iconOptions);
            }
            
            oProperties.oFeature = this;
            
            return new L.Marker(oLatLon, oProperties);
        },
        _createGeoJSONComplex: function(args, oGeoJSON)
        {
            var oThis = this;
            var bIsSelected = this.isSelected();
            
            return new L.geoJson(oGeoJSON, {
                style: function(oGeoJSONData)
                {
                    var oProperties = leafLet.utils.geoJson.mergeGeoJSONProperties(oThis.getEngineInstanceInterface(), args.properties, oGeoJSONData.properties);
            
                    if (bIsSelected)
                    {
                        oProperties['tempColor'] = oProperties['color'];
                        oProperties['tempWeight'] = oProperties['weigh'];
                        
                        oProperties['color'] = '#' + args.instanceInterface.selectAttributes.color;
                        oProperties['weigh'] = args.instanceInterface.selectAttributes.width;
                    }
                    
                    oProperties.oFeature = oThis;
                    return oProperties;
                },
                coordsToLatLng: function(oCoord)
                {
                    return new L.LatLng(oCoord[1], oCoord[0]);
                },
                pointToLayer: function(oGeoJsonfeature, latlng)
                {
                    var oProperties = leafLet.utils.geoJson.mergeGeoJSONProperties(oThis.getEngineInstanceInterface(), args.properties, oGeoJsonfeature.properties);

                    if (oProperties.iconOptions)
                    {
                        if (bIsSelected)
                        {
                            oProperties.iconOptions.className = 'icon-selected';
                        }
                        oProperties.iconOptions.basPath = this.getEngineInstanceInterface().getBasePath();
                        oProperties.icon = new leafLet.typeLibrary.EmpIcon(oProperties.iconOptions);
                    }
                    
                    return new L.Marker(latlng, {
                        icon: oProperties.icon,
                        sSubItemID: oProperties.sSubItemID,
                        oFeature: oThis
                    });
                }
            });
        },
        _createFeature: function(args)
        {
            var oFeature = undefined;
            var oProperties = leafLet.utils.geoJson.mergeGeoJSONProperties(this.getEngineInstanceInterface(), args.properties, args.data.properties);

            oProperties.title = args.name;

            switch (args.data.type.toLowerCase())
            {
                case 'point':
                    oFeature = this._createGeoJSONPoint(args.data, oProperties);
                    break;
                case 'linestring':
                    oFeature = this._createGeoJSONLine(args.data, oProperties);
                    break;
                case 'polygon':
                    oFeature = this._createGeoJSONPolygon(args.data, oProperties);
                    break;
                case 'feature':
                    if (!args.data.hasOwnProperty('geometry'))
                    {
                        throw new Error('GeoJSON Feature with no geometry.');
                    }

                    switch (args.data.geometry.type.toLowerCase())
                    {
                        case 'point':
                            oFeature = this._createGeoJSONPoint(args.data.geometry, oProperties);
                            break;
                        case 'linestring':
                            oFeature = this._createGeoJSONLine(args.data.geometry, oProperties);
                            break;
                        case 'polygon':
                            oFeature = this._createGeoJSONPolygon(args.data.geometry, oProperties);
                            break;
                        default:
                            oFeature = this._createGeoJSONComplex(args, args.data);
                            break;
                    }
                    break;
                default:
                    oFeature = this._createGeoJSONComplex(args, args.data);
                    break;
            }

            return oFeature;
        },
        _updateFeature: function(oArgs)
        {
            return this._createFeature(oArgs);
        },
        getGeometryType: function()
        {
            return leafLet.utils.geoJson.getGeometryType(this.getData());
        },
        render: function()
        {
            this.updateFeature(this.options);
        },
        setFeatureStyleProperties: function(sType, oProperties)
        {
            var bDoUpdate = false;
            var oFeatureProperties = this.getProperties();
            var sGeoJsonType = this.getGeometryType().toLowerCase();
            
            if ((sType === emp.typeLibrary.OverlayStyleType.POINT) &&
                    (sGeoJsonType === 'point'))
            {
                if (oProperties.hasOwnProperty('iconUrl'))
                {
                    oFeatureProperties.iconUrl = oProperties.iconUrl;
                    this.updateFeature(this.options);
                }
            }
            else if ((sType === emp.typeLibrary.OverlayStyleType.LINE) &&
                    (sGeoJsonType === 'linestring'))
            {
                if (oProperties.hasOwnProperty('lineColor'))
                {
                    oFeatureProperties.lineColor = oProperties.lineColor;
                    if (oProperties.hasOwnProperty('lineWidth'))
                    {
                        oFeatureProperties.lineWidth = oProperties.lineWidth;
                    }                    
                }
            }
            else if ((sType === emp.typeLibrary.OverlayStyleType.POLYGON) &&
                    (sGeoJsonType === 'polygon'))
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
                
                if (bDoUpdate)
                {
                    this.updateFeature(this.options);
                }
            }
            else if (
                        (sType === emp.typeLibrary.OverlayStyleType.MULTIGEOMETRY) &&
                        !(
                            (sGeoJsonType === 'point') ||
                            (sGeoJsonType === 'linestring') ||
                            (sGeoJsonType === 'polygon')
                        )
                    )
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

                if (bDoUpdate)
                {
                    this.updateFeature(this.options);
                }
            }
        }
    };
    return publicInterface;
};

leafLet.typeLibrary.GeoJsonFeature = leafLet.typeLibrary.Feature.extend(leafLet.internalPrivateClass.GeoJsonFeature());
