/*global window */
var com = window.com || {};
com.octabits = com.octabits || {};
com.octabits.starfish = com.octabits.starfish || {};

com.octabits.starfish.constants = {
  PUBLISH: "publish",
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  SEVER: "sever"
};;/*global window, com */

com.octabits.starfish.utils = (function() {
    var publicInterface,
        usedIds = {};

    function generateUUID() {
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uuid;
    }

    publicInterface = {
        // Generate a UUID
        UUID: function() {
            var id,
                isUnique = false;
            // Ensure that the returned id is unique for this session
            while (isUnique === false) {
                id = generateUUID();
                if (!usedIds[id]) {
                    usedIds[id] = true;
                    isUnique = true;
                }
            }
            return id;

        },
        getUrlParameterByName: function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(window.location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        },
        EventRegister: function() {
            var i;
            this.length = 0;
            this.items = [];
            for (i = 0; i < arguments.length; i += 2) {
                if (typeof(arguments[i + 1]) !== 'undefined') {
                    this.items[arguments[i]] = arguments[i + 1];
                    this.length += 1;
                }
            }
            /**
             * @method removeItem
             * @memberof emp.helpers
             * @return {object}
             */
            this.removeItem = function(in_key) {
                var tmp_previous;
                if (typeof(this.items[in_key]) !== 'undefined') {
                    this.length -= 1;
                    tmp_previous = this.items[in_key];
                    delete this.items[in_key];
                }

                return tmp_previous;
            };
            /**
             * @method getItem
             * @memberof emp.helpers
             * @return {object}
             */
            this.getItem = function(in_key) {
                return this.items[in_key];
            };
            /**
             * @method setItem
             * @memberof emp.helpers
             * @return {object}
             */
            this.setItem = function(in_key, in_value) {
                var tmp_previous;
                if (typeof(in_value) !== 'undefined') {
                    if (typeof(this.items[in_key]) === 'undefined') {
                        this.length += 1;
                    } else {
                        tmp_previous = this.items[in_key];
                    }

                    this.items[in_key] = in_value;
                }

                return tmp_previous;
            };
            /**
             * @method hasItem
             * @memberof emp.helpers
             * @return {object}
             */
            this.hasItem = function(in_key) {
                return typeof(this.items[in_key]) !== 'undefined';
            };
            /**
             * @method clear
             * @memberof emp.helpers
             * @return {object}
             */
            this.clear = function() {
                var j;

                for (j in this.items) {
                    if (this.items.hasOwnProperty(j)) {
                        delete this.items[j];
                    }
                }

                this.length = 0;
            };

            this.addListener = function(listenerInfo) {
                if (this.getItem(listenerInfo.key) !== null && this.getItem(listenerInfo.key) !== undefined) {
                    this.getItem(listenerInfo.key).push(listenerInfo.value);
                } else {
                    var values = [];
                    values.push(listenerInfo.value);
                    this.setItem(listenerInfo.key, values);
                }
            };

            this.removeListener = function(listenerInfo) {
                var values,
                    len,
                    k;

                if (this.getItem(listenerInfo.key) !== null && this.getItem(listenerInfo.key) !== undefined) {
                    values = this.getItem(listenerInfo.key);
                    len = values.length;

                    for (k = 0; k < len; k += 1) {
                        if (values[i] === listenerInfo.value) {
                            values.splice(k, 1);
                            return true;
                        }
                    }
                }
                return false;
            };

            this.grab = function(args) {
                // retrieve array of arms registered for this event type
                var values = this.getItem(args.key);
                if (values === undefined || values === null) {
                    values = [];
                }
                return values;
            }; // end grab

        }
    };

    return publicInterface;
}());
;/*global window, com, alert */

