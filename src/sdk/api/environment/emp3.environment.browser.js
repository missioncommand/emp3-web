/*global mil, emp, emp3 */
emp3.api.environment = emp3.api.environment || {};
emp3.api.environment.browser = (function() {
  var template = emp3.api.createEnvironmentTemplate(),
    senderId = emp3.api.createGUID();
  template.sender = {
    id: senderId
  };

  template.name = "Browser";

  template.init = function(args) {
    if (args) {
      if (args.hasOwnProperty("initcallback")) {
        args.success = true;
        args.initcallback(args);
      }
    }

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
          extent: args.extent,
          engine: args.engine,
          recorder: args.recorder,
          environment: args.environment
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

  template.pubSub.publish = function(args) {
    var message = {
      channel: args.channel,
      message: args.message,
      sender: template.sender
    };

    emp.recorder.log({
      timestamp: Date.now(),
      logEntry: args      
    });

    if(args.hasOwnProperty("dest")){
      message.dest = args.dest;
    }
    var rc = emp.environment.browser.mediator.publish(message);
    if (rc.success) {
      return true;
    } else {
      throw new Error(rc.message);
    }
  };

  /**
   * Synchronous calls publishing
   * @param {object} args
   */
  template.pubSub.publishSync = function (args) {
    var message = {
      channel: args.channel,
      message: args.message,
      sender: template.sender
    };

    emp.recorder.log({
      timestamp: Date.now(),
      logEntry: args
    });

    if(args.hasOwnProperty("dest")){
      message.dest = args.dest;
    }

    return emp.environment.browser.mediator.publishSynch(message);
  };

  template.pubSub.subscribe = function(args) {
    var success = false;

    emp.environment.browser.mediator.subscribe({
      channel: args.channel,
      callback: args.callback
    });
    success = true;

    return success;
  };

  return template;
}());
