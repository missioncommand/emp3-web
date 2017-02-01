/*global emp, cmapi */
// Register a channel publisher for map.view.clicked
cmapi.channel.publisher[cmapi.channel.names.MAP_VIEW_CLICKED] = {

    // args will have a transaction property
    process: function(transaction) {
        try {
            var pointer = transaction.items[0],
                payload,
                bounds,
                oFeature,
                feature;

            if (pointer.type === emp.typeLibrary.Pointer.EventType.MOVE && !isNaN(pointer.lat) && !isNaN(pointer.lon)) {

                payload = {
                    latitude: pointer.lat,
                    longitude: pointer.lon,
                    type: pointer.type,
                    clientX: pointer.clientX,
                    clientY: pointer.clientY,
                    screenX: pointer.screenX,
                    screenY: pointer.screenY,
                    keys: pointer.keys
                };

                emp.environment.get().pubSub.publish({
                    message: payload,
                    sender: {
                        id: transaction.mapInstanceId
                    },
                    channel: cmapi.channel.names.MAP_VIEW_MOUSEMOVE
                });


            } else {

                if ((pointer.bounds !== undefined) && (pointer.bounds !== null)) {
                    bounds = {
                        northEast: {
                            lat: pointer.bounds.north,
                            lon: pointer.bounds.east
                        },
                        southWest: {
                            lat: pointer.bounds.south,
                            lon: pointer.bounds.west
                        }
                    };
                }

                payload = {
                    lat: pointer.lat,
                    lon: pointer.lon,
                    mgrs: pointer.mgrs,
                    button: pointer.button,
                    type: pointer.type,
                    keys: pointer.keys,
                    bounds: bounds,
                    clientX: pointer.clientX,
                    clientY: pointer.clientY,
                    screenX: pointer.screenX,
                    screenY: pointer.screenY,
                    width: pointer.width,
                    height: pointer.height,
                    zoom: pointer.range,
                    scale: pointer.scale,
                    overlayId: pointer.overlayId,
                    featureId: pointer.featureId,
                    parentId: pointer.parentId
                };

                if (pointer.target.toLowerCase() === "feature") {

                    oFeature = emp.storage.findFeature(pointer.overlayId, pointer.featureId);
                    if (oFeature !== undefined) {
                        // If the feature exists we need to retrieve additional
                        // properties so the api can create it on the receiving end.
                        feature = oFeature.getObjectData(null, null);

                        if (feature) {
                          payload.properties = feature.properties;
                          payload.format = feature.format;
                          payload.feature = feature.data;
                          payload.name = feature.name;
                          payload.menuId = feature.menuId;
                        }
                    }

                    switch (pointer.type) {
                        case emp.typeLibrary.Pointer.EventType.MOUSEDOWN:
                            emp.environment.get().pubSub.publish({
                                message: payload,
                                sender: {
                                    id: transaction.mapInstanceId
                                },
                                channel: cmapi.channel.names.MAP_FEATURE_MOUSEDOWN
                            });
                            break;
                        case emp.typeLibrary.Pointer.EventType.MOUSEUP:
                            emp.environment.get().pubSub.publish({
                                message: payload,
                                sender: {
                                    id: transaction.mapInstanceId
                                },
                                channel: cmapi.channel.names.MAP_FEATURE_MOUSEUP
                            });
                            break;
                        case emp.typeLibrary.Pointer.EventType.DRAG:
                            emp.environment.get().pubSub.publish({
                                message: payload,
                                sender: {
                                    id: transaction.mapInstanceId
                                },
                                channel: cmapi.channel.names.CMAPI2_FEATURE_DRAG
                            });
                            //console.log("FEAUTRE DRAG YO!");
                            break;

                        case emp.typeLibrary.Pointer.EventType.DRAG_COMPLETE:
                            emp.environment.get().pubSub.publish({
                                message: payload,
                                sender: {
                                    id: transaction.mapInstanceId
                                },
                                channel: cmapi.channel.names.CMAPI2_FEATURE_DRAG_COMPLETE
                            });
                            //console.log("FEAUTRE DRAG COMPLETE YO!");
                            break;
                        default:
                            // feature click and Dbl click are handled elsewhere.
                            break;
                    }
                }

                delete payload.overlayId;
                delete payload.featureId;
                delete payload.parentId;
                if (feature) {
                    delete payload.properties;
                    delete payload.format;
                    delete payload.feature;
                    delete payload.menuId;
                }

                switch (pointer.type) {
                    case emp.typeLibrary.Pointer.EventType.MOUSEDOWN:
                        emp.environment.get().pubSub.publish({
                            message: payload,
                            sender: {
                                id: transaction.mapInstanceId
                            },
                            channel: cmapi.channel.names.MAP_VIEW_MOUSEDOWN
                        });
                        break;
                    case emp.typeLibrary.Pointer.EventType.MOUSEUP:
                        emp.environment.get().pubSub.publish({
                            message: payload,
                            sender: {
                                id: transaction.mapInstanceId
                            },
                            channel: cmapi.channel.names.MAP_VIEW_MOUSEUP
                        });
                        break;
                    case emp.typeLibrary.Pointer.EventType.DRAG:
                        emp.environment.get().pubSub.publish({
                            message: payload,
                            sender: {
                                id: transaction.mapInstanceId
                            },
                            channel: cmapi.channel.names.CMAPI2_MAP_DRAG
                        });
                        //console.log("MAP DRAG YO!");
                        break;

                    case emp.typeLibrary.Pointer.EventType.DRAG_COMPLETE:
                        emp.environment.get().pubSub.publish({
                            message: payload,
                            sender: {
                                id: transaction.mapInstanceId
                            },
                            channel: cmapi.channel.names.CMAPI2_MAP_DRAG_COMPLETE
                        });
                        //console.log("MAP DRAG COMPLETE YO!");
                        break;
                    case emp.typeLibrary.Pointer.EventType.SINGLE_CLICK:
                    case emp.typeLibrary.Pointer.EventType.DBL_CLICK:
                        emp.environment.get().pubSub.publish({
                            message: payload,
                            sender: {
                                id: transaction.mapInstanceId
                            },
                            channel: cmapi.channel.names.MAP_VIEW_CLICKED
                        });
                        break;
                    default:
                        break;
                }
            }
        } catch (e) {
            emp.typeLibrary.Error({
                message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.MAP_FEATURE_CLICKED + " failed due to an error.",
                jsError: e
            });
        }

    }

};
