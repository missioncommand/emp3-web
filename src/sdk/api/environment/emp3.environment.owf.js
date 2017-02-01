/*global mil, OWF, Ozone */
/* eslint-disable no-console */
emp3.api.environment = emp3.api.environment || {};
emp3.api.environment.owf = (function() {
  var template = emp3.api.createEnvironmentTemplate(),
    owfJsLocation = "/owf/js-min/owf-widget-min.js",

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
    // function that will be invoked once the OWF environment is done initializing following the .int() invocation
    initCallback,
    shutdownCallback,
    owfReadyCallbackQueue = [];

  function addToOWFQueue(callback) {
    if (console) {
      console.log("Callback added to OWF queue");
    }
    owfReadyCallbackQueue.push(callback);
  }
  // OWF does not exist on page and needs to be loaded
  // Create temporary namespace
  if (!window.hasOwnProperty("OWF")) {
    window.OWF = {};
  }
  // If OWF.ready is called between now and the time ozone loads,
  // it will be redirected to this function.  Once Ozone loads, Ozone will
  // take over.  In the meantime, we will store all the callbacks passed in
  // and pass them over to Ozone after it loads.
  if (!window.OWF.hasOwnProperty("ready")) {
    window.OWF.ready = addToOWFQueue;
  }

  function loadScript(args) {

    // The above code is simple but does not generate an error
    // if the request generates the "Blocked loading mixed active content " error.
    var script = document.createElement("script");
    script.type = "text/javascript";

    if (script.readyState) { //IE
      script.onreadystatechange = function() {
        script.intervalCount = 50;
        script.timer = setInterval(function() {
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
      script.onerror = function() {
        console.error("An error was found loading the script: " + args.url);
        args.failedcallback();
      };
      script.onload = function() {
        // We need to make sure the object is there.
        // The server may have sent an html page with
        // error text on it.
        if (window[args.objectToLoad] === undefined) {
          console.error("An error was found loading the script: " + args.url);
          args.failedcallback();
        } else {
          args.callback();
        }
      };
    }
    script.src = args.url;
    document.getElementsByTagName("head")[0].appendChild(script);

  }

  /**
   * Calls the map configuration service and determines how the map is set up.
   * The configuration is returned to the caller.
   */
  function getConfig(args) {
    var xhr, data;
    // If config data has already been set up, use that.  Otherwise
    // continue on and pull from the config service.  
    if (console && console.hasOwnProperty("log")) {
      console.log("Loading map config to get path for OWF from: " + args.path);
    }
    if (emp3.api.environment.appSetup.configData) {
      emp3.api.environment.appSetup.config = emp3.api.environment.appSetup.configData;
      args.callback();
    } else {

      xhr = new XMLHttpRequest();
      xhr.open('GET', encodeURI(args.path));
      xhr.onload = function() {
        try {
          if (xhr.status === 200) {
            data = JSON.parse(xhr.responseText);
            emp3.api.environment.appSetup.config = data;
            args.callback();
          } else {
            args.fail(args);
          }
        } catch (e) {
          if (console && console.hasOwnProperty("log")) {
            console.log("CP CE Map API: An error occurred while trying to load the OWF js file from: " + args.path + "  Error: " + e.message);
          }
          args.fail(args);
        }
      };
      xhr.send();

    }
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
        callback: function() {
          widgetState.closeWidget();
        }
      });
    }
  }

  /**
   * Initalized Widget to OWF
   * @method
   * @memberOf emp.environment.owf
   */
  function mapInit() {
    var i,
      widgetLauncher;

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
        window.OWF = Ozone;
        OWF.Eventing = widgetEventingController;
        OWF.getInstanceId = function() {
          return JSON.parse(widgetEventingController.getWidgetId()).id;
        };

        // We also need to get the instanceName, widgetName and universalName of the widget as shown below in 
        // the default case.  Did not put this in yet, waiting for 3.5 backwards compatibility.
        template.sender.id = JSON.parse(widgetEventingController.getWidgetId()).id;
        OWF.Preferences = Ozone.pref.PrefServer;
        widgetLauncher = new Ozone.launcher.WidgetLauncher(this.widgetEventingController);
        OWF.Launcher = {};
        OWF.Launcher.launch = widgetLauncher.launchWidget;

        break;
      case "4.0.0-GA":
        widgetEventingController = new Ozone.eventing.Widget(template.properties.rpcRelayPath);

        // These version do not have OWF defined.
        window.OWF = Ozone.Widget;
        OWF.Eventing = widgetEventingController;
        OWF.getInstanceId = function() {
          return JSON.parse(widgetEventingController.getWidgetId()).id;
        };

        template.sender.id = JSON.parse(widgetEventingController.getWidgetId()).id;
        OWF.Preferences = Ozone.pref.PrefServer;
        widgetLauncher = new Ozone.launcher.WidgetLauncher(this.widgetEventingController);
        OWF.Launcher = {};
        OWF.Launcher.launch = widgetLauncher.launchWidget;

        // We also need to get the instanceName, widgetName and universalName of the widget as shown below in 
        // the default case.  Did not put this in yet, waiting for 3.5 backwards compatibility.

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

        var widgetGuid = OWF.getWidgetGuid();
        // used for sender id comparisons to ignore messages we send
        template.sender.id = OWF.getInstanceId();

        // Retrieve the name and universal name of this widget.
        OWF.Preferences.getWidget({
          widgetId: widgetGuid,
          onSuccess: function(results) {
            template.properties.widgetName = results.value.originalName;
            template.properties.universalName = results.value.universalName;
          },
          onFailure: function() {
            template.properties.widgetName = "";
            template.properties.universalName = "";
          }
        });

        break;
    }

    if (initCallback !== undefined && initCallback !== null) {
      initCallback({
        success: true
      });
    }
    // Ozone loaded, but if users tried to access the OWF.ready
    // event, we need to pass our queue of callbacks to Ozone.

    for (i = 0; i < owfReadyCallbackQueue.length; i += 1) {
      OWF.ready(owfReadyCallbackQueue[i]);
    }
  }

  function initialize() {

    var scriptLoadAttempt = false;

    if (window.OWF !== undefined &&
      OWF.ready &&
      OWF.getContainerVersion) {
      if (console) {
        console.log("CP CE Map API: OWF already exits no need to load OWf JS file");
      }
      template.version = OWF.getContainerVersion();

      OWF.ready(mapInit);
    } else if (window.Ozone !== undefined) {
      if (console) {
        console.log("CP CE Map API: Running under Ozone namespace no need to load OWF JS file");
      }
      Ozone.pref.PrefServer.getServerVersion({
        onSuccess: function(version) {
          template.version = version.serverVersion;

          mapInit();
        }
      });
    } else if (!scriptLoadAttempt) {
      if (console) {
        console.log("CP CE Map API: OWF does not already exist attempting to load OWF JS file");
      }
      scriptLoadAttempt = true;
      if (emp3.api.environment.hasOwnProperty("appSetup") &&
        emp3.api.environment.appSetup.hasOwnProperty("config") &&
        emp3.api.environment.appSetup.config.hasOwnProperty("owfJsLocation")) {
        owfJsLocation = emp3.api.environment.appSetup.config.owfJsLocation;
      }

      loadScript({
        objectToLoad: "Ozone",
        url: owfJsLocation,
        failedcallback: function() {
          if (console) {
            console.log("The OWF javaScript file was not included on the page and was not able to load from the URL: " + owfJsLocation + ". Please correct the URL to point to a valid location for this file in the CPCE Map Configuration Page.");
          }
          initCallback({
            success: false
          });
        },
        callback: function() {
          if (console) {
            console.log("The OWF javaScript file successfully loaded from the URL: " + owfJsLocation);
          }
          initialize();
        }
      });
    }
  }



  template.name = "Ozone Widget Framework";

  template.init = function(args) {

    if (args !== undefined && args !== null) {
      initCallback = args.initcallback;
      shutdownCallback = args.shutdowncallback;
    }

    // Ensure the emp3.api.envrionemnt.appSetup namespace exists
    if (!emp3.api.environment.hasOwnProperty("appSetup")) {
      emp3.api.environment.appSetup = {};
    }
    // Ensure a value for emp3.api.environment.appSetup.configLocation exists
    if (!emp3.api.environment.appSetup.hasOwnProperty("configLocation")) {
      emp3.api.environment.appSetup.configLocation = "/cpce-map/config/getMapConfiguration";
    }
    // OWF exists on page so dont try to load the OWF JavaScript file
    if ((window.OWF !== undefined &&
        OWF.ready &&
        OWF.getContainerVersion) || window.Ozone !== undefined) {
      initialize();
    } else {

      getConfig({
        path: emp3.api.environment.appSetup.configLocation,
        callback: initialize,
        fail: function() {
          if (window.console && window.console.hasOwnProperty("error")) {
            console.error("Could not find map configuration service at : " + emp3.api.environment.appSetup.configLocation + ".  Loading OWF js file from default location.");
          }
          // Still attempt to load from default location, but report an error.
          initialize();
        }
      });
    }
  };

  /**
   * Spawns EMP as a map widget in the Ozone environment.
   * @param  {Object} args Parameters are passed in as part of the args object
   * @param  {String} args.id The id of the widget being launched
   */
  template.createInstance = function(args) {

    var transactionId = emp3.api.createGUID(),
      senderId;

    if (args) {

      if (args.hasOwnProperty("containerId")) {

        // This only applies to Ozone.  If Ozone is not defined
        // than we cannot do anything.
        if (window.OWF) {

          // handle a case where user doesn't pass in anything
          // for arguments
          args = args || {};

          senderId = OWF.getInstanceId();

          if (senderId) {

            if (OWF.hasOwnProperty("Preferences")) {
              OWF.Preferences.findWidgets({
                searchParams: {
                  widgetName: args.containerId,
                  widgetNameExactMatch: true
                },
                onSuccess: function(result) {
                  // extra code to handle Ozone 3.5-4.0
                  if (result.rows !== undefined) {
                    OWF.Launcher.launch({
                        data: JSON.stringify({
                          senderId: transactionId
                        }),
                        guid: result.rows[0].path,
                        launchOnlyIfClosed: true
                      },
                      function() {
                        if (window.hasOwnProperty("console")) {
                          console.log("OWF.Launcher.launch succeeded");
                        }
                      },
                      function() {
                        if (window.hasOwnProperty("console")) {
                          console.log("OWF.Launcher.launch failed");
                        }
                      });
                  } else {
                    OWF.Launcher.launch({
                        data: JSON.stringify({
                          senderId: transactionId
                        }),
                        guid: result[0].id,
                        launchOnlyIfClosed: true
                      },
                      function() {});
                  }
                },
                onFailure: function() {}
              });
            }
          }
        }
      }
    }

    return true;
  };

  template.pubSub.publish = function(args) {
    var success = false;
    try {
      if (args.sender) {
        OWF.Eventing.publish(args.channel, args.message, args.sender);
        success = true;
      } else {
        OWF.Eventing.publish(args.channel, args.message);
        success = true;
      }
    } catch (ignore) {
      // do nothing
    }
    return success;
  };

  template.pubSub.subscribe = function(args) {
    var success = false;
    try {
      OWF.Eventing.subscribe(args.channel, args.callback);
      success = true;
    } catch (ignore) {
      // do nothing
    }
    return success;
  };
  // Default path for the OWF rpc relay file needed for corss domain data transfer between widgets
  template.properties.rpcRelayPath = 'rpc_relay.uncompressed.html';

  return template;


}());
/* eslint-enable no-console */
