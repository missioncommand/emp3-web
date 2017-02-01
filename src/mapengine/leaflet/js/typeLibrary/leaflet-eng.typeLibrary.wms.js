
/* global L, leafLet, emp */
leafLet.internalPrivateClass.WMS = function(){
    var publicInterface = {
        initialize: function (args) 
        {
            leafLet.typeLibrary.DisplayableObject.prototype.initialize.call(this, args);
            var options = {
                id: args.item.id,
                overlayId: args.item.overlayId,
                transparent: args.item.params.transparent,
                format: args.item.params.format,
                version: args.item.params.version,
                activeLayer: (args.item.activeLayers? emp.helpers.copyObject(args.item.activeLayers): []),
                url: args.item.url,
                useProxy: args.item.useProxy
            };
            L.Util.setOptions(this, options);

            this.options.leafletObject = this.createWMS(this.options);
            if (this.options.leafletObject.wmsParams.hasOwnProperty('useProxy')) {
                delete this.options.leafletObject.wmsParams.useProxy;
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
        createWMS: function(args)
        {
            var oWMS = undefined;

            oWMS = new L.TileLayer.WMS(args.url, {
                layers: args.activeLayer.join(','),
                format: args.format,
                transparent: args.transparent,
                version: args.version,
                useProxy: args.useProxy
            });

            return oWMS;
        },
        updateWMS: function(args)
        {
            var options = {
                id: args.id,
                overlayId: args.overlayId,
                transparent: args.params.transparent,
                format: args.params.format,
                version: args.params.version,
                activeLayer: (args.activeLayers? emp.helpers.copyObject(args.activeLayers): []),
                url: args.url,
                useProxy: args.useProxy
            };
            var oWMS = this.createWMS(options);

            if (this.hasLayer(this.options.leafletObject))
            {
                // Its on the map so we need to remove it.
                this.getEngineInstanceInterface().removeMapLayer(this.options.leafletObject);
            }

            this.options.leafletObject = oWMS;
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
};

leafLet.typeLibrary.WMS = leafLet.typeLibrary.DisplayableObject.extend(leafLet.internalPrivateClass.WMS());