com.octabits.starfish.Arm = function(args) {
    var active = false,
        urlId = "",
        debug = true;
    if (args.hasOwnProperty("debug")) {
        debug = args.debug;
    }
    // this.popup = args.popup;
    this.name = args.name || "Untitled";
    this.id = com.octabits.starfish.utils.UUID();
    this.hubId = args.hubId;
    this.baseUrl = args.url;
    this.width = 450;
    if (args.hasOwnProperty("width")) {
        this.width = args.width;
    }
    this.height = 400;
    if (args.hasOwnProperty("height")) {
        this.height = args.height;
    }


    // Send the id
    if (args.url.indexOf("?") === -1) {
        urlId += "?armId=" + this.id;
    } else {
        urlId += "&armId=" + this.id;
    }
    //get rid of white space
    this.url = args.url.trim();
    // Add the UUID of this Arm to the url so it can be extracted by the receiver after launch
    this.url += urlId;
    // Open the new window
    if (debug === true) {
        this.popupwin = window.open(this.url, this.id);//, "width=250, height=300"); //, titlebar=0, menubar=0, location=0, status=0");
    } else {
        this.popupwin = window.open(this.url, this.id, "width=" + this.width + ", height=" + this.height);// + ", titlebar = 0, menubar = 0, location = 0, status = 0 ");
    }
    // Track the origin so that we can compare later for security reasons
    // We don't want to be communicating with strange sea creatures
    this.origin = this.popupwin.origin;

    this.tell = function(args) {
        //var msg = JSON.stringify(args.message);
        if (active === true) {

            this.popupwin.postMessage(args.message, "*"); //, "http://localhost:8080");
        }
    };

    this.sever = function() {

        this.active = false;
        this.popupwin.close();

    };
};
;/*global window, com, alert */

com.octabits.starfish.Nerve = function(args) {
    var launcherOrigin,
        that;

    this.id = com.octabits.starfish.utils.getUrlParameterByName("armId");

    launcherOrigin = window.opener.location.origin;
    // hold on to the parent window
    this.messageSource = window.opener;
    this.listeners = new com.octabits.starfish.utils.EventRegister();
    that = this;

    window.onbeforeunload = function(e) {
  that.sever();
};


    // Called sometime after postMessage is called
    this.processMessage = function(event) {
        var msg,
            len,
            callbacks;
        // Do we trust the sender of this message?
        if (event.origin !== launcherOrigin) {
            alert("We do not trust sender");
            return;
        }

        msg = event.data;
        if (typeof msg === "string") {
            try {
                msg = JSON.parse(msg);
            } catch (e) {
                alert(e.message);
            }
        }
        if (msg.hasOwnProperty("action")) {
            switch (msg.action) {
                case com.octabits.starfish.constants.INIT:
                    that.id = msg.message.id;
                    break;
                case com.octabits.starfish.constants.PUBLISH:
                    if (typeof msg.message === "string") {
                        msg.message = JSON.parse(msg.message);

                    }
                    callbacks = that.listeners.grab({
                        key: msg.channel
                    });
                    if (callbacks.length > 0) {
                        len = callbacks.length;
                        for (i = 0; i < len; i += 1) {
                            if (callbacks[i] !== null) {
                                try {
                                    callbacks[i](msg.sender, msg.message, msg.channel);
                                } catch (err) {
                                    if (console && console.hasOwnProperty("log")) {
                                        console.log(err.message);
                                    }
                                }
                            }
                        }
                    }
                    break;
                default:
                    alert("unknown action");
                    break;
            }
        } else {
            alert("No action provided");
        }

    };

    window.addEventListener("message", this.processMessage, false);

    this.publish = function(args) {
        this.messageSource.postMessage({
                action: com.octabits.starfish.constants.PUBLISH,
                channel: args.channel,
                message: args.message,
                sender: {
                    id: that.id
                }
            },
            launcherOrigin);
    };
    this.subscribe = function(args) {
        this.listeners.addListener({
            key: args.channel,
            value: args.callback
        });
        this.messageSource.postMessage({
                action: com.octabits.starfish.constants.SUBSCRIBE,
                channel: args.channel,
                sender: {
                    id: that.id
                }
            },
            launcherOrigin);
    };
    this.unsubscribe = function(args) {
        this.listeners.removeListener({
            key: args.channel,
            value: args.callback
        });
        this.messageSource.postMessage({
                action: com.octabits.starfish.constants.UNSUBSCRIBE,
                channel: args.channel,
                sender: {
                    id: that.id
                }
            },
            launcherOrigin);
    };
    this.sever = function(args) {
        this.messageSource.postMessage({
                action: com.octabits.starfish.constants.SEVER,
                channel: "com.octabits.arm.sever",
                sender: {
                    id: that.id
                }
            },
            launcherOrigin);
    };

};
;/*global window, com, alert */

