/* globals emp */

emp.api.core.publish = function (args) {
    var channel,
        payload;
    var button,
        ctrlKey = false,
        shiftKey = false,
        altKey = false,
        i,
        index,
        lon,
        lat,
        type,
        dataType,
        oItem,
        oFeature;
    var eventData = {};

    var getKMLCoordinateString = function(sKML) {
        var sStrCoordinate = "";
        var oKMLDoc = emp.util.parseXML(sKML);
        emp.util.each(oKMLDoc.getElementsByTagName("coordinates"), function (node) {
            if (sStrCoordinate.length > 0) {
                sStrCoordinate += " ";
            }
            sStrCoordinate += node.childNodes[0].nodeValue;
        });

        return sStrCoordinate;
    };

    if (args) {
        if (args.items && args.items.length > 0) {

            oItem = args.items[0];

            switch (args.intent)
            {
                case emp.intents.control.VIEW_CHANGE:
                    channel = emp.api.core.channel.names.MAP_EVENT;

                    payload = {
                        type: emp.api.core.EventType.MAP_MOVE,
                        eventData: {
                            lat: args.items[0].location.lat,
                            lon: args.items[0].location.lon,
                            altitude: args.items[0].range,
                            scale: args.items[0].range / emp.api.core.scaleMultiplier,
                            left: args.items[0].bounds.west,
                            bottom: args.items[0].bounds.south,
                            right: args.items[0].bounds.east,
                            top: args.items[0].bounds.north
                        }

                    };
                    break;
                case emp.intents.control.STATUS_CHANGE:
                    channel = emp.api.core.channel.names.MAP_EVENT;

                    if (args.items[0].status === 'ready') {
                        payload = {
                            type: emp.api.core.EventType.MAP_READY,
                            eventData: {
                                lat: undefined,
                                lon: undefined,
                                altitude: undefined,
                                scale: undefined,
                                left: undefined,
                                bottom: undefined,
                                right: undefined,
                                top: undefined
                            }
                        };
                    }
                    break;
                case emp.intents.control.FEATURE_CLICK:
                    channel = emp.api.core.channel.names.GRAPHIC_EVENT;

                    if (oItem.type === 'single') {
                        type = emp.api.core.EventType.GRAPHIC_CLICK;
                    } else if (oItem.type === 'double') {
                        type = emp.api.core.EventType.GRAPHIC_DBL_CLICK;
                    }
                    else
                    {
                        // ignore all other types.
                        return;
                    }

                    switch (oItem.button) {
                    case 'left':
                        button = 0;
                        break;
                    case 'middle':
                        button = 1;
                        break;
                    case 'right':
                        button = 2;
                        break;
                    }

                    for (i = 0; i < oItem.keys.length; i += 1) {
                        if (oItem.keys[i] === 'ctrl') {
                            ctrlKey = true;
                        } else if (oItem.keys[i] === 'shift') {
                            shiftKey = true;
                        } else if (oItem.keys[i] === 'alt') {
                            altKey = true;
                        }
                    }

                    oFeature = emp.storage.findFeature(oItem.overlayId, oItem.featureId);

                    payload = {
                        type: type,
                        eventData: {
                            id: oItem.featureId,
                            overlayId: oItem.overlayId,
                            name: oItem.name,
                            lat: oItem.lat,
                            lon: oItem.lon,
                            mgrs: oItem.mgrs,
                            altitude: oItem.elevation,
                            button: button,
                            clientX: oItem.clientX,
                            clientY: oItem.clientY,
                            screenX: oItem.screenX,
                            screenY: oItem.screenY,
                            altKey: altKey,
                            ctrlKey: ctrlKey,
                            shiftKey: shiftKey
                        }
                    };

                    if (oFeature)
                    {
                        switch (oFeature.v1Type)
                        {
                            case emp.api.core.DataType.MIL_STD_SYMBOL:
                                payload.eventData.dataType = "milStdPoint";
                                payload.eventData.symbolCode = oFeature.data.symbolCode;
                                payload.eventData.coordinates = emp.helpers.coordinatesToString(oFeature.data);
                                break;
                            case emp.api.core.DataType.POINT:
                                payload.eventData.dataType = emp.api.core.DataType.POINT;
                                payload.eventData.coordinates = getKMLCoordinateString(oFeature.data);
                                break;
                            case emp.api.core.DataType.LINE:
                                payload.eventData.dataType = emp.api.core.DataType.LINE;
                                payload.eventData.coordinates = getKMLCoordinateString(oFeature.data);
                                break;
                            case emp.api.core.DataType.POLYGON:
                                payload.eventData.dataType = emp.api.core.DataType.POLYGON;

                                // Get the string and remove the last coordinate.
                                var sStrCoord = getKMLCoordinateString(oFeature.data);
                                payload.eventData.coordinates = sStrCoord.slice(0, sStrCoord.lastIndexOf(' '));
                                break;
                            case emp.api.core.DataType.MIL_STD_MULTI_POINT:
                                payload.eventData.dataType = emp.api.core.DataType.MIL_STD_MULTI_POINT;
                                payload.eventData.symbolCode = oFeature.data.symbolCode;
                                payload.eventData.coordinates = emp.helpers.coordinatesToString(oFeature.data);
                                break;
                            case emp.api.core.DataType.AIRSPACE:
                                payload.eventData.dataType = emp.api.core.DataType.AIRSPACE;
                                payload.eventData.symbolCode = oFeature.data.symbolCode;
                                payload.eventData.coordinates = emp.helpers.coordinatesToString(oFeature.data);
                                break;
                        }
                    }
                    break;
                case emp.intents.control.CLICK:
                    channel = emp.api.core.channel.names.MAP_EVENT;

                    if (args.items[0].type === 'single') {
                        type = emp.api.core.EventType.MAP_CLICKED;
                    } else if (args.items[0].type === 'double') {
                        type = emp.api.core.EventType.MAP_DBL_CLICKED;
                    }
                    else
                    {
                        // ignore all other types.
                        return;
                    }

                    switch (args.items[0].button) {
                    case 'left':
                        button = 0;
                        break;
                    case 'middle':
                        button = 1;
                        break;
                    case 'right':
                        button = 2;
                        break;
                    }

                    for (i = 0; i < args.items[0].keys.length; i += 1) {
                        if (args.items[0].keys[i] === 'ctrl') {
                            ctrlKey = true;
                        } else if (args.items[0].keys[i] === 'shift') {
                            shiftKey = true;
                        } else if (args.items[0].keys[i] === 'alt') {
                            altKey = true;
                        }
                    }

                    payload = {
                        type: type,
                        eventData: {
                            lat: args.items[0].lat,
                            lon: args.items[0].lon,
                            mgrs: args.items[0].mgrs,
                            altitude: args.items[0].elevation,
                            button: button,
                            clientX: args.items[0].clientX,
                            clientY: args.items[0].clientY,
                            screenX: args.items[0].screenX,
                            screenY: args.items[0].screenY,
                            // hitGlobe: '',  Don't have a current equivalent to this.
                            altKey: altKey,
                            ctrlKey: ctrlKey,
                            shiftKey: shiftKey
                        }
                    };
                    break;
                case emp.intents.control.DRAW_UPDATE:
                case emp.intents.control.EDIT_UPDATE:
                    channel = emp.api.core.channel.names.GRAPHICS_DRAW_EVENT;
                    oFeature = args.items[0];

                    if (args.intent === emp.intents.control.EDIT_UPDATE)
                    {
                        channel = emp.api.core.channel.names.GRAPHIC_EVENT;
                    }

                    switch (oFeature.v1Type)
                    {
                        case emp.api.core.DataType.UNKNOWN:
                        case undefined:
                            switch (oFeature.format)
                            {                                
                                case emp.typeLibrary.featureFormatType.IMAGE:
                                    // This shouldn't happen.
                                    break;
                                case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
                                    {
                                        var iStdVersion = emp.typeLibrary.featureMilStdVersionType.convertToNumeric(oFeature.properties.standard);

                                        if (armyc2.c2sd.renderer.utilities.SymbolDefTable.isMultiPoint(oFeature.data.symbolCode, iStdVersion))
                                        {
                                            dataType = emp.api.core.DataType.MIL_STD_MULTI_POINT;
                                        }
                                        else
                                        {
                                            dataType = emp.api.core.DataType.MIL_STD_SYMBOL;
                                        }
                                    }
                                    break;
                                case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
                                    dataType = emp.api.core.DataType.AIRSPACE;
                                    break;
                                case emp.typeLibrary.featureFormatType.GEOJSON:
                                case emp.typeLibrary.featureFormatType.KML:
                                    switch (oFeature.data.type)
                                    {
                                        case "Point":
                                            dataType = emp.api.core.DataType.POINT;
                                            break;
                                        case "LineString":
                                            dataType = emp.api.core.DataType.LINE;
                                            break;
                                        case "Polygon":
                                            dataType = emp.api.core.DataType.POLYGON;
                                            break;
                                    }
                                    break;
                            }
                            break;
                        default:
                            dataType = oFeature.v1Type;
                            break;
                    }

                    if (oFeature.updates &&
                            oFeature.updates.indices &&
                            (oFeature.updates.indices.length > 0))
                    {
                        index = oFeature.updates.indices[0];
                        lon = oFeature.updates.coordinates[0].lon;
                        lat = oFeature.updates.coordinates[0].lat;
                    }
                    else
                    {
                        index = -1;
                        lon = 0.0;
                        lat = 0.0;
                    }

                    eventData = {
                        isComplete: oFeature.complete,
                        dataType: dataType,
                        description: oFeature.description,
                        id: oFeature.featureId,
                        name: oFeature.name,
                        coordinates: emp.helpers.coordinatesToString(oFeature.data),
                        index: index,
                        lat: lat,
                        lon: lon
                    };

                    payload = {
                            type: (oFeature.complete? emp.api.core.EventType.DRAW_COMPLETE:
                                emp.api.core.EventType.GRAPHIC_UPDATE),
                            eventData: eventData
                        };
                    break;
            }

            if ((channel !== undefined) && (payload !== undefined))
            {
                emp.environment.get().pubSub.publish({
                            message: payload,
                            channel: channel
                        });
            }
        }
    }
};



