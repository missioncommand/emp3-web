/*global emp, ozpIwc */

emp.environment.iwc = (function() {

    var template = emp.createEnvironmentTemplate();
    var iwcClient;
    var channelLookup = {};
    var callbackLookup = {};
    var adjustChannelName = function(channelName) {
        return "/cmapi_" + channelName.replace(/\./g, '_');
    };
     var revertChannelName = function(channelName){
        channelName = channelName.replace("/cmapi_", "");
        return channelName.replace(/\_/g,'.');
    };
    var recieveMessage = function(event) {
        var msg = event.newValue,
            callback,
            callbackList;

        if (msg.sender.id !== template.sender.id) {
            callbackList = callbackLookup[msg.channel];
            for (callback in callbackList) {
                if (callbackList.hasOwnProperty(callback) && typeof callbackList[callback] === "function") {
                    callbackList[callback](msg.sender,msg.msg,  revertChannelName(msg.channel));
                }
            }
        }

    };
    template.name = "Ozone Platform Inter Widget Communication (IWC)";

    template.version = "1.0.0";

    template.properties = {};
    template.sender = { id: "broadcast" };
    template.iwcHost = "vendor/iwc/";

    template.init = function(args) {
        var transactionMessage;
        var success = false;
        if (ozpIwc !== undefined && ozpIwc !== null && typeof ozpIwc.hasOwnProperty === "function" && ozpIwc.hasOwnProperty("Client")) {
            iwcClient = new ozpIwc.Client(this.iwcHost);
            var closureArgs = args;
            var that = this;
            iwcClient.connect().then(function() {

                closureArgs.initcallback({
                    success: true
                });
                template.sender.id = 'broadcast'; //iwcClient.address;
                if (closureArgs.messageId !== undefined &&
                    closureArgs.messageId !== null) {
                    transactionMessage = {
                        messageId: closureArgs.messageId,
                        originatingChannel: "",
                        status: "success",
                        details: {},
                        failures: []
                    };
                    template.pubSub.publish({
                        channel: "map.message.complete",
                        message: transactionMessage,
                        sender: {
                            id: 'broadcast'
                        }
                    });
                }
            }).catch(function(err) {
                console.error("IWC Client failed to connect to " + that.iwcHost + " :", err);
            });
            success = true;

        } else {

            console.error("The Ozone Platform IWC JavaScript ozpIwc object was not found on this page.  Please ensure that the path to ozpIwc-client.js in your app is correct");

            args.initcallback({
                success: false
            });
        }
        return success;

    };

    /**
     * Adds an instance of the map into a div specified by user.  The map
     * in turn will send a message back to the caller indicating the instanceId
     * of the map.
     */
    template.createInstance = function(args) {
        var result = false;

        // Make sure all the required arguments are passed in.
        if (args) {
            if (args.hasOwnProperty("containerId") &&
                args.hasOwnProperty("messageId")) {

                // Instantiate the map in the container specified.
                emp.instanceManager.createInstance({
                    instanceDomId: args.containerId,
                    messageId: args.messageId,
                    config: args.config,
                    extent: args.extent,
                    environment: template,
                    startMapEngineId: args.startMapEngineId
                });

                // Indicate the an attempt to instantiate the map
                // was made without error.
                result = true;
            }
        }

        return result;
    };

    template.destroyInstance = function(args) {
        var result = false;

        // Make sure all the required arguments are passed in.
        if (args) {
            if (args.hasOwnProperty("id")) {

                // Destroy the map with the specified id.
                emp.instanceManager.destroyInstance({
                    mapInstanceId: args.id,
                    messageId: args.messageId
                });

                result = true;
            }
        }

        return result;
    };

    function getChannel(achannel) {
        var channel = channelLookup[achannel];
        if (channel === undefined || channel === null) {
            channelLookup[achannel] = new iwcClient.data.Reference(achannel, { "lifespan": "Bound", "respondOn": "all" });
            channel = channelLookup[achannel];
        }
        return channel;
    }

    template.pubSub.publish = function(args) {
        var cName = adjustChannelName(args.channel);
        var channel = getChannel(cName);
        channel.set({
            msg: args.message,
            channel: cName,
            sender: {
                id: 'broadcast'
            }
        }).catch(function(err) {
            console.error("ERROR publishing core message: " + cName + " - " + JSON.stringify(err));
        });
        return true;
    };

    template.pubSub.subscribe = function(args) {
        var cName = adjustChannelName(args.channel);
        var channel = getChannel(cName);
        if (callbackLookup[cName] !== undefined) {
            callbackLookup[cName][args.callback] = args.callback;
        } else {
            callbackLookup[cName] = {};
            callbackLookup[cName][args.callback] = args.callback;
        }
        channel.watch(recieveMessage);
    };

    template.pubSub.unsubscribe = function(args) {
        var cName = adjustChannelName(args.channel);
        var channel = getChannel(cName);
        if (callbackLookup[cName] !== undefined) {
            delete callbackLookup[cName][args.callback];
        }
        channel.unwatch(cName);
        return true; //success;
    };

    return template;
}());
