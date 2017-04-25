/*global emp, Ozone, cmapi, window */
var OWF = OWF || {};

emp.environment.owf = (function () {
  var template = emp.createEnvironmentTemplate(),

    /**
     * Widget State
     * @method
     * @memberOf emp.environment.owf
     * @type {String}
     * @private
     */
    widgetState = null,
    /**
     * Widget Eventing Controller Container
     * @method
     * @memberOf emp.environment.owf
     * @type {object}
     * @private
     */
    widgetEventingController = null,
    // function that will be invoked once the OWF environment is done initializing following the .init() invocation
    initCallback,
    shutdownCallback,
    subscribedCallbacks = {},
    //owfLoadAttempted = false,
    // Track if this instance of map was launched by a widget to be used privately
    isPrivateInstance = false,
    // If this is a private map we need to track the ownerId as the senderId provided in the launchData
    // and only listen to and send to this widget
    ownerId;
/*
  function loadScript(args) {

    // The above code is simple but does not generate an error
    // if the request generates the "Blocked loading mixed active content " error.
    var script = document.createElement("script");
    script.type = "text/javascript";

    if (script.readyState) { //IE
      script.onreadystatechange = function () {
        script.intervalCount = 50;
        script.timer = setInterval(function () {
          if (script.readyState === 'loaded' || script.readyState === 'complete') {
            // IE does not report error.
            // So if the object does not exists we wait
            // for a few cycles before failing.
            if (window[args.objectToLoad] === undefined) {
              script.intervalCount--;
              if (script.intervalCount === 0) {
                clearInterval(script.timer);
                args.failedcallback();
              }
            } else {
              clearInterval(script.timer);
              args.callback();
            }
          } else {
            script.intervalCount--;
            if (script.intervalCount === 0) {
              clearInterval(script.timer);
              args.failedcallback();
            }
          }

        }, 100);
        script.onreadystatechange = null;
      };
    } else { //Others
      script.onerror = function () {
        args.failedcallback();
      };
      script.onload = function () {
        // We need to make sure the object is there.
        // The server may have sent an html page with
        // error text on it.
        if (window[args.objectToLoad] === undefined) {
          args.failedcallback();
        } else {
          args.callback();
        }
      };
    }
    script.src = args.url;
    document.getElementsByTagName("head")[0].appendChild(script);

  }
*/
  function checkSender(sender) {
    if (typeof sender === "string") {
      try {
        sender = JSON.parse(sender);
      } catch (err) {
        sender = {
          id: emp.helpers.id.newGUID()
        };
        emp.typeLibrary.Error({
          message: "Sender was a string for the OWF widget intent, but it was not valid JSON. A default sender object with a random ID was generated."
        });
      }
    }
    return sender;
  }

  /**
   * Register OWF Widget Intents
   * @method
   * @memberOf emp.environment.owf
   * @protected
   * @return {void}
   */

  function plotIntentKml(sender, intent, data) {
    var payload = {},
      oItem,
      cmap,
      transaction;

    sender = checkSender(sender);
    // check for common_map metadata
    if (data.hasOwnProperty("common_map")) {
      cmap = data.common_map;
      if (cmap.hasOwnProperty("overlayId")) {
        payload.overlayId = cmap.overlayId;
      } else {
        payload.overlayId = sender.id;
      }
      if (cmap.hasOwnProperty("featureId")) {
        payload.featureId = cmap.featureId;
      } else {
        payload.featureId = emp.helpers.id.newGUID();
      }
      if (cmap.hasOwnProperty("name")) {
        payload.name = cmap.name;
      }
      if (cmap.hasOwnProperty("zoom")) {
        payload.zoom = cmap.zoom;
      }
      payload.feature = data.data;
      payload.format = "kml";
      oItem = new emp.typeLibrary.Feature(payload);
      transaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.FEATURE_ADD,
        transactionId: "",
        sender: sender.id,
        originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
        source: emp.api.cmapi.SOURCE,
        originalMessage: payload,
        messageOriginator: sender.id,
        originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
        items: [oItem]
      });
      transaction.queue();
    }
  }


  function loadIntentKml(sender, intent, data) {
    var payload = {},
      item,
      cmap,
      transaction,
      i,
      len,
      items = [];

    sender = checkSender(sender);
    // check for common_map metadata
    len = data.data.length;
    for (i = 0; i < len; i++) {
      payload.url = data.data[i];
      payload.format = "kml";
      payload.visible = true;
      payload.save = false;
      payload.params = {};
      payload.transactionId = emp.helpers.id.newGUID();
      if (data.hasOwnProperty("common_map")) {
        cmap = data.common_map;
      } else {
        cmap = {};
      }
      if (cmap.hasOwnProperty("overlayId")) {
        payload.overlayId = cmap.overlayId;
      } else {
        payload.overlayId = sender.id;
      }
      if (cmap.hasOwnProperty("featureId")) {
        payload.featureId = cmap.featureId;
      } else {
        payload.featureId = emp.helpers.id.newGUID();
      }
      if (cmap.hasOwnProperty("name")) {
        payload.name = cmap.name;
      } else {
        payload.name = "Untitled";
      }
      if (cmap.hasOwnProperty("zoom")) {
        payload.zoom = cmap.zoom;
      }

      item = new emp.typeLibrary.Feature(payload);
      items.push(item);
    }
    transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.FEATURE_ADD,
      transactionId: payload.transactionId,
      sender: sender.id,
      originChannel: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
      source: emp.api.cmapi.SOURCE,
      originalMessage: payload,
      messageOriginator: sender.id,
      originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
      items: items
    });
    transaction.queue();
  }

  function plotIntentJson(sender, intent, data) {
    var payload = {},
      oItem,
      cmap,
      transaction;

    sender = checkSender(sender);
    // check for common_map metadata
    if (data.hasOwnProperty("common_map")) {
      cmap = data.common_map;
      if (cmap.hasOwnProperty("overlayId")) {
        payload.overlayId = cmap.overlayId;
      } else {
        payload.overlayId = sender.id;
      }
      if (cmap.hasOwnProperty("featureId")) {
        payload.featureId = cmap.featureId;
      } else {
        payload.featureId = emp.helpers.id.newGUID();
      }
      if (cmap.hasOwnProperty("name")) {
        payload.name = cmap.name;
      } else {
        payload.name = "Untitled";
      }
      if (cmap.hasOwnProperty("zoom")) {
        payload.zoom = cmap.zoom;
      }
      payload.feature = data.data;
      payload.format = "geojson";
      oItem = new emp.typeLibrary.Feature(payload);
      transaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.FEATURE_ADD,
        transactionId: "",
        sender: sender.id,
        originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
        source: emp.api.cmapi.SOURCE,
        originalMessage: payload,
        messageOriginator: sender.id,
        originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
        items: [oItem]
      });
      transaction.queue();
    }
  }

  function loadIntentJson(sender, intent, data) {
    var payload = {},
      item,
      cmap,
      transaction,
      i,
      len;

    function getJsonSuccess(data) {

      payload.feature = data;
      payload.format = "geojson";
      item = new emp.typeLibrary.Feature(payload);
      transaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.FEATURE_ADD,
        transactionId: emp.helpers.emp.helpers.id.newGUID(),
        sender: sender.id,
        originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
        source: emp.api.cmapi.SOURCE,
        originalMessage: payload,
        messageOriginator: sender.id,
        originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
        items: [item]
      });
      transaction.queue();
    }


    function getJsonFailure() {
      emp.typeLibrary.Error({
        message: "error loading GeoJSON from URL with uri-list/geo+json"
      });
    }

    sender = checkSender(sender);
    // check for common_map metadata
    if (data.hasOwnProperty("common_map")) {
      cmap = data.common_map;
      if (cmap.hasOwnProperty("overlayId")) {
        payload.overlayId = cmap.overlayId;
      } else {
        payload.overlayId = sender.id;
      }
      if (cmap.hasOwnProperty("featureId")) {
        payload.featureId = cmap.featureId;
      } else {
        payload.featureId = emp.helpers.id.newGUID();
      }
      if (cmap.hasOwnProperty("name")) {
        payload.name = cmap.name;
      } else {
        payload.name = "Untitled";
      }
      if (cmap.hasOwnProperty("zoom")) {
        payload.zoom = cmap.zoom;
      }
      len = data.data.length;
      // check for common_map metadata

      for (i = 0; i < len; i++) {
        $.getJSON(data.data[i], getJsonSuccess).fail(getJsonFailure);
      }
    }
  }


  // Handle the intent request for map bounds and send a map.status.view event with current map bounds
  function populateBounds(sender, intent, data) { // eslint-disable-line no-unused-vars

    var payload = new emp.typeLibrary.View({
      sender: sender.id
    });

    var transaction = new emp.typeLibrary.Transaction({
      intent: emp.intents.control.VIEW_GET,
      sendTransactionComplete: false,
      sender: sender.id,
      messageOriginator: sender.id,
      originalMessageType: cmapi.channel.names.MAP_STATUS_REQUEST,
      items: [payload]
    });

    transaction.queue();
  }


  /*
   function loadIntentJson(sender, intent, data) {
   var payload = {},
   item,
   cmap,
   transaction,
   i,
   len,
   payloadItem,
   items = [];
   // check for common_map metadata
   len = data.data.length;
   // check for common_map metadata
   for (i = 0; i < len; i++) {
   payload.url = data.data[i];
   payload.format = "geojson";
   payload.visible = true;
   if (data.hasOwnProperty("common_map")) {
   cmap = data.common_map;
   } else {
   cmap = {};
   }
   if (cmap.hasOwnProperty("overlayId")) {
   payload.overlayId = cmap.overlayId;
   }
   if (cmap.hasOwnProperty("featureId")) {
   payload.featureId = cmap.featureId;
   } else {
   payload.featureId = emp.helpers.id.newGUID();
   }
   if (cmap.hasOwnProperty("name")) {
   payload.name = cmap.name;
   } else {
   payload.name = "Untitled";
   }
   if (cmap.hasOwnProperty("zoom")) {
   payload.zoom = cmap.zoom;
   }

   item = new emp.typeLibrary.Feature(payload);
   items.push(item);
   }
   );
   */

  function registerWidgetIntents() {
    if (OWF.Intents) {
      // This is a custom intent to support the RedDisk / DCGS-A custom dashboards
      OWF.Intents.receive({
          action: 'SwitchWorkspaceView',
          dataType: 'GEOINT'
        },
        function () {
          widgetState = new Ozone.state.WidgetState();
          widgetState.activateWidget();
        }
      );
      // CMAPI 1.2 Widget Intents Extension
      OWF.Intents.receive({
          action: 'pick',
          dataType: 'application/vnd.owf.common-map-1.0'
        },
        function () {
          //Do nothing as per CMAPI spec
          return;
        }
      );

      OWF.Intents.receive({
          action: 'pick',
          dataType: 'application/vnd.owf.common-map-1.1'
        },
        function () {
          //Do nothing as per CMAPI spec
          return;
        }
      );

      OWF.Intents.receive({
          action: 'pick',
          dataType: 'application/vnd.owf.common-map-1.2'
        },
        function () {
          //Do nothing as per CMAPI spec
          return;
        }
      );

      // Custom Intent from JC2-CUI / GCCS-J
      OWF.Intents.receive({
          action: 'pick',
          dataType: 'application/json+common-map-bounds'
        },
        function (sender, intent, data) {
          populateBounds(sender, intent, data);
        }
      );

      OWF.Intents.receive({
          action: 'plot',
          dataType: 'application/vnd.google-earth.kml+xml'
        },
        function (sender, intent, data) {
          plotIntentKml(sender, intent, data);
        });

      OWF.Intents.receive({
          action: 'plot',
          dataType: 'application/geo+json'
        },
        function (sender, intent, data) {
          plotIntentJson(sender, intent, data);
        });
      OWF.Intents.receive({
          action: 'plot',
          dataType: 'uri-list/geo+json'
        },
        function (sender, intent, data) {
          loadIntentJson(sender, intent, data);
        });

      OWF.Intents.receive({
          action: 'view',
          dataType: 'application/vnd.google-earth.kml+xml'
        },
        function (sender, intent, data) {
          plotIntentKml(sender, intent, data);
        });

      OWF.Intents.receive({
          action: 'view',
          dataType: 'uri-list/vnd.google-earth.kml+xml'
        },
        function (sender, intent, data) {
          loadIntentKml(sender, intent, data);
        });

      OWF.Intents.receive({
          action: 'view',
          dataType: 'application/geo+json'
        },
        function (sender, intent, data) {
          plotIntentJson(sender, intent, data);
        });
      OWF.Intents.receive({
          action: 'view',
          dataType: 'uri-list/geo+json'
        },
        function (sender, intent, data) {
          loadIntentJson(sender, intent, data);
        });
    }
  }

  var hViewChgTimer;

  function viewChangeHdlr() {
    if (hViewChgTimer) {
      clearTimeout(hViewChgTimer);
    }
    /*
     TODO - We need to rethink this given that there can be more than one map.
     hViewChgTimer = setTimeout(function() {
     hViewChgTimer = undefined;

     // Store the view center and range.
     emp.environment.get().prefs.put({
     key: "currentView",
     value: JSON.stringify({
     center: emp.map.status.getViewCenter(),
     range: emp.map.status.getViewRange()
     })
     });
     }, 10000);
     */
  }

  /**
   * Changes state event handling
   * @method
   * @memberOf emp.environment.owf
   * @param  {String} sender
   * @param  {String} msg
   */
  function handleStateEvent(sender, msg) {
    // Overrides the map close, first sends out event, then closes the
    // map.
    if (msg.eventName === "beforeclose") {
      if (shutdownCallback) {
        shutdownCallback();
      }

      widgetState.removeStateEventOverrides({
        events: ['beforeclose'],
        callback: function () {
          widgetState.closeWidget();
        }
      });
    }
  }

  function owf35Unload() {
    if (shutdownCallback) {
      shutdownCallback();
    }
  }

  /**
   * Initalized Widget to OWF
   * @method
   * @memberOf emp.environment.owf
   * @return {void}
   */
  function mapInit() {
    var event,
      bInstallViewChangeListener = false,
      widgetGuid,
      launchData,
      launchDataStr,
      transactionMessage;

    // Check to see what version of Ozone we are running.  If
    // we are running an older version of Ozone, we need to map the
    // old calls to the new function calls.
    switch (template.version) {
      case "3.5.0-GA":
      case "3.6.0-GA":
      case "3.7.0-GA":
      case "3.8.0-GA":
      case "3.8.1-GA":
        widgetEventingController = new Ozone.eventing.Widget(template.properties.rpcRelayPath);

        // These version do not have OWF defined.
        OWF = Ozone;
        OWF.Eventing = widgetEventingController;
        OWF.getInstanceId = function () {
          return JSON.parse(widgetEventingController.getWidgetId()).id;
        };

        if (OWF.BrowserDetect.browser === "Firefox") {
          // The onload works but FF does not support it.
          // So we need to install a view change listener
          // to store the view data.
          bInstallViewChangeListener = true;
        } else {
          window.addEventListener("unload", owf35Unload);
        }

        widgetGuid = OWF.getInstanceId();
        OWF.pref.PrefServer.getWidget({
          widgetId: widgetGuid,
          onSuccess: function (results) {
            template.properties.widgetName = results.value.originalName;
            template.properties.universalName = results.value.universalName;
            template.name = results.value.namespace;
          },
          onFailure: function () {
            template.properties.widgetName = "";
            template.properties.universalName = "";
          }
        });

        break;
      case "4.0.0-GA":
        widgetEventingController = new Ozone.eventing.Widget(template.properties.rpcRelayPath);

        // These version do not have OWF defined.
        OWF = Ozone;
        OWF.Eventing = widgetEventingController;
        OWF.getInstanceId = function () {
          return OWF.Widget.getInstanceId();
        };

        widgetState = Ozone.state.WidgetState.getInstance({
          widgetEventingController: widgetEventingController,
          autoInit: true,
          onStateEventReceived: handleStateEvent
        });
        // Override the widget state event handler beforeclose event.  This
        // will prevent the map from closing when a user clicks to close the map.
        // We want to intercept the event and send out a proper close instead.
        widgetState.addStateEventOverrides({
          events: ["beforeclose"]
        });

        widgetGuid = OWF.Widget.getWidgetGuid();
        OWF.pref.PrefServer.getWidget({
          widgetId: widgetGuid,
          onSuccess: function (results) {
            template.properties.widgetName = results.value.originalName;
            template.properties.universalName = results.value.universalName;
            template.name = results.value.namespace;
          },
          onFailure: function () {
            template.properties.widgetName = "";
            template.properties.universalName = "";
          }
        });

        break;

      default:


        OWF.relayFile = this.rpcRelayPath;
        widgetEventingController = new Ozone.eventing.Widget(this.rpcRelayPath);

        widgetState = Ozone.state.WidgetState.getInstance({
          widgetEventingController: widgetEventingController,
          autoInit: true,
          onStateEventReceived: handleStateEvent
        });
        // Override the widget state event handler beforeclose event.  This
        // will prevent the map from closing when a user clicks to close the map.
        // We want to intercept the event and send out a proper close instead.
        widgetState.addStateEventOverrides({
          events: ["beforeclose"]
        });
        // This is the unique widget instanceId
        widgetGuid = OWF.getWidgetGuid();
        // Check if this instance of the widget was launched as a private map
        launchDataStr = OWF.Launcher.getLaunchData();
        if (launchDataStr != null) {
          launchData = Ozone.util.parseJson(launchDataStr);
          if (launchData != null) {
            if (launchData.hasOwnProperty('senderId') && launchData.hasOwnProperty('messageId')) {
              ownerId = {
                senderId: launchData.senderId
              };
              isPrivateInstance = true;
              transactionMessage = {
                messageId: launchData.messageId,
                originatingChannel: "",
                status: "success",
                details: {},
                failures: []
              };
              template.pubSub.publish("map.transaction.complete", transactionMessage, ownerId);
            }
          }
        }
        // Retrieve the name and universal name of this widget.
        OWF.Preferences.getWidget({
          widgetId: widgetGuid,
          onSuccess: function (results) {
            template.properties.widgetName = results.value.originalName;
            template.properties.universalName = results.value.universalName;
            template.name = results.value.namespace;
          },
          onFailure: function () {
            template.properties.widgetName = "";
            template.properties.universalName = "";
          }
        });

        break;
    }
    // Register handlers the supported widget intents
    registerWidgetIntents();

    event = {};
    event.type = "mapLoading";
    event.eventData = {};
    //emp.api.cmapi._init();
    //emp.api.core._init();
    //var payload = {};
    //payload.status = "ready";
    //OWF.Eventing.publish("map.status.initialization", JSON.stringify(payload));

    initCallback({
      success: true
    });

    if (bInstallViewChangeListener) {
      emp.transactionQueue.listener.add({
        type: emp.intents.control.VIEW_CHANGE,
        mapInstanceId: "0", //TODO get a value from somewhere.
        callback: viewChangeHdlr
      });
    }
  }


  function initialize() {

    if (window.OWF !== undefined) {
      template.version = OWF.getContainerVersion();
      OWF.ready(mapInit);
    } else if (window.Ozone !== undefined) {
      Ozone.pref.PrefServer.getServerVersion({
        onSuccess: function (version) {
          template.version = version.serverVersion;
          mapInit();
        }
      });
    /*} else if (owfLoadAttempted === false &&
      emp.configManager.config.owfJsLocation !== undefined &&
      emp.configManager.config.owfJsLocation !== null &&
      emp.configManager.config.owfJsLocation !== "" &&
      // Should this be in V3 core?
      emp.appSetup.environment === "owf") {
      owfLoadAttempted = true;
      loadScript({
        objectToLoad: "Ozone",
        url: emp.configManager.config.owfJsLocation,
        callback: initialize,
        failedcallback: function () {
          emp.typeLibrary.Error({
            message: "The OWF javascript Library failed to load from: " + emp.configManager.config.owfJsLocation,
            level: emp.typeLibrary.Error.level.CATASTROPHIC
          });
        }
      });*/
    } else {
      emp.typeLibrary.Error({
        message: "The OWF javascript Library does not appear to be included on the page and the application cannot initialize",
        level: emp.typeLibrary.Error.level.CATASTROPHIC
      });
      initCallback({
        success: false
      });
    }
  }


  template.name = "Ozone Widget Framework";

  template.init = function (args) {
    initCallback = args.initcallback;
    shutdownCallback = args.shutdowncallback;
    initialize();
  };


  template.pubSub.publish = function (args) {
    var success = false;

    /*
     * In the emp’s browser environment the object args.sender will have a forwardMsg property set to allow communication between two browser environments.
     * As a result if a message is sent from the browser environment to the OWF environment the args.sender will have a defined value.
     * This will need to be reset back to a undefined value since no sender was defined with the original message.
     */
    if (args.sender && typeof args.sender.forwardMsg !== "undefined") {
      args.sender = undefined;
    }
    // if this is a private map instance make sure we route to owner
    if (isPrivateInstance === true) {
      args.sender = ownerId;
    }

    try {
      if (args.sender) {
        OWF.Eventing.publish(args.channel, JSON.stringify(args.message), args.sender);
        success = true;
      } else {
        OWF.Eventing.publish(args.channel, JSON.stringify(args.message));
        success = true;
      }
    } catch (e) {
      if (window.console) {
        if (window.console.hasOwnProperty("log")) {
          //cannot use typeLibrary.error because it will cause an infinite loop of errors
          console.error("An error occurred while attempting to publish a message on " + args.channel + " in the EMP OWF environment. " + e.toString());
        }
      }
      //cannot use typeLibrary.error because it will cause an infinite loop of errors
      /*
       emp.typeLibrary.Error({
       message: "An error occurred while attempting to publish a message on " + args.channel + " in the EMP OWF environment",
       jsError: e
       });
       */
    }
    return success;
  };

  // Default path for the OWF rpc relay file needed for corss domain data transfer between widgets
  template.properties.rpcRelayPath = 'rpc_relay.uncompressed.html';


  template.pubSub.subscribe = function (args) {
    var success = false;
    try {
      OWF.Eventing.subscribe(args.channel, args.callback);
      success = true;
      subscribedCallbacks[args.channel] = args.callback;
    } catch (e) {
      emp.typeLibrary.Error({
        message: "An error occurred while attempting to subscribe to the " + args.channel + " channel in the EMP OWF environment",
        jsError: e
      });
    }
    return success;
  };

  template.pubSub.unsubscribe = function (args) {
    var success = false;
    try {
      OWF.Eventing.unsubscribe(args.channel);
      success = true;
      delete subscribedCallbacks[args.channel];
    } catch (e) {
      emp.typeLibrary.Error({
        message: "An error occurred while attempting to unsubscribe to the " + args.channel + " channel in the EMP OWF environment",
        jsError: e
      });
    }
    return success;
  };

  /**
   * Forward all subscribed messages to EMP on a separate
   * window. Call stopForwarding() to revert this option.
   * @method
   * @memberOf emp.environment.owf
   * @protected
   * @param  {Window} win object for forwarding messages to. Assumed
   *   to have EMP available to call.
   * @return {boolean}
   */
  template.pubSub.forwardSubscribeMessages = function (win) {
    var success = false,
      channel;

    function channelCallback(sender, msg, channel) {
      if (win && !win.closed && win.emp) {
        win.emp.environment.get().pubSub.publish({
          channel: channel,
          message: msg,
          sender: sender
        });
      } else {
        console.error('Failed to forward message ' + channel);
      }
    }

    try {

      // Start off making sure that win just exists and we can
      // publish to it.
      if (win && !win.closed && win.emp && win.emp.environment.get().pubSub) {

        // Unsubscribe from all current messages.
        for (channel in subscribedCallbacks) {
          OWF.Eventing.unsubscribe(channel);
        }

        // Resubscribe with a forwarding callback.
        for (channel in subscribedCallbacks) {
          OWF.Eventing.subscribe(channel, channelCallback);
        }

        success = true;
      }
    } catch (e) {
      emp.typeLibrary.Error({
        message: "An error occurred while attempting to forward subscriptions in the EMP OWF environment",
        jsError: e
      });
    }

    return success;
  };

  /**
   * Stop forwarding messages to a seperate window.
   * @method
   * @memberOf emp.environment.owf
   * @public
   * @return {void}
   */
  template.pubSub.stopForwardingSubscribe = function () {
    var channel;
    try {

      // Unsubscribe from all current messages to stop
      // forwarding.
      for (channel in subscribedCallbacks) {
        OWF.Eventing.unsubscribe(channel);
      }

      // Restore original callbacks.
      for (channel in subscribedCallbacks) {
        OWF.Eventing.subscribe(channel, subscribedCallbacks[channel]);
      }
    } catch (e) {
      emp.typeLibrary.Error({
        message: "An error occurred while attempting to stop forwarding in the EMP OWF environment",
        jsError: e
      });
    }
  };


  // Default path for the OWF rpc relay file needed for corss domain data transfer between widgets
  template.properties.rpcRelayPath = 'rpc_relay.uncompressed.html';

  template.prefs.get = function (args) {
    var successCallback = args.onSuccess;
    var failureCallback = args.onError;
    var onSuccess = function (args) {
      if (successCallback) {
        successCallback({
          value: args.value
        });
      }
    };

    var onFailure = function (error) {
      if (failureCallback) {
        failureCallback({
          error: error
        });
      }
    };

    switch (template.version) {
      case "3.5.0-GA":
      case "3.6.0-GA":
      case "3.7.0-GA":
      case "3.8.0-GA":
      case "3.8.1-GA":
        OWF.pref.PrefServer.setUserPreference({
          namespace: 'mil.army.sec.emp',
          name: args.key,
          value: args.value,
          onSuccess: onSuccess,
          onFailure: onFailure
        });
        break;
      case "4.0.0-GA":
        OWF.pref.PrefServer.setUserPreference({
          namespace: 'mil.army.sec.emp',
          name: args.key,
          value: args.value,
          onSuccess: onSuccess,
          onFailure: onFailure
        });
        break;
      default:
        OWF.Preferences.setUserPreference({
          namespace: 'mil.army.sec.emp',
          name: args.key,
          value: args.value,
          onSuccess: onSuccess,
          onFailure: onFailure
        });
        break;
    }
  };

  template.prefs.put = function (args) {
    var successCallback = args.onSuccess;
    var failureCallback = args.onError;
    var onSuccess = function (args) {
      if (successCallback) {
        successCallback({
          value: args.value
        });
      }
    };

    var onFailure = function (error) {
      if (failureCallback) {
        failureCallback({
          error: error
        });
      }
    };

    switch (template.version) {
      case "3.5.0-GA":
      case "3.6.0-GA":
      case "3.7.0-GA":
      case "3.8.0-GA":
      case "3.8.1-GA":
        OWF.pref.PrefServer.setUserPreference({
          namespace: 'mil.army.sec.emp',
          name: args.key,
          value: args.value,
          onSuccess: onSuccess,
          onFailure: onFailure
        });
        break;
      case "4.0.0-GA":
        OWF.pref.PrefServer.setUserPreference({
          namespace: 'mil.army.sec.emp',
          name: args.key,
          value: args.value,
          onSuccess: onSuccess,
          onFailure: onFailure
        });
        break;
      default:
        OWF.Preferences.setUserPreference({
          namespace: 'mil.army.sec.emp',
          name: args.key,
          value: args.value,
          onSuccess: onSuccess,
          onFailure: onFailure
        });
        break;
    }
  };

  template.getInstanceId = function () {
    return OWF.getInstanceId();
  };

  template.launchTool = function (args) {
    var launchCallback = function (callbackArgs) {
      var onSuccess = args.onSuccess;
      var onError = args.onError;

      if (callbackArgs.error) {
        if (typeof onError === 'function') {
          onError({
            message: "The current user does not have permissions to run this tool.",
            statusCode: "Failed"
          });
        }
      } else {
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      }
    };

    switch (template.version) {
      case "3.5.0-GA":
      case "3.6.0-GA":
      case "3.7.0-GA":
      case "3.8.0-GA":
      case "3.8.1-GA":
      case "4.0.0-GA":
        var widgetLauncher = new OWF.launcher.WidgetLauncher(widgetEventingController);

        widgetLauncher.launchWidget({
          guid: args.toolHandle.path,
          launchOnlyIfClosed: true
        });
        break;
      default:
        OWF.Launcher.launch({
          guid: args.toolHandle.path,
          launchOnlyIfClosed: true
        }, launchCallback);
        break;
    }
  };

  template.getToolInfo = function (args) {
    var getToolInfoSuccess = function (widgets) {
      var onSuccess = args.onSuccess,
        onError = args.onError,
        toolName = args.toolInfo.toolName,
        iIndex,
        toolInfo,
        oErrorInfo;

      switch (template.version) {
        case "3.5.0-GA":
        case "3.6.0-GA":
        case "3.7.0-GA":
        case "3.8.0-GA":
        case "3.8.1-GA":
          if (widgets.success && (widgets.rows.length > 0)) {
            // We need to scan what we get back because 3.5 returns
            // A list of eveything even if it did not match the search.

            for (iIndex = 0; iIndex < widgets.rows.length; iIndex++) {
              if (widgets.rows[iIndex].value.namespace === toolName) {
                break;
              }
            }

            if (iIndex < widgets.rows.length) {
              // We can't do a get because in 3.5 it doesn't work.
              toolInfo = {
                toolName: widgets.rows[iIndex].value.namespace,
                toolhandle: widgets.rows[iIndex]
              };

              onSuccess(toolInfo);
            } else if (typeof onError === 'function') {
              oErrorInfo = {
                message: "Widget (" + toolName + ") not found.",
                statusCode: "404"
              };
              onError(oErrorInfo);
            }
          } else if (typeof onError === 'function') {
            oErrorInfo = {
              message: "Widget (" + toolName + ") not found.",
              statusCode: "404"
            };
            onError(oErrorInfo);
          }
          break;
        case "4.0.0-GA":
          if (widgets.length > 0) {
            // We can't do a get because in 4.0 it doesn't work.
            toolInfo = {
              toolName: widgets[0].value.namespace,
              toolhandle: widgets[0]
            };

            onSuccess(toolInfo);
          } else if (typeof onError === 'function') {
            oErrorInfo = {
              message: "Widget (" + toolName + ") not found.",
              statusCode: "404"
            };
            onError(oErrorInfo);
          }
          break;
        default:
          if (widgets.length > 0) {
            setTimeout(function () {
              var widgetID = widgets[0].path;
              var getToolName = toolName;

              OWF.Preferences.getWidget({
                widgetId: widgetID,
                onSuccess: function (getWidgetArgs) {
                  var toolInf = {
                    toolName: getToolName,
                    toolhandle: getWidgetArgs
                  };

                  onSuccess(toolInf);
                },
                onFailure: function () {
                  if (typeof onError === 'function') {
                    var errInfo = {
                      message: "The current user does not have permissions to run this tool (" + getToolName + ").",
                      statusCode: "Failed"
                    };
                    onError(errInfo);
                  }
                }
              });
            }, 50);
          } else if (typeof onError === 'function') {
            oErrorInfo = {
              message: "Widget (" + toolName + ") not found.",
              statusCode: "404"
            };
            onError(oErrorInfo);
          }
          break;
      }
    };

    var getToolInfoError = function (errorArgs) {
      var onError = args.onError;

      if (onError) {
        var oErrorInfo = {
          message: errorArgs.message,
          statusCode: errorArgs.statusCode
        };
        onError(oErrorInfo);
      }
    };

    var searchConfig = {
      searchParams: {
        widgetName: args.toolInfo.toolName,
        widgetNameExactMatch: true
      },
      onSuccess: getToolInfoSuccess,
      onFailure: getToolInfoError
    };

    if (typeof args.onSuccess !== 'function') {
      throw emp.typeLibrary.Error({
        message: "The onSuccess callback parameter is required.",
        level: emp.typeLibrary.Error.level.MAJOR
      });
    }
    switch (template.version) {
      case "3.5.0-GA":
      case "3.6.0-GA":
      case "3.7.0-GA":
      case "3.8.0-GA":
      case "3.8.1-GA":
      case "4.0.0-GA":
        OWF.pref.PrefServer.findWidgets(searchConfig);
        break;
      default:
        OWF.Preferences.findWidgets(searchConfig);
        break;
    }
  };

  return template;
}());
