/*global emp */

emp.environment.browser = (function() {

  var template = emp.createEnvironmentTemplate(),
    /**
     * forwardMsgWindow will be used to hold the value of a new window for messages to be forwarded too.
     * @memberOf emp.environment.browser
     * @type {object}
     * @private
     */
    forwardMsgWindow,
    senderId = emp.helpers.id.newGUID();

  template.name = "Browser";

  /**
   * Subscribed Callbacks
   * @memberOf emp.environment.browser
   * @type {object}
   * @private
   * @property {string} channel The channel for a subscribed callback.
   * @property {function} callback The callback function for a subscription.
   */
  var subscribedCallbacks = {};

  template.init = function(args) {
    var transactionMessage;
    if (args) {
      if (args.hasOwnProperty("initcallback")) {
        args.initcallback();
      }
      if (args.hasOwnProperty("mapInstanceId") &&
        args.mapInstanceId !== undefined &&
        args.mapInstanceId !== null &&
        args.hasOwnProperty("messageId") &&
        args.messageId !== undefined &&
        args.messageId !== null) {
        transactionMessage = {
          messageId: args.messageId,
          originatingChannel: "",
          status: "success",
          details: {},
          failures: []
        };
        template.pubSub.publish({
          channel: "map.message.complete",
          message: transactionMessage,
          sender: {
            id: args.mapInstanceId
          }
        });
      }
    }
  };

  /**
   *
   * @param {object} args
   * @param {string} args.channel
   * @param {object} args.message
   * @param {*} [args.sender]
   * @returns {boolean}
   */
  template.pubSub.publish = function(args) {
    var success = false,
      fwdMsg = true;
    if (args.sender) {
      if (args.sender.hasOwnProperty("id")) {
        senderId = args.sender.id;
      }
      if (args.sender.hasOwnProperty("forwardMsg") && args.sender.forwardMsg !== null) {
        fwdMsg = args.sender.forwardMsg;
      }
    }

    // If we are forwarding send it on to the new window. Only do this for messages originating from this application (sender not specified).
    if (forwardMsgWindow && !args.sender) {
      args.sender = {
        forwardMsg: false
      };
      forwardMsgWindow.emp.environment.get().pubSub.publish(args);
      success = true;
    }
    else {      
      emp.environment.browser.mediator.publish({
        channel: args.channel,
        message: args.message,
        sender: {
          id: senderId,
          forwardMsg: fwdMsg // Boolean to determine whether to use standard callback or forward callback.
        }
      });
      success = true;
    }
    return success;
  };

  /**
   *
   * @param args
   * @returns {boolean}
   */
  template.pubSub.subscribe = function(args) {
    var success = false;

    emp.environment.browser.mediator.subscribe({
      channel: args.channel,
      callback: args.callback,
      senderId: args.mapInstanceId
    });
    subscribedCallbacks[args.channel] = args.callback;
    success = true;

    return success;
  };

  template.pubSub.unsubscribe = function(args) {
    var success = false;

    emp.environment.browser.mediator.unsubscribe({
      channel: args.channel,
      callback: args.callback
    });
    delete subscribedCallbacks[args.channel];
    success = true;

    return success;
  };

  /**
   * Forward all subscribed messages to EMP on a separate
   * window. Call stopForwarding() to revert this option.
   * @method
   * @memberOf emp.environment.browser
   * @protected
   * @param  {Window} Window object for forwarding messages to. Assumed
   *   to have EMP available to call.
   * @return {boolean}
   */
  template.pubSub.forwardSubscribeMessages = function(win) {
    var success = false,
      channel;

    try {

      // Start off making sure that win just exists and we can
      // publish to it.
      if (win && !win.closed && win.emp && win.emp.environment.get().pubSub) {

        // Unsubscribe from all current messages.
        for (channel in subscribedCallbacks) {
          emp.environment.browser.mediator.unsubscribe({
            channel: channel,
            callback: subscribedCallbacks[channel]
          });
        }

        // If sender.forwardMsg was set to true then resubscribe with a forwarding callback. If it was not set or it was false, call original callback.
        for (channel in subscribedCallbacks) {
          emp.environment.browser.mediator.subscribe({
            channel: channel,
            callback: function(sender, msg, channel) {
              if (sender.forwardMsg) {
                if (win && !win.closed && win.emp) {
                  win.emp.environment.get().pubSub.publish({
                    channel: channel,
                    message: msg,
                    sender: senderId
                  });
                }
                else {
                  console.error('Failed to forward message ' + channel);
                }
              }
              else {
                subscribedCallbacks[channel](sender, msg, channel);
              }
            }
          });
        }
        success = true;
      }
    }
    catch (e) {
      emp.typeLibrary.Error({
        message: "An error occurred while attempting to forward subscriptions in the EMP Browser environment",
        jsError: e
      });
    }

    return success;
  };

  /**
   * Stop forwarding subscribed messages to a separate window.
   * @method
   * @memberOf emp.environment.browser
   * @public
   * @return {void}
   */
  template.pubSub.stopForwardingSubscribe = function() {
    var channel,
      args;
    try {
      // Unsubscribe from all current messages to stop forwarding.
      for (channel in subscribedCallbacks) {
        args = {
          channel: channel,
          callback: subscribedCallbacks[channel]
        };
        emp.environment.browser.mediator.unsubscribe(args);
      }

      // Restore original callbacks.
      for (channel in subscribedCallbacks) {
        args = {
          channel: channel,
          callback: subscribedCallbacks[channel]
        };
        emp.environment.browser.mediator.subscribe(args);
      }
    }
    catch (e) {
      emp.typeLibrary.Error({
        message: "An error occurred while attempting to stop forwarding in the EMP Browser environment",
        jsError: e
      });
    }

  };

  /**
   * Removes value from variable forwardMsgWindow. This will result in stopping the forwarding of published messages to a separate window.
   * @method
   * @memberOf emp.environment.browser
   * @public
   * @return {void}
   */
  template.pubSub.stopForwardingPublish = function() {
    forwardMsgWindow = undefined;
  };

  /**
   * Sets a new window object as a value for forwardMsgWindow variable. This will start forwarding published messages to a separate window.
   * @method
   * @memberOf emp.environment.browser
   * @public
   * @param  {Window} Window object for forwarding messages to. Assumed
   *   to have EMP available to call.
   * @return {void}
   */
  template.pubSub.forwardPublishedMessages = function(win) {
    // Make sure that win exists and we can publish to it.
    if (win && win.emp && win.emp.environment.get().pubSub) {
      forwardMsgWindow = win;
    }
  };

  return template;
}());
