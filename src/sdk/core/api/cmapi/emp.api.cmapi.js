/*global emp, cmapi*/

/**
 * Common Map Widget API - See Specification for details
 *
 * @private
 * @namespace
 *
 */
emp.api.cmapi = emp.api.cmapi || {};
emp.api.cmapi.publisher = emp.api.cmapi.publisher || {};

/**
 * SOURCE Tag
 * @protected
 * @constant
 * @type {string}
 */

emp.api.cmapi.SOURCE = "emp-api-cmapi";
emp.api.sources.push(emp.api.cmapi.SOURCE);

emp.api.cmapiMapInstanceInterface = function(args)
{

    var mapInstanceId = args.mapInstanceId;
    var _widgetId;
    var channels = [
        cmapi.channel.names.MAP_CONVERT,
        cmapi.channel.names.MAP_OVERLAY_CREATE,
        cmapi.channel.names.MAP_OVERLAY_REMOVE,
        cmapi.channel.names.MAP_OVERLAY_HIDE,
        cmapi.channel.names.MAP_OVERLAY_SHOW,
        cmapi.channel.names.MAP_OVERLAY_UPDATE,
        cmapi.channel.names.MAP_OVERLAY_STYLE,
        cmapi.channel.names.MAP_FEATURE_PLOT_URL,
        cmapi.channel.names.MAP_FEATURE_UNPLOT,
        cmapi.channel.names.MAP_FEATURE_HIDE,
        cmapi.channel.names.MAP_FEATURE_SHOW,
        cmapi.channel.names.MAP_FEATURE_DESELECTED,
        cmapi.channel.names.MAP_FEATURE_SELECTED,
        cmapi.channel.names.MAP_FEATURE_UPDATE,
        cmapi.channel.names.MAP_FEATURE_EDIT,
        cmapi.channel.names.MAP_FEATURE_DRAW,
        cmapi.channel.names.MAP_VIEW_LOCK,
        cmapi.channel.names.MAP_VIEW_ZOOM,
        cmapi.channel.names.MAP_VIEW_CENTER_OVERLAY,
        cmapi.channel.names.MAP_VIEW_CENTER_FEATURE,
        cmapi.channel.names.MAP_VIEW_CENTER_LOCATION,
        cmapi.channel.names.MAP_VIEW_CENTER_BOUNDS,
        cmapi.channel.names.MAP_VIEW_COORDINATESYSTEM,
        cmapi.channel.names.MAP_VIEW_LOOKAT_LOCATION,
        cmapi.channel.names.MAP_GET,
        cmapi.channel.names.MAP_SWAP,
        cmapi.channel.names.MAP_STATUS_REQUEST,
        cmapi.channel.names.MAP_MESSAGE_CANCEL,
        cmapi.channel.names.MAP_MESSAGE_COMPLETE,
        cmapi.channel.names.MAP_FEATURE_PLOT_BATCH,
        cmapi.channel.names.MAP_FEATURE_UNPLOT_BATCH,
        cmapi.channel.names.MAP_FEATURE_SELECTED_BATCH,
        cmapi.channel.names.MAP_FEATURE_DESELECTED_BATCH,
        cmapi.channel.names.CMAPI2_VISIBILITY_GET,
        cmapi.channel.names.CMAPI2_MAP_CONFIG,
        cmapi.channel.names.CMAPI2_FEATURE_EVENT_ADD,
        cmapi.channel.names.CMAPI2_FEATURE_EVENT_REMOVE,
        cmapi.channel.names.CMAPI2_FEATURE_EVENT_UPDATE,
        cmapi.channel.names.CMAPI2_FREEHAND_START,
        cmapi.channel.names.CMAPI2_FREEHAND_STOP

    ];

    var messageHandler = function(sender, msg, channel) {
        var handler = cmapi.channel.handler[channel];
        var message = {};
        var oSender = typeof sender === "string" ? JSON.parse(sender) : sender;
        var item;

        if (oSender.id === _widgetId) {
            // We sent this message so we dump it.
            return;
        }

        if ((msg === undefined) || (msg === null) || (msg === "")) {
            emp.typeLibrary.Error({
              "level": 2,
              "message": "[CMAPI] Inbound Message was empty",
              "coreId": "UNKNOWN"
            });

            return;
        }
        message.payload = (typeof msg === "string" ? JSON.parse(msg) : msg);
        if (Array.isArray(message.payload)) {
            // For messages with an array of payloads we need to use the same messageId
            // Pull the messageId from the first payload
            item = message.payload[0];
            if (item !== undefined &&
                item !== null &&
                item.hasOwnProperty("messageId") &&
                item.messageId !== null &&
                item.messageId.length > 0) {
                message.messageId = item.messageId;
            }
        } else if (message.payload.messageId !== undefined &&
            message.payload.messageId !== null) {
            message.messageId = message.payload.messageId;
        }

        if (handler) {
            // If a channel definition was found pass the message to it to
            handler.process({
                message: message,
                sender: oSender,
                mapInstanceId: mapInstanceId,
                originalMessage: typeof msg === "string" ? msg : JSON.stringify(msg)
            });
        } else {
            emp.typeLibrary.Error({
                message: "Received a message with no handler over channel " + channel + "."
            });
        }
    };

    var callPublisher = function(args) {
        var publisher;
        var channel = emp.api.cmapi.publisher.intentChannelMap[args.intent];

        if (channel) {
            publisher = cmapi.channel.publisher[channel];

            if (publisher) {
                publisher.process(args);
            } else {
                emp.typeLibrary.Error({
                    level: emp.typeLibrary.Error.level.CATASTROPHIC,
                    message: "Intent " + args.intent + " has no publisher defined. callPublisher."
                });
            }
        } else {
            emp.typeLibrary.Error({
                level: emp.typeLibrary.Error.level.CATASTROPHIC,
                message: "Intent " + args.intent + " has no channel defined. callPublisher."
            });
        }
    };

    var transactionComplete = function(oTransaction) {
        var channel;
        var publisher;
        var sOriginChannel = oTransaction.originChannel;

        if (oTransaction.source !== emp.api.cmapi.SOURCE) {
            switch (oTransaction.intent) {
                case emp.intents.control.FEATURE_ADD:
                    if (oTransaction.items.length > 1) {
                        oTransaction.originChannel = cmapi.channel.names.MAP_FEATURE_PLOT_BATCH;
                    } else if ((oTransaction.items.length > 0) &&
                            (oTransaction.items[0].url)) {
                        oTransaction.originChannel = cmapi.channel.names.MAP_FEATURE_PLOT_URL;
                    } else {
                        oTransaction.originChannel = cmapi.channel.names.MAP_FEATURE_PLOT;
                    }
                    oTransaction.sendTransactionComplete = true;
                    break;
                case emp.intents.control.FEATURE_REMOVE:
                    if (oTransaction.items.length > 1) {
                        oTransaction.originChannel = cmapi.channel.names.MAP_FEATURE_UNPLOT_BATCH;
                    } else {
                        oTransaction.originChannel = cmapi.channel.names.MAP_FEATURE_UNPLOT;
                    }
                    oTransaction.sendTransactionComplete = true;
                    break;
                case emp.intents.control.OVERLAY_ADD:
                    oTransaction.originChannel = cmapi.channel.names.MAP_OVERLAY_CREATE;
                    oTransaction.sendTransactionComplete = true;
                    break;
                case emp.intents.control.OVERLAY_REMOVE:
                    oTransaction.originChannel = cmapi.channel.names.MAP_OVERLAY_REMOVE;
                    oTransaction.sendTransactionComplete = true;
                    break;
                case emp.intents.control.EDIT_BEGIN:
                    oTransaction.originChannel = cmapi.channel.names.MAP_FEATURE_EDIT;
                    oTransaction.sendTransactionComplete = true;
                    break;
                default:
                    // A transaction with a source not equal the cmapi.
                    // So we don't need to send a completion.
                    return;
            }
        }

        channel = emp.api.cmapi.publisher.intentChannelMap[emp.intents.control.TRANSACTION_COMPLETE];
        publisher = cmapi.channel.publisher[channel];

        if (publisher) {
            publisher.process(oTransaction);
        } else {
            emp.typeLibrary.Error({
                message: "Intent " + oTransaction.intent + " has no publisher defined."
            });
        }

        if (oTransaction.hasOwnProperty("failures") &&
                (oTransaction.failures.length > 0)) {
            // There are errors.
            // Process them thru the error channel.
            publisher = cmapi.channel.publisher[cmapi.channel.names.MAP_ERROR];
            publisher.process(oTransaction);
        }

        oTransaction.originChannel = sOriginChannel;
    };

    var statusChangeHdlr = function(oTrans)
    {
      var oTransaction;
//console.log('Status Chg :' + oTrans.items[0].status + ' from:' + oTrans.mapInstanceId + ' process by:' + mapInstanceId + '.');
      switch (oTrans.items[0].status) {
          case emp.map.states.INITIALIZING:
          case emp.map.states.READY:
          case emp.map.states.SHUTDOWN_IN_PROGRESS:
          case emp.map.states.TEARDOWN:
          case emp.map.states.MAP_SWAP_IN_PROGRESS:
          case emp.map.states.MAP_INSTANCE_INIT_FAILED:
              oTransaction = new emp.typeLibrary.Transaction({
                  intent: emp.intents.control.STATUS_RESPONSE_INIT,
                  mapInstanceId: oTrans.mapInstanceId,
                  sendTransactionComplete: false,
                  source: emp.api.cmapi.SOURCE,
                  items: oTrans.items
              });

              oTransaction.run();
              break;
      }
    };

    var publicInterface = {
        init: function()
        {
            var i,
                len,
                environment = emp.environment.get();

            // TODO this function is not implemented in the browser env.
            _widgetId = environment.getInstanceId() || mapInstanceId;

            len = channels.length;

            for (i = 0; i < len; i++) {
                environment.pubSub.subscribe({
                    channel: channels[i],
                    callback: messageHandler,
                    mapInstanceId: mapInstanceId
                });
            }

            emp.transactionQueue.listener.add({
                type: emp.intents.control.TRANSACTION_COMPLETE,
                mapInstanceId: mapInstanceId,
                callback: transactionComplete
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.STATUS_RESPONSE_ABOUT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.STATUS_RESPONSE_COORD_SYSTEM,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.STATUS_RESPONSE_FORMAT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.STATUS_RESPONSE_INIT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.STATUS_RESPONSE_SELECTED,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.STATUS_REQUEST_SCREENSHOT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.EDIT_UPDATE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.DRAW_UPDATE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.FEATURE_CLICK,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.SELECTION_OUTBOUND,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.DESELECTION_OUTBOUND,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.FEATURE_OUTBOUND_PLOT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.SYMBOL_OUTBOUND_PLOT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.POINTER,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.CLICK,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.SELECTION_BOX,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.MENU_CONTEXT_CLICK,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.ERROR,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.MENU_DRAW_FEATURE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.FEATURE_REMOVE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.OVERLAY_REMOVE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.VIEW_CHANGE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.VIEW_GET,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.STATUS_CHANGE,
                mapInstanceId: mapInstanceId,
                callback: statusChangeHdlr
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.FREEHAND_LINE_DRAW_START,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.FREEHAND_LINE_DRAW_END,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.add({
                type: emp.intents.control.FREEHAND_LINE_DRAW_UPDATE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });
        },
        destroy: function()
        {
            var i,
                len,
                environment = emp.environment.get();

            len = channels.length;

            for (i = 0; i < len; i++) {
                environment.pubSub.unsubscribe({
                    channel: channels[i],
                    callback: messageHandler,
                    mapInstanceId: mapInstanceId
                });
            }
            emp.transactionQueue.listener.remove({
                type: emp.intents.control.TRANSACTION_COMPLETE,
                mapInstanceId: mapInstanceId,
                callback: transactionComplete
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.STATUS_RESPONSE_ABOUT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.STATUS_RESPONSE_COORD_SYSTEM,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.STATUS_RESPONSE_FORMAT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.STATUS_RESPONSE_INIT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.STATUS_RESPONSE_SELECTED,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.STATUS_REQUEST_SCREENSHOT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.EDIT_UPDATE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.DRAW_UPDATE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.FEATURE_CLICK,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.SELECTION_OUTBOUND,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.DESELECTION_OUTBOUND,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.FEATURE_OUTBOUND_PLOT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.SYMBOL_OUTBOUND_PLOT,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.POINTER,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.CLICK,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.SELECTION_BOX,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.MENU_CONTEXT_CLICK,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.ERROR,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.MENU_DRAW_FEATURE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.FEATURE_REMOVE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.OVERLAY_REMOVE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.VIEW_CHANGE,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.VIEW_GET,
                mapInstanceId: mapInstanceId,
                callback: callPublisher
            });

            emp.transactionQueue.listener.remove({
                type: emp.intents.control.STATUS_CHANGE,
                mapInstanceId: mapInstanceId,
                callback: statusChangeHdlr
            });
        },
        processMessage: function(sender, msg, channel)
        {
            messageHandler(sender, msg, channel);
        }
    };

    return publicInterface;
};

emp.api.cmapiInterface = function()
{
    var sFirstMapInstanceId = "";
    var mapInstanceData = {};
    //var environment;
    var broadcastChannels = [
        cmapi.channel.names.MAP_OVERLAY_CREATE,
        cmapi.channel.names.MAP_OVERLAY_REMOVE,
        cmapi.channel.names.MAP_OVERLAY_UPDATE,
        cmapi.channel.names.MAP_OVERLAY_STYLE,
        cmapi.channel.names.MAP_OVERLAY_CLEAR,
        cmapi.channel.names.MAP_OVERLAY_CLUSTER_SET,
        cmapi.channel.names.MAP_OVERLAY_CLUSTER_REMOVE,
        cmapi.channel.names.MAP_OVERLAY_CLUSTER_ACTIVATE,
        cmapi.channel.names.MAP_OVERLAY_CLUSTER_DEACTIVATE,
        cmapi.channel.names.MAP_FEATURE_PLOT,
        cmapi.channel.names.MAP_FEATURE_PLOT_URL,
        cmapi.channel.names.MAP_FEATURE_UNPLOT,
        cmapi.channel.names.MAP_FEATURE_UPDATE,
        cmapi.channel.names.MAP_GET,
        //cmapi.channel.names.MAP_MENU_DRAWING_CREATE,
        //cmapi.channel.names.MAP_MENU_DRAWING_REMOVE,
        cmapi.channel.names.MAP_STATUS_REQUEST,
        cmapi.channel.names.MAP_FEATURE_PLOT_BATCH,
        cmapi.channel.names.MAP_FEATURE_UNPLOT_BATCH,
        cmapi.channel.names.MAP_MENU_CREATE,
        cmapi.channel.names.MAP_MENU_REMOVE,
        cmapi.channel.names.MAP_MENU_ACTIVE
    ];

    var setFirstInstanceId = function()
    {
        var aKeyList = emp.helpers.associativeArray.getKeys(mapInstanceData);

        if (aKeyList.length > 0)
        {
            sFirstMapInstanceId = aKeyList[0];
        }
        else
        {
            sFirstMapInstanceId = "";
        }
    };

    /*
     * This message handler handles the messages that are broadcasts.
     * It send the messages to one of the map instances.
     */
    var messageHandler = function(sender, msg, channel)
    {
        if (!emp.helpers.isEmptyString(sFirstMapInstanceId))
        {
            if (mapInstanceData[sFirstMapInstanceId] === undefined)
            {
                setFirstInstanceId();
                if (emp.helpers.isEmptyString(sFirstMapInstanceId) ||
                        (mapInstanceData[sFirstMapInstanceId] === undefined))
                {
                    return;
                }
            }

            mapInstanceData[sFirstMapInstanceId].processMessage(sender, msg, channel);
        }
    };

    var setupFeatureProcessing = function()
    {
        var iIndex,
            len,
            environment = emp.environment.get();

        len = broadcastChannels.length;

        for (iIndex = 0; iIndex < len; iIndex++) {
            environment.pubSub.subscribe({
                channel: broadcastChannels[iIndex],
                callback: messageHandler,
                mapInstanceId: ""
            });
        }
    };

    var stopFeatureProcessing = function()
    {
        var iIndex,
            len,
            environment = emp.environment.get();

        len = broadcastChannels.length;

        for (iIndex = 0; iIndex < len; iIndex++) {
            environment.pubSub.unsubscribe({
                channel: broadcastChannels[iIndex],
                callback: messageHandler,
                mapInstanceId: ""
            });
        }
    };

    var publicInterface = {
        init: function() {},
        createMapInstance: function(args)
        {
            var iMapInstanceCnt;
            var cmapiMapInterface = emp.api.cmapiMapInstanceInterface(args);

            cmapiMapInterface.init(args);
            mapInstanceData[args.mapInstanceId] = cmapiMapInterface;
            iMapInstanceCnt = emp.helpers.associativeArray.size(mapInstanceData);
            setFirstInstanceId();
            if (iMapInstanceCnt === 1)
            {
                //environment = args.environment;
                setupFeatureProcessing();
            }
        },
        destroyMapInstance: function(args)
        {
            var iMapInstanceCnt;
            if (mapInstanceData.hasOwnProperty(args.instanceId))
            {
                mapInstanceData[args.instanceId].destroy();
                delete mapInstanceData[args.instanceId];
                setFirstInstanceId();
                iMapInstanceCnt = emp.helpers.associativeArray.size(mapInstanceData);
                if (iMapInstanceCnt === 0)
                {
                    stopFeatureProcessing();
                }
            }
        }
    };

    return publicInterface;
};
