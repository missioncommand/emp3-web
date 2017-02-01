/*global cmapi */

/**
 * @memberOf cmapi.channel
 * @enum
 * @readonly
 */
cmapi.channel.names = {
    /**
     * @constant
     * @type string
     */
    CMAPI2_VISIBILITY_GET: "cmapi2.visibility.get",
    /**
     * @constant
     * @type string
     */
    CMAPI2_MAP_CONFIG: "cmapi2.map.config",
    CMAPI2_FEATURE_EVENT_ADD: "cmapi2.map.feature.event.add",
    CMAPI2_FEATURE_EVENT_REMOVE: "cmapi2.map.feature.event.remove",
    CMAPI2_FEATURE_EVENT_UPDATE: "cmapi2.map.feature.event.update",
    CMAPI2_FREEHAND_START: "cmapi2.map.freehand.start",
    CMAPI2_FREEHAND_STOP: "cmapi2.map.freehand.stop",
    CMAPI2_FREEHAND_LINE_DRAW: "cmapi2.map.freehand.linedraw",
    CMAPI2_MAP_DRAG: "cmapi2.map.view.drag",
    CMAPI2_MAP_DRAG_COMPLETE: "cmapi2.map.view.dragComplete",
    CMAPI2_FEATURE_DRAG: "cmapi2.map.feature.drag",
    CMAPI2_FEATURE_DRAG_COMPLETE: "cmapi2.map.feature.dragComplete",


    /**
     * @constant
     * @type string
     */
    MAP_SHUTDOWN: "map.shutdown",
    /**
     * @constant
     * @type string
     */
    MAP_CONVERT: "map.convert",
    /**
     * @constant
     * @type string
     */
    MAP_SWAP: "map.swap",
    /**
     * @constant
     * @type string
     */
    MAP_MESSAGE_COMPLETE: "map.message.complete",
    /**
     * @constant
     * @type string
     */
    MAP_MESSAGE_PROGRESS: "map.message.progress",
    /**
     * @constant
     * @type string
     */
    MAP_MESSAGE_CANCEL: "map.message.cancel",
    /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_CREATE: "map.overlay.create",
    /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_REMOVE: "map.overlay.remove",
    /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_HIDE: "map.overlay.hide",
    /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_SHOW: "map.overlay.show",
    /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_UPDATE: "map.overlay.update",
    /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_STYLE: "map.overlay.style",
        /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_CLUSTER_SET: "map.overlay.cluster.set",
            /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_CLUSTER_ACTIVATE: "map.overlay.cluster.activate",
            /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_CLUSTER_DEACTIVATE: "map.overlay.cluster.deactivate",
            /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_CLUSTER_REMOVE: "map.overlay.cluster.remove",
    /**
     * @constant
     * @type string
     */
    MAP_OVERLAY_CLEAR: "map.overlay.clear",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_DESELECTED: "map.feature.deselected",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_SELECTED: "map.feature.selected",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_PLOT: "map.feature.plot",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_PLOT_URL: "map.feature.plot.url",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_UNPLOT: "map.feature.unplot",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_HIDE: "map.feature.hide",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_SHOW: "map.feature.show",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_UPDATE: "map.feature.update",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_EDIT: "map.feature.edit",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_DRAW: "map.feature.draw",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_CLICKED: "map.feature.clicked",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_MOUSEUP: "map.feature.mouseup",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_MOUSEDOWN: "map.feature.mousedown",
    /**
     * @constant
     * @type string
     */
    //MAP_SYMBOL_FEATURE_PLOT: "mil.symbology.feature.plot",
    /**
     * @constant
     * @type string
     */
    //MAP_SYMBOL_FEATURE_DRAW: "mil.symbology.feature.draw",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_ZOOM: "map.view.zoom",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_CENTER_OVERLAY: "map.view.center.overlay",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_CENTER_FEATURE: "map.view.center.feature",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_CENTER_LOCATION: "map.view.center.location",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_CENTER_BOUNDS: "map.view.center.bounds",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_LOCK: "map.view.lock",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_CLICKED: "map.view.clicked",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_MOUSEUP: "map.view.mouseup",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_MOUSEDOWN: "map.view.mousedown",
        /**
     * @constant
     * @type string
     */
    MAP_VIEW_MOUSEMOVE: "map.view.mousemove",
    /**
     * @constant
     * @type string
     */
     MAP_VIEW_AREA_SELECTED: "map.view.area.selected",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_COORDINATESYSTEM: "map.view.coordinatesystem",
    /**
     * @constant
     * @type string
     */
    MAP_GET: "map.get",
    /**
     * @constant
     * @type string
     */
    MAP_MENU_CREATE: "map.menu.create",
    /**
     * @constant
     * @type string
     */
    MAP_MENU_CLICKED: "map.menu.clicked",
    /**
     * @constant
     * @type string
     */
    MAP_MENU_REMOVE: "map.menu.remove",
    /**
     * @constant
     * @type string
     */
    MAP_MENU_ACTIVE: "map.menu.active",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_REQUEST: "map.status.request",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_INITIALIZATION: "map.status.initialization",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_VIEW: "map.status.view",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_FORMAT: "map.status.format",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_ABOUT: "map.status.about",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_COORDINATESYSTEM: "map.status.coordinatesystem",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_SCREENSHOT: "map.status.screenshot",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_SELECTED: "map.status.selected",
    /**
     * @constant
     * @type string
     */
    MAP_ERROR: "map.error",
    /**
     * @constant
     * @type string
     */
    MAP_TRANSACTION_COMPLETE: "map.transaction.complete",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_REQUEST_OVERLAYS: "map.status.request.overlays",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_REQUEST_OVERLAY: "map.status.request.overlay",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_REQUEST_FEATURE: "map.status.request.feature",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_REQUEST_FEATURES: "map.status.request.features",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_OVERLAYS: "map.status.overlays",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_OVERLAY: "map.status.overlay",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_FEATURE: "map.status.feature",
    /**
     * @constant
     * @type string
     */
    MAP_STATUS_FEATURES: "map.status.features",
    /**
     * @constant
     * @type string
     */
    MAP_MENU_DRAWING_COMPLETE: "map.menu.drawing.complete",
    /**
     * @constant
     * @type string
     */
    MAP_MENU_DRAWING_CREATE: "map.menu.drawing.create",
    /**
     * @constant
     * @type string
     */
    MAP_MENU_DRAWING_REMOVE: "map.menu.drawing.remove",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_PLOT_BATCH: "map.feature.plot.batch",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_UNPLOT_BATCH: "map.feature.unplot.batch",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_SELECTED_BATCH: "map.feature.selected.batch",
    /**
     * @constant
     * @type string
     */
    MAP_FEATURE_DESELECTED_BATCH: "map.feature.deselected.batch",
    /**
     * @constant
     * @type string
     */
    MAP_VIEW_LOOKAT_LOCATION: "map.view.lookat.location"
};
