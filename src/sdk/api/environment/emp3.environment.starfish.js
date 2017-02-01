/*global mil, com */
/* eslint-disable */
emp3.api.environment = emp3.api.environment || {};
emp3.api.environment.starfish = (function () {
  var template = emp3.api.createEnvironmentTemplate(),
    nerve,
    scriptLoadAttempt = false,
    starfishjslocation = "js/environment/starfish/com.octabits.starfish.js";

  template.name = "Starfish";


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
        console.log("An error was found loading the script");
        args.failedcallback();
      };
      script.onload = function () {
        // We need to make sure the object is there.
        // The server may have sent an html page with
        // error text on it.
        console.log("Script loaded successfully.");
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

  function initialize() {
    if (window.com !== undefined &&
      window.com.octabits !== undefined &&
      window.com.octabits.starfish !== undefined) {
      nerve = new com.octabits.starfish.Nerve();
      template.sender.id = nerve.id;
      initCallback({
            success: true
          });
    } else if (!scriptLoadAttempt) {
      scriptLoadAttempt = true;
      loadScript({
        objectToLoad: "com",
        url: starfishjslocation,
        failedcallback: function () {
          initCallback({
            success: false
          });
        },
        callback: function () {
          initialize();
        }
      });
    }
  }
  template.init = function (args) {


    if (args) {
      if (args.hasOwnProperty("initcallback")) {
        initCallback = args.initcallback;
      }
    }
    initialize();
  };

  template.pubSub.publish = function (args) {
    var success = false;
if(nerve !== undefined){
    nerve.publish({
      channel: args.channel,
      message: args.message
    });
}
    success = true;

    return success;
  };

  template.pubSub.subscribe = function (args) {
    var success = false;

    nerve.subscribe({
      channel: args.channel,
      callback: args.callback
    });
    success = true;

    return success;
  };

  return template;
}());
/* eslint-enable */