/*

publishMessage: function (message) {
            if (_isOzoneInitialized) {
                this.widgetEventingController.publish('BcwMapBrokerChannel', message);
            }
        },
        publishMapEvent: function (eventMessage) {
            if (_isOzoneInitialized) {
                widgetEventingController.publish('core.api.map.eventing', eventMessage);
            }
        },
        publishDataEvent: function (eventMessage) {
            var oldEvent = JSON.parse(eventMessage),
                newEvent = {},
                coordinateString = '',
                i;

            if (_isOzoneInitialized) {

                // We need to convert these messages types back to v1 language.
                if (oldEvent.type === 'graphicUpdate' ||
                    oldEvent.type === 'graphicTempUpdate') {

                    // Create a coordinate string for this event.
                    for (i = 0; i < oldEvent.eventData.updates.coordinates.length; i += 1) {
                        coordinateString += oldEvent.eventData.updates.coordinates[i].lon + ',' +
                            oldEvent.eventData.updates.coordinates[i].lat;

                        if (oldEvent.eventData.updates.coordinates[i].alt !== undefined) {
                            coordinateString += ',' + oldEvent.eventData.updates.coordinates[i].alt + ' ';
                        } else {
                            coordinateString += ' ';
                        }
                    }


                    newEvent = {
                        type: 'graphicUpdate',
                        eventData: {
                            isComplete: (oldEvent.type === 'graphicUpdate') ? true : false,
                            dataType: oldEvent.eventData.dataType,
                            description: oldEvent.eventData.description,
                            id: oldEvent.eventData.featureId,
                            name: oldEvent.eventData.name,
                            coordinates: coordinateString
                        }
                    };

                    if (oldEvent.eventData.updates.indices) {
                        newEvent.eventData.index = oldEvent.eventData.updates.indices[0];
                    }

                    eventMessage = JSON.stringify(newEvent);
                }

                widgetEventingController.publish('core.api.graphics.eventing',
                    eventMessage);
            }
        },
        publishDrawEvent: function (eventMessage) {

            var oldEvent = JSON.parse(eventMessage),
                newEvent = {},
                coordinateString = '',
                i;


            // we need to parse the message so it's back in v1 language.
            if (oldEvent.type === 'drawComplete') {

                // Create a coordinate string for this event.
                for (i = 0; i < oldEvent.eventData.updates.coordinates.length; i += 1) {
                    coordinateString += oldEvent.eventData.updates.coordinates[i].lon + ',' +
                        oldEvent.eventData.updates.coordinates[i].lat;

                    if (oldEvent.eventData.updates.coordinates[i].alt !== undefined) {
                        coordinateString += ',' + oldEvent.eventData.updates.coordinates[i].alt + ' ';
                    } else {
                        coordinateString += ' ';
                    }
                }

                newEvent = {
                    type: oldEvent.type,
                    eventData: {
                        dataType: oldEvent.eventData.dataType,
                        id: oldEvent.eventData.featureId,
                        overlayId: oldEvent.eventData.overlayId,
                        name: oldEvent.eventData.name,
                        coordinates: coordinateString
                    }
                };

                eventMessage = JSON.stringify(newEvent);

                if (_isOzoneInitialized) {
                    widgetEventingController.publish('core.api.graphics.drawing',
                        eventMessage);
                }
            }
        },

        */
