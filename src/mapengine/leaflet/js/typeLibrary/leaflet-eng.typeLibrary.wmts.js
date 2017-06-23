
/* global L, leafLet, emp */
leafLet.internalPrivateClass.WMTS = function(){

    var publicInterface = {
        initialize: function (args)
        {
            //leafLet.internalPrivateClass.WMTS.prototype = Object.create(L.TileLayer.WMTS.prototype);
            //leafLet.internalPrivateClass.WMTS.prototype.constructor = leafLet.internalPrivateClass.WMTS;

            leafLet.typeLibrary.DisplayableObject.prototype.initialize.call(this, args);
            var options = {
                id: args.item.id,
                overlayId: args.item.overlayId,
                transparent: args.item.params.transparent,
                format: args.item.params.format,
                version: args.item.params.version,
                activeLayer: (args.item.activeLayers? emp.helpers.copyObject(args.item.activeLayers): []),
                url: args.item.url,
                tileMatrixSet: args.item.tileMatrixSet,
                useProxy: args.item.useProxy
            };
            L.Util.setOptions(this, options);

            this.options.leafletObject = this.createWMTS(this.options);
            L.Util.setOptions(this.options.leafletObject, this.options);
            //this.options.leafletObject.options.coreId = this.options.coreId;
            this.options.leafletObject.destroy = this.destroy;
            this.options.leafletObject.getOverlayId = this.getOverlayId;
            this.options.leafletObject.getId = this.getId;
            this.options.leafletObject.createWMTS = this.createWMTS;
            this.options.leafletObject.updateWMTS = this.updateWMTS;
            this.options.leafletObject.setVisibility = this.setVisibility;
            this.options.leafletObject.getCoreId = this.getCoreId;
            //this.prototype = this.options.leafletObject.prototype;

            // good but issue swith panning
            //this._layerAdd = this.options.leafletObject._layerAdd;
            //this.beforeAdd = this.options.leafletObject.beforeAdd;
            //this.onAdd = this.options.leafletObject.onAdd;
            //this.getEvents = this.options.leafletObject.getEvents;

            if (this.options.leafletObject.wmtsParams.hasOwnProperty('useProxy')) {
                delete this.options.leafletObject.wmtsParams.useProxy;
            }
          if ((this.options.leafletObject !== undefined) && this.options.visible && (this.options.activeLayer.length > 0))
          {
                this.getEngineInstanceInterface().addMapLayer(this.options.leafletObject);
           }
        },
        destroy: function()
        {
            if (this.options.leafletObject !== undefined)
            {
                this.getEngineInstanceInterface().removeMapLayer(this.options.leafletObject);
                this.options.leafletObject = undefined;
            }
            leafLet.typeLibrary.DisplayableObject.prototype.destroy.call(this);
        },
        getOverlayId: function()
        {
            return this.options.overlayId;
        },
        getId: function()
        {
            return this.options.id;
        },
        createWMTS: function(args)
        {
            var oWMTS = undefined;

            oWMTS = new L.TileLayer.WMTS(args.url, {
                layer: args.activeLayer.join(','),
                format: args.format,
                transparent: args.transparent,
                tilematrixSet: args.tileMatrixSet,
                version: args.version,
                useProxy: args.useProxy
            });

            return oWMTS;
        },
        updateWMTS: function(args)
        {
            var options = {
                id: args.id,
                overlayId: args.overlayId,
                transparent: args.params.transparent,
                tilematrixSet: args.params.tilematrixSet,
                format: args.params.format,
                version: args.params.version,
                activeLayer: (args.activeLayers? emp.helpers.copyObject(args.activeLayers): []),
                url: args.url,
                useProxy: args.useProxy
            };
            var oWMTS = this.createWMTS(options);

            if (this.hasLayer(this.options.leafletObject))
            {
                // Its on the map so we need to remove it.
                this.getEngineInstanceInterface().removeMapLayer(this.options.leafletObject);
            }

            this.options.leafletObject = oWMTS;
            if (this.options.visible)
            {
                this.getEngineInstanceInterface().addMapLayer(this.options.leafletObject);
            }
        },
        setVisibility: function(oItem)
        {
            this.options.activeLayer = (oItem.activeLayers? emp.helpers.copyObject(oItem.activeLayers): []);

            if (this.options.leafletObject !== undefined)
            {
                if (oItem.visible)
                {
                    this.options.visible = true;
                    this.options.leafletObject.setParams({
                        layers: this.options.activeLayer.join(',')
                    });
                    this.getEngineInstanceInterface().addMapLayer(this.options.leafletObject);
                }
                else if (!oItem.visible && (this.options.activeLayer.length === 0))
                {
                    this.options.visible = false;
                    this.getEngineInstanceInterface().removeMapLayer(this.options.leafletObject);
                }
                else
                {
                    this.options.leafletObject.setParams({
                        layers: this.options.activeLayer.join(',')
                    });
                }
            }
            // We don't have to process its children because the core will send everything that get affected.
        }
    };

    return publicInterface;
      //return publicInterface;
}

leafLet.typeLibrary.WMTS = leafLet.typeLibrary.DisplayableObject.extend(leafLet.internalPrivateClass.WMTS());
