/*global emp3, ozpIwc */
emp3.api.environment = emp3.api.environment || {};
emp3.api.environment.iwc = (function() {
    var template = emp3.api.createEnvironmentTemplate();
    var iwcClient;
    var channelLookup = {};
    var callbackLookup = {};
    var adjustChannelName = function(channelName) {
        return "/cmapi_" + channelName.replace(/\./g, '_');
    };
    var revertChannelName = function(channelName) {
        channelName = channelName.replace("/cmapi_", "");
        return channelName.replace(/\_/g, '.');
    };
    var receiveMessage = function(event) {
        var msg = event.newValue,
            callback,
            callbackList;
        if (msg.sender.id !== iwcClient.address) {
            callbackList = callbackLookup[msg.channel];
            for (callback in callbackList) {
                if (callbackList.hasOwnProperty(callback) && typeof callbackList[callback] === "function") {
                    callbackList[callback](msg.sender, msg.msg, revertChannelName(msg.channel));
                }
            }
        }

    };

    template.name = "Ozone Platform Inter Widget Communication (IWC)";

    template.version = "1.0.0";

    template.properties = {};
    template.sender = { id: "not-set" };
    template.iwcHost = "vendor/iwc/";

    template.init = function(args) {
        var success = false;
        if (ozpIwc !== undefined && ozpIwc !== null && typeof ozpIwc.hasOwnProperty === "function" && ozpIwc.hasOwnProperty("Client")) {
            iwcClient = new ozpIwc.Client(this.iwcHost);
            var closureArgs = args;
            iwcClient.connect().then(function() {
                console.log("emp3 IWC Environment instance connected: "+iwcClient.address); // eslint-disable-line no-console
                closureArgs.initcallback({
                    success: true
                });
                template.sender.id = iwcClient.address;

            }).catch(function(err) {
                console.error("IWC Client failed to connect:", err);
            });
            success = true;

        } else {
            console.error("The Ozone Platform IWC JavaScript was not found on this page.  Please ensure that the path to ozpIwc-client.js on your app is correct");

            args.initcallback({
                success: false
            });
        }
        return success;
    };

    template.destroy = function() {
        iwcClient.disconnect();

        return true;
    };
    template.createInstance = function() {

        return true;
    };

    function getChannel(achannel) {
        var channel = channelLookup[achannel];
        if (channel === undefined || channel === null) {
            // Setting lifespan to Bound makes sure the data at this reference is removed once all active IWC refs are removed
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
                id: iwcClient.address
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
        channel.watch(receiveMessage);
    };

    return template;
}());
