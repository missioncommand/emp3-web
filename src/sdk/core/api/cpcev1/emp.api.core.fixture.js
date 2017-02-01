var emp = emp || {};
emp.api = emp.api || {};
emp.api.core = emp.api.core || {};

emp.api.core.fixture = {
	"title": "Core Map API Payload Specification",
	"version": "13.11",
	"channels": {
		"Bcw.Map.Broadcast": {
			"purpose": "Receives all incoming core-map-api traffic",
			"extension": false,
			"direction": "inbound"
		},
		"BcwMapBrokerChannel": {
			"purpose": "sends outgoing events to core-map-api widgets",
			"extension": false,
			"direction": "outbound"
		}
	}
};

emp.api.core.channel = {};

emp.api.core.channel.names = {
    MAP_BROADCAST: "Bcw.Map.Broadcast",
    MAP_BROKER: "BcwMapBrokerChannel",
    GRAPHICS_DRAW_EVENT: "core.api.graphics.drawing",
    GRAPHIC_EVENT: "core.api.graphics.eventing",
    MAP_EVENT: "core.api.map.eventing"
};

emp.api.core.EventType = {
    GRAPHIC_UPDATE: "graphicUpdate",
    GRAPHIC_CLICK: "graphicClick",
    GRAPHIC_DBL_CLICK: "graphicDoubleClick",
    DRAW_COMPLETE: "drawComplete",
    MAP_MOVE: "mapMove",
    MAP_READY: "mapReady",
    MAP_CLICKED: "mapClick",
    MAP_DBL_CLICKED: "mapDoubleClick"
};

emp.api.core.DataType = {
    MIL_STD_SYMBOL: "milStdSymbol",
    POINT: "point",
    LINE: "line",
    POLYGON: "polygon",
    MIL_STD_MULTI_POINT: "MilStdMultiPoint",
    AIRSPACE: "3DShape",
    UNKNOWN: "unknown"
};
    