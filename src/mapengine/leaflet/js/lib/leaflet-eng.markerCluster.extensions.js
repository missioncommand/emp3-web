
/* global L, leafLet, emp */

L.MarkerCluster.mergeOptions({
    titleText: "",
    popupText: "",
    overlay: undefined
});

L.MarkerCluster.include({
    setPopupHeading: function(sText)
    {
        this.options.titleText = sText;
    },
    getPopupHeading: function()
    {
        return this.options.titleText;
    },
    setPopupText: function(sText)
    {
        this.options.popupText = sText;
    },
    getPopupText: function()
    {
        return this.options.popupText;
    },
    setOverlay: function(oOverlay)
    {
        this.options.overlay = oOverlay;
    },
    getOverlayId: function()
    {
        var sID = undefined;
        
        if (this.options.overlay instanceof leafLet.typeLibrary.Overlay)
        {
            sID = this.options.overlay.getOverlayId();
        }
        
        return sID;
    },
    getParentId: function()
    {
        var sID = undefined;
        
        if (this.options.overlay instanceof leafLet.typeLibrary.Overlay)
        {
            sID = this.options.overlay.getParentId();
        }
        
        return sID;
    },
    getFeatureId: function()
    {
        return undefined;
    }
});