// Hub is the brain that acts as the receiver / dispatcher for all messages
com.octabits.starfish.Hub = function() {
    var arms = {},
        id = com.octabits.starfish.utils.UUID(),
        listeners = new com.octabits.starfish.utils.EventRegister(),
        that = this;

    window.onbeforeunload = function(e) {
        that.closeAll();
    };

    // Check to see if the window we are communicating with was in fact launched as an arm and still has the correct origin
    function checkTrust(event) {
        var trustedArm = null,
            arm;
        for (arm in arms) {
            if (arms.hasOwnProperty(arm)) {
                // ensure that the pop was launched by this code, and the origin for    that popup has not changed since it was launched
                if ((event.sender.id === arms[arm].id) && (event.origin === arms[arm].origin)) {
                    trustedArm = arms[arm];
                    break;
                }
            }
        }
        return trustedArm;
    }


    function receiveMessage(event) {
        // Do we trust the sender of this message?  (might be
        // different from what we originally opened, for example).
        var arm = checkTrust(event.data),
            subscribedArms = [];

        if (arm !== null) {
            var msg = event.data;
            console.log(JSON.stringify(msg));
            switch (msg.action) {
                // Nerve is publishing a message back to Hub
                case com.octabits.starfish.constants.PUBLISH:
                    subscribedArms = listeners.grab({
                        key: msg.channel
                    });
                    if (subscribedArms.length > 0) {
                        // send the message to all the other arms that are subscribed to this channel
                        that.publish({
                            message: event.data,
                            arms: subscribedArms
                        });
                    }
                    break;
                    // Nerve is subscribing to a message channel
                case com.octabits.starfish.constants.SUBSCRIBE:
                    listeners.addListener({
                        key: msg.channel,
                        value: arm
                    });
                    break;
                case com.octabits.starfish.constants.UNSUBSCRIBE:
                    listeners.removeListener({
                        channel: msg.channel,
                        arm: arm
                    });
                    break;
                case com.octabits.starfish.constants.SEVER:
                    that.arm.sever({
                        url: arm.baseUrl
                    });
                    break;
                default:
                    alert("Unknown message action: " + msg.action);
                    break;
            }
        } else {
            alert("untrusted Message! Came from: " + event.origin);
        }
    }
    window.addEventListener("message", receiveMessage, false);
    /*
        window.onunload = function() {
            for (arm in arms) {
                if (arms.hasOwnProperty(arm)) {
                    // ensure that the pop was launched by this code, and the origin for    that popup has not changed since it was launched
                    arm.popupwin.close();
                }
            }
        }
        */

    /*
        var confirmOnPageExit = function(e) {
            // If we haven't been passed the event get the window.event
            e = e || window.event;

            var message = 'Any text will block the navigation and display a prompt';

            // For IE6-8 and Firefox prior to version 4
            if (e) {
                e.returnValue = message;
            }

            // For Chrome, Safari, IE8+ and Opera 12+
            return message;
        }

        window.onbeforeunload = confirmOnPageExit;
    */

    this.arm = {
        grow: function(args) {
            var arm;
            arm = arms[args.url];
            if (!arm) {

                arm = new com.octabits.starfish.Arm({
                    url: args.url,
                    hubId: id
                });
                arms[args.url] = arm;
            } else {
                arm.popupwin.focus();
            }
            return arm;
        },
        sever: function(args) {
            var arm = arms[args.url];
            if (arm) {
                arm.sever();
                delete arms[args.url];
            }
        },
        grab: function() {
            var armIds = [],
                arm;
            for (arm in arms) {
                if (arms.hasOwnProperty(arm)) {
                    armIds.push(arms[arm]);
                }
            }
            return armIds;
        }
    };

    this.broadcast = function(args) {
        var arm;
        for (arm in arms) {
            if (arms.hasOwnProperty(arm)) {
                arms[arm].popupwin.postMessage({
                    action: com.octabits.starfish.constants.PUBLISH,
                    channel: args.channel,
                    message: args.message,
                    sender: {
                        id: id
                    }
                }, "*");
            }
        }
    };

    this.publish = function(args) {
        var arm,
            len = args.arms.length,
            i,
            senderId = args.message.sender.id;
        for (i = 0; i < len; i++) {
            arm = args.arms[i];
            if (arm !== null && arm.hasOwnProperty("popupwin")) {
                // filter out the message sender in case they also subsribe to the cahnel they are publoishing on
                if (senderId !== arm.id) {
                    arm.popupwin.postMessage(args.message, "*");
                }
            }
        }
    };

    this.closeAll = function() {
        var arm;
        for (arm in arms) {
            if (arms.hasOwnProperty(arm)) {
                // ensure that the pop was launched by this code, and the origin for    that popup has not changed since it was launched
                arms[arm].popupwin.close();
                delete arms[arm];
            }
        }
    };
};
