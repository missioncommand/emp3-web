/* global emp, cmapi */

emp.api.cmapi.publisher.intentChannelMap = (function(){
    var mapping = {};

    mapping[emp.intents.control.TRANSACTION_COMPLETE] = cmapi.channel.names.MAP_MESSAGE_COMPLETE;

    // Error event.
    mapping[emp.intents.control.ERROR] = cmapi.channel.names.MAP_ERROR;

    // Edit events.
    mapping[emp.intents.control.EDIT_UPDATE] = cmapi.channel.names.MAP_MESSAGE_PROGRESS;

    // Draw Events.
    mapping[emp.intents.control.DRAW_UPDATE] = cmapi.channel.names.MAP_MESSAGE_PROGRESS;
    mapping[emp.intents.control.FEATURE_OUTBOUND_PLOT] = cmapi.channel.names.MAP_FEATURE_PLOT;
    mapping[emp.intents.control.SYMBOL_OUTBOUND_PLOT] = cmapi.channel.names.MAP_SYMBOL_FEATURE_PLOT;

    // Map events.
    mapping[emp.intents.control.POINTER] = cmapi.channel.names.MAP_VIEW_CLICKED;
    mapping[emp.intents.control.CLICK] = cmapi.channel.names.MAP_VIEW_CLICKED;
    mapping[emp.intents.control.FEATURE_CLICK] = cmapi.channel.names.MAP_FEATURE_CLICKED;
    mapping[emp.intents.control.SELECTION_OUTBOUND] = cmapi.channel.names.MAP_FEATURE_SELECTED;
    mapping[emp.intents.control.DESELECTION_OUTBOUND] = cmapi.channel.names.MAP_FEATURE_DESELECTED;
    mapping[emp.intents.control.VIEW_CHANGE] = cmapi.channel.names.MAP_STATUS_VIEW;
    mapping[emp.intents.control.SELECTION_BOX] = cmapi.channel.names.MAP_VIEW_AREA_SELECTED;

    // Map status request responses.
    mapping[emp.intents.control.STATUS_RESPONSE_ABOUT] = cmapi.channel.names.MAP_STATUS_ABOUT;
    mapping[emp.intents.control.STATUS_RESPONSE_FORMAT] = cmapi.channel.names.MAP_STATUS_FORMAT;
    mapping[emp.intents.control.VIEW_GET] = cmapi.channel.names.MAP_STATUS_VIEW;
    mapping[emp.intents.control.STATUS_RESPONSE_SELECTED] = cmapi.channel.names.MAP_STATUS_SELECTED;
    mapping[emp.intents.control.STATUS_RESPONSE_INIT] = cmapi.channel.names.MAP_STATUS_INITIALIZATION;
    mapping[emp.intents.control.STATUS_RESPONSE_COORD_SYSTEM] = cmapi.channel.names.MAP_STATUS_COORDINATESYSTEM;
    mapping[emp.intents.control.STATUS_REQUEST_SCREENSHOT] = cmapi.channel.names.MAP_STATUS_SCREENSHOT;

    // Delete events.
    mapping[emp.intents.control.FEATURE_REMOVE] = cmapi.channel.names.MAP_FEATURE_UNPLOT;
    mapping[emp.intents.control.OVERLAY_REMOVE] = cmapi.channel.names.MAP_OVERLAY_REMOVE;

    mapping[emp.intents.control.FREEHAND_LINE_DRAW_START] = cmapi.channel.names.CMAPI2_FREEHAND_LINE_DRAW;
    mapping[emp.intents.control.FREEHAND_LINE_DRAW_END] = cmapi.channel.names.CMAPI2_FREEHAND_LINE_DRAW;
    mapping[emp.intents.control.FREEHAND_LINE_DRAW_UPDATE] = cmapi.channel.names.CMAPI2_FREEHAND_LINE_DRAW;

    return mapping;
}());
