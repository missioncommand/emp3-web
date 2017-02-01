/* global leafLet */

if (window.leafLet === undefined)
{
    leafLet = {};
}
leafLet.typeLibrary = {};
leafLet.editor = {};
leafLet.typeLibrary.airspace = {};
leafLet.internalPrivateClass = {};

leafLet.typeLibrary.objectType = {
    OVERLAY: "overlay",
    FEATURE: "feature",
    WMS: "wms",
    LL_CONTROL: 'leafletControl',
    LL_DEFAULT_MAP: 'leafletDefaultMap'
};

leafLet.typeLibrary.featureType = leafLet.typeLibrary.featureType || {};
leafLet.typeLibrary.featureType.AOI = 'aoi';