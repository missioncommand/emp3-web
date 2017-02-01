/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global Cesium, emp, cesiumEngine */
var EmpCesiumConstants = {};
EmpCesiumConstants.globeWasMoving = false;
EmpCesiumConstants.globeWasZooming = false;
EmpCesiumConstants.globeMoveTime = 0;
EmpCesiumConstants.extentBufferFactor = .4;// use when flyto a feature so the camera is not too close to it.
EmpCesiumConstants.USE_DATA_SOURCE = false;
EmpCesiumConstants.METERS_PER_INCH = 0.0254;
EmpCesiumConstants.SCALE_LINE_LENGTH = 50;
EmpCesiumConstants.propertyDefaults = {
    FILL_COLOR: Cesium.Color.WHITE,
    LINE_COLOR: Cesium.Color.BLACK,
    FILL_COLOR_HEX: "ffffff",
    LINE_COLOR_HEX: "000000",
    LINE_WIDTH: 3
};
EmpCesiumConstants.selectionProperties = {
    COLOR: Cesium.Color.YELLOW,
    COLOR_HEX: 'FFFF00',
    WIDTH: 2,
    SCALE: 0.5
};
EmpCesiumConstants.featureType = {
    ENTITY: "entity",
    PRIMITIVE: "primitive",
    GROUND_PRIMITIVE: "ground_primitive",
    DATA_SOURCE: "dataSource",
    COMPOUND_ENTITY: "compoundEntity",
    PRIMITIVE_COLLECTION: "primitiveCollection"
};
EmpCesiumConstants.layerType = {
    OVERLAY_LAYER: "overlay",
    WMS_LAYER: "wms",
    IMAGE_LAYER: "image",
    BING_LAYER: "bing",
    ARCGIS_93_REST_LAYER: "arcgis93rest",
    OSM_LAYER: "osm",
    TMS_LAYER: "tms",
    TERRAIN_LAYER: "terrain"
};
EmpCesiumConstants.entityType = {
    BILLBOARD: "billboard",
    BOX: "box",
    CORRIDOR: "corridor",
    CYLINDER: "cylinder",
    DESCRIPTION: "descrption",
    ELLIPSE: "ellipse",
    ELLIPSOID: "ellipsoid",
    LABEL: "label",
    MODEL: "model",
    ORIENTATION: "orientation",
    PATH: "path",
    POLYGON: "polygon",
    POLYLINE: "polyline",
    POLYLINE_VOLUME: "polylineVolume",
    POSITION: "position",
    RECTANGLE: "rectangle",
    VIEW_FROM: "viewFrom",
    WALL: "wall",
    KML: "kml"
};
EmpCesiumConstants.MultiPointRenderType = {
    KML: 0,
    JSON: 1,
    GEOJSON: 2,
    DATA_URL: 4,
    CANVAS: 3,
    CANVAS_LABEL_ONLY: 5,
    SVG:6,
    SVG_LABEL_ONLY:7
};

EmpCesiumConstants.SinglePointAltitudeRangeMode = {
    LOW_RANGE: 0,
    MID_RANGE: 1,
    HIGHEST_RANGE: 2
};

EmpCesiumConstants.pinBuilder = new Cesium.PinBuilder();

// If the code below is ever used again the call to emp.util.config.getCoreBasePath() will not exist in V3 environment and therefore will fail. A check should be placed for V2 environment

//Cesium.when(EmpCesiumConstants.pinBuilder.fromMakiIconId('emp-default-icon', Cesium.Color.ROYALBLUE, 48), function (canvas)
//Cesium.when(EmpCesiumConstants.pinBuilder.fromUrl(emp.helpers.relToAbs(emp.util.config.getCoreBasePath() + 'emp3-map/img/emp-default-icon.png'), Cesium.Color.ROYALBLUE, 48), function (canvas)
//{
//    EmpCesiumConstants.empDefaultIconCanvas = canvas;
//});

EmpCesiumConstants.RendererWorker = {
    A: 1,
    B: 2,
    C: 3,
    D: 4
};
