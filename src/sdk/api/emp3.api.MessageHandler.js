if (!window.emp3) {
  emp3 = {};
}
if (!window.emp3.api) {
  emp3.api = {};
}

/**
 * @ignore
 * @typedef {object} CallInfo
 * @property {string} method
 * @property {emp3.api.Map} map
 * @property {string} mapId
 * @property {object} source
 * @property {object} args
 * @property {Array} remainingPayload
 * @property {Array} successes
 * @property {Array} failures
 */

/**
 * A dispatcher class that manages pub/sub communications using the CMAPI interface using an underlying framework. The
 * framework used is called the "environment."  In order to use, the environment needs to first instantiate the
 * environment and subscribe to channels specified by the CMAPI specification.  This class is used internally by the
 * map API and should not be used directly by an API developer.
 *
 * This class implements a singleton pattern.  It is generally accessed as
 * follows:
 *
 *      emp3.api.MessageHandler.getInstance()
 *
 * Messages sent to the message handler prior to the map environment being ready will be queued until the environment
 * finishes the initialization process.
 *
 * The environment being ready does not mean the EMP map is ready.
 *
 * @ignore
 */
emp3.api.MessageHandler = (function() {

  // Singleton instance of this class.
  var instance = null,
    missingMessageError = "Message received from map is missing its payload.",
    missingParameterError = "Message received from map is missing a required parameter.",
    drawListenerCallbackHash = new emp3.api.Hash(),
    mapHash = new emp.utilities.Hash(),
    selectionHash = [],
    queue = [], // holds any messages sent to the messageHandler before the environment is ready.
    updates = [],
    updateTimer,
    updateTime = 0;


  /**
   * Given transaction complete messages from multiple requests on the same channel,
   * combine the transaction complete details together to make it seem as though
   * it was a single message.
   *
   * @return An array of the new details containing the joined messages.
   *
   */
  function joinDetails(details, originChannel) {

    var i,
      len,
      features = [];

    len = details.length;

    // Made this a switch statement in case we started adding more
    // channels.  All the current batch channel transaction details
    // contain a single property called 'features'.

    switch (originChannel) {

      case emp3.api.enums.channel.plotFeatureBatch:
      case emp3.api.enums.channel.unplotFeatureBatch:
      case emp3.api.enums.channel.featureSelectedBatch:
      case emp3.api.enums.channel.featureDeselectedBatch:

        for (i = 0; i < len; i += 1) {
          features = features.concat(details[i].features);
        }

        details.features = features;

        break;
    }

    return details;

  }

  // Constructs the MessageHandler
  /**
   * Instantiates the MessageHandler. Only one message handler is created
   * for the map api.
   * @ignore
   * @constructor
   * @name emp3.api.MessageHandler
   */
  function PrivateConstructor(args) {
    var environment,
      that = this;

    this.isEnvironmentReady = false; // tracks when message can be sent out.  This will be set to true after environment is ready.
    this.messageCallbackHash = new emp3.api.Hash();
    this.statusRequestPendingList = {
      about: [],
      format: [],
      view: [],
      selected: [],
      screenshot: [],
      initialization: [],
      coordinatesystem: []
    };
    this.mapReadyCallback = [];

    // The event listener functions
    this.eventListeners = [];
    this.mapWidgetName = "CPCE Map";
    // If we have an args.containerId parameter populated then we MUST use the browser environment for messageHandler as we are dealing with a local map instance
    // We must still pass the environment value into the spawnMap function so that the local map instance can listen to remote IWC, OWF, etc API instance,
    // but this instance of messageHandler is on the same page as the map instance so it must use browser environment
    if (args && args.environment && (!args.container || args.container === "")) {
      switch (args.environment) {
        case "starfish":
        case emp3.api.environment.starfish:
          environment = emp3.api.environment.starfish;
          break;
        case "owf":
        case emp3.api.environment.owf:
          environment = emp3.api.environment.owf;
          break;
        case "iwc":
        case emp3.api.environment.iwc:
          emp3.api.environment.iwc.iwcHost = args.iwcHost;

          environment = emp3.api.environment.iwc;
          break;
        default:
          environment = emp3.api.environment.browser;
          break;
      }
    }
    else {
      // We have a local map instance so we MUST use browser, see comments above switch statement for further explanation
      environment = emp3.api.environment.browser;
    }


    /**
     * Returns a JavaScript array of event listener functions mapped by event type
     */
    this.getEventListeners = function() {
      return this.eventListeners;
    };


    /**
     * Adds an event listener onto the event callback hash.  The event callback
     * hash will check if the event pertains to an object, then invoke the
     * correct callback associated with the event.
     * @param {Object} args Parameters are provided as members of the args object.
     * @param {String} args.id The geoId of a emp3.api.Map
     * @param {emp3.api.enums.EventType} args.event the type of event being added.
     * @param {Function} args.callback The method to call after the event occurs.
     */
    this.addEventListener = function(args) {
      var eventListeners,
        that = this;

      // First check to see if we know what object we are adding the
      // event to.
      if (args.id) {

        // Now check to see if there were any events associated with
        // this id before.  If not, create an array for it.
        if (!this.eventListeners[args.id]) {
          this.eventListeners[args.id] = [];
        }

        // Retrieve the list of event listeners assigned to this object.
        eventListeners = this.eventListeners[args.id];

        // If we know what event we are subscribing to continue on.
        if (args.event) {

          // If there are not callbacks hooked up to this object event
          // add an array to hold them.
          if (!eventListeners[args.event]) {
            eventListeners[args.event] = [];
            // Because so many of these events are dispatched, we only subscribe to
            // events if a client component needs these events.
            // Otherwise it is too much traffic for an unused capability
            if (args.event === emp3.api.enums.EventType.MAP_CURSOR_MOVE) {
              environment.pubSub.subscribe({
                channel: emp3.api.enums.channel.mousemove,
                callback: that.handleMapCursorMove.bind(that)
              });
            }
            else if (args.event === emp3.api.enums.EventType.MAP_VIEW_CHANGE) {
              environment.pubSub.subscribe({
                channel: emp3.api.enums.channel.statusView,
                callback: function(sender, msg) {
                  that.handleStatusView(sender, msg);
                }
              });
            }
          }

          // Add the callback to the associated event.  Do not overwrite
          // it as we would like to be able to assign multiple callbacks to
          // an event.
          if (args.callback) {
            eventListeners[args.event].push(args.callback);
          }
        }
      }
    };

    /**
     * Removes an event handler for an event
     * @param  {Object} args Parameters are provided as members of the args object.
     */
    this.removeEventListener = function(args) {
      var eventListeners,
        eventListener,
        i;

      // Make sure this is object we are target
      if (args.id && args.callback && args.event) {

        // Grab the event listener for this id.
        eventListeners = this.eventListeners[args.id];

        // Make sure that an item was found, if not don't try to remove it.
        if (eventListeners) {

          // Find the event that we are trying to remove.
          eventListener = eventListeners[args.event];

          // If we don't find the event just ignore.
          if (eventListener) {

            // If we find the callback, remove it, otherwise, remove them all.
            if (args.callback) {

              // Remove any callbacks matching the one passed associated
              // with this event.
              for (i = 0; i < eventListener.length; i++) {
                if (eventListener[i] === args.callback) {
                  eventListener.splice(i, 1);
                }
              }
            }
            else {
              delete eventListeners[args.event];
            }

            // clean up

            // Check to see if there are any more listeners for
            // this event.  If not delete the event listener
            if (eventListener.length === 0) {
              delete eventListeners[args.event];
            }
          }
        }
      }
    };

    /**
     * This function check if there is at least one map ready
     * @return {boolean} True if there is a map ready, false otherwise.
     *
     */
    this.isAMapReady = function() {
      var mapId;

      for (mapId in mapHash.items) {
        if (mapHash.items.hasOwnProperty(mapId)) {
          if (mapHash.items[mapId].status === emp3.api.enums.MapStateEnum.MAP_READY) {
            return true;
          }
        }
      }

      return false;
    };

    /**
     * Sends the provided message to the Common Map Widget
     * @param {object} message - The message to send to the CMW
     * @param {CallInfo} callInfo - Information about the message which includes source object,
     * arguments to the source object's method, user data
     */
    this.sendMessage = function(message, callInfo) {

      var transaction;

      // Check to see if we are waiting for a map to spawn.  If we
      // are not, then just send the message.  Otherwise the message is
      // queued already and will be sent after the map status changes.

      // If the call info has a map, it for a specific map.
      if (callInfo.hasOwnProperty("map")) {
        // Now check to see if that map is ready.
        if (callInfo.map.status === emp3.api.enums.MapStateEnum.MAP_READY) {
          transaction = this.publish(message, callInfo);
        }
      }
      // else check to see if any map is ready.
      else if (this.isAMapReady()) {
        transaction = this.publish(message, callInfo);
      }
      else {
        throw new Error('There is no map engine available to publish messages to');
      }

      return transaction;
    };

    /**
     * Executes the messages sent to the message handler.
     * @param  {object} message  The message to send.
     * @param  {CallInfo} callInfo Information about the original callers and its parameters.
     */
    this.publish = function(message, callInfo) {
      var transactionId,
        transaction,
        returnedTransaction;

      // In order to track callbacks in response to specific messages, we need to keep
      // track of which message this call is.  Create an id to represent this
      // message so that later we can identify it and associate a callback with it.
      //
      // The following callbacks will require a transactionId, so we can identify it later.
      // For now lets create the transaction always.
      //if (message.onSuccess || message.onError || message.startCallback || message.updateCallback || message.completeCallback || message.cancelCallback) {

      transactionId = emp3.api.createGUID();

      // pass all of the original parameters into the message.
      transaction = {
        mapId: callInfo.mapId,
        transactionId: transactionId,
        callInfo: callInfo,
        source: callInfo.source,
        args: callInfo.args,
        data: message
      };

      // We only care about tracking the messages if a user passes in a
      // success or failure callback.  If the user doesn't pass a callback in
      // that would be responsible for cleaning up the messageCallbackHash, we
      // provide the clean up.

      // The onSuccess callback needs to clean up the messageCallbackHash.  If it doesn't exist, but
      // the function is successful, the messageCallbackHash still needs to clean up.  We provide a
      // default function to do this.
      if (message.onSuccess) {
        transaction.onSuccess = message.onSuccess;
      }
      else {
        transaction.onSuccess = function() {
          emp3.api.MessageHandler.getInstance().messageCallbackHash.removeItem(transactionId);
        };
      }

      // The onError callback needs to clean up the messageCallbackHash if an error occurs.
      // If it doesn't exist, but the function does not succeed, the messageCallbackHash still needs to clean up.  We provide a
      // default function to do this.
      if (message.onError) {
        transaction.onError = message.onError;
      }
      else {
        transaction.onError = function() {
          emp3.api.MessageHandler.getInstance().messageCallbackHash.removeItem(transactionId);
        };
      }

      // The completeCallback callback needs to clean up the messageCallbackHash once a draw or edit completes.
      // This function is only used in draws and edits.
      // If it isn't defined, the messageCallbackHash still needs to clean up.  We provide a
      // default function to do this in case the draw finishes and user did not pass this callback in.
      if (message.completeCallback) {
        transaction.completeCallback = message.completeCallback;
      }
      else {
        transaction.completeCallback = function() {
          emp3.api.MessageHandler.getInstance().messageCallbackHash.removeItem(transactionId);
        };
      }

      // The cancelCallback callback needs to clean up the messageCallbackHash once a user cancels out of
      // a draw or edit.  If the user doesn't define a callback for the cancel, the messageCallbackHash
      // still needs to clean up.  We provide a
      // default function to do this in case the user cancels out of a draw or edit and did not pass
      // this cancel callback in.
      if (message.cancelCallback) {
        transaction.cancelCallback = message.cancelCallback;
      }
      else {
        transaction.cancelCallback = function() {
          emp3.api.MessageHandler.getInstance().messageCallbackHash.removeItem(transactionId);
        };
      }

      if (message.startCallback) {
        transaction.startCallback = message.startCallback;
      }

      if (message.updateCallback) {
        transaction.updateCallback = message.updateCallback;
      }

      if (message.freehandCallback) {
        if (this.eventListeners[transaction.mapId][emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT]) {
          this.eventListeners[transaction.mapId][emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT].push(transaction.freehandCallback);
        }
        else
        {
          this.eventListeners[transaction.mapId][emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT] = [];
          this.eventListeners[transaction.mapId][emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT].push(transaction.freehandCallback);
        }
      }

      this.messageCallbackHash.setItem(transactionId, transaction);

      // Create appropriate channel payload constructor
      var payload = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);
      if (payload) {
        validatePayload(payload, callInfo); // This also publishes it
        return payload.transaction();
      }

      // Handle cases not yet converted and synchronous calls
      switch (message.cmd) {
        case emp3.api.enums.channel.convert:
          this.convert(callInfo, message); // Synchronous call, does not need transactionId
          break;
        case emp3.api.enums.channel.overlayClusterActivate:
          this.overlayClusterActivate(callInfo, message, transactionId);
          break;
        case emp3.api.enums.channel.overlayClusterDeactivate:
          this.overlayClusterDeactivate(callInfo, message, transactionId);
          break;
        case emp3.api.enums.channel.overlayClusterRemove:
          this.overlayClusterRemove(callInfo, message, transactionId);
          break;
        case emp3.api.enums.channel.menuRemove:
        case emp3.api.enums.channel.menuSetVisible:
          // No handlers for these in EMP3
          break;
        case emp3.api.enums.channel.featureEdit:
          returnedTransaction = this.featureEdit(callInfo, message, transactionId);
          break;
        case emp3.api.enums.channel.hideFeature:
          this.hideFeature(callInfo, message, transactionId);
          break;
        case emp3.api.enums.channel.showFeature:
          this.showFeature(callInfo, message, transactionId);
          break;
        case emp3.api.enums.channel.clearFeatures:
          this.clearFeatures(callInfo, message, transactionId);
          break;
        case emp3.api.enums.channel.statusRequest:
          this.statusRequest(callInfo, transaction, transactionId);
          break;
        case emp3.api.enums.channel.clearMap:
          this.clearMap(callInfo, message, transactionId);
          break;
        case emp3.api.enums.channel.lockView:
          this.lockView(callInfo, message);
          break;
        case emp3.api.enums.channel.get:
          this.get(callInfo, message, transactionId);
          break;
        case emp3.api.enums.channel.mapShutdown:
          // Special case, needs to be handled here
          this.mapShutdown(callInfo, message, transactionId);
          break;
        default:
          break;
      }

      return returnedTransaction;
    };

    /**
     * Determines if this message is valid to send.  Checks size of message,
     * and count of messages being sent.   If the message is too large
     * we raise an error and send it back.  If it has too many items, we split
     * it into smaller packets and reassemble them later.
     *
     * @param {String|emp3.api.enums.channel} channel The CMAPI channel used to send the data to the map.
     * @param {Object} message The message in the format corresponding the CMAPI channel
     * we are using.
     * @param {CallInfo} callInfo The information regarding the caller of the function.  This
     * is used to store remaining payloads not sent if the message is too big.
     */
    this.validate = function(channel, message, callInfo) {
      var tempArray,
        splitPayload,
        queuedMessage,
        publishData;

      if (channel === emp3.api.enums.channel.plotFeatureBatch ||
        channel === emp3.api.enums.channel.unplotFeatureBatch) {

        // If it is a batch channel, determine how many items are in the request.
        // If we have more than 500 items, we need to break the requests down into chunks.
        // Pull the first 500 out, and then add the remaining on the callInfo stack.
        // When the first 500 are complete and come back in handleTransactionComplete, that
        // function will send the remaining items.

        splitPayload = message.features.splice(0, 500);


        // Store the remaining items to be processed as well as their
        // returned values.
        tempArray = message.features;
        callInfo.remainingPayload = tempArray;
        callInfo.successes = [];
        callInfo.failures = [];

        // Change the message to only include the items that we are processing.
        // In the case of these batch channels, we just change the size of the
        // features property.
        message.features = splitPayload;
      }

      publishData = {
        channel: channel,
        message: message
      };

      if (callInfo.hasOwnProperty('mapId') && (typeof(callInfo.mapId) === 'string') && (callInfo.mapId.length > 0)) {
        publishData.dest = {
          id: callInfo.mapId
        };
      }

      // Make sure the environment is ready before sending out any messages.   If it isn't,
      // stick the messages in a queue and wait for the environment to return
      if (this.isEnvironmentReady) {

        // If the environment is ready, and there is anything in the queue,
        // empty out the queue first, then proceed to the message to send.
        // we want to make sure the messages get sent in order that they
        // are received.
        // IMPORTANT: Also, just because the environment is ready, does not
        // mean that the map is necessarily ready.  Remember when debugging.
        if (queue.length > 0) {

          // Empty out the queue.
          while (queue.length > 0) {

            queuedMessage = queue.shift();
            environment.pubSub.publish({
              dest: queuedMessage.sender,
              channel: queuedMessage.channel,
              message: queuedMessage.message
            });
          }
        }

        // Send out the data, waiting for the response before sending the next chunk.
        // The response will be handled in handleTransactionComplete
        environment.pubSub.publish(publishData);
      }
      else {
        queue.push(publishData);
      }
    };

    this.getEnvironment = function() {
      return environment;
    };

    /**
     * @private
     * @param {emp3.api.Message} payload
     * @param {CallInfo} callInfo
     */
    var validatePayload = function(payload, callInfo) {
      var queuedMessage,
        publishData,
        splitPayload,
        tempArray;

      if (payload.channel === emp3.api.enums.channel.plotFeatureBatch ||
        payload.channel === emp3.api.enums.channel.unplotFeatureBatch) {

        // If it is a batch channel, determine how many items are in the request.
        // If we have more than 500 items, we need to break the requests down into chunks.
        // Pull the first 500 out, and then add the remaining on the callInfo stack.
        // When the first 500 are complete and come back in handleTransactionComplete, that
        // function will send the remaining items.

        splitPayload = payload.payload.features.splice(0, 500);

        // Store the remaining items to be processed as well as their returned values.
        tempArray = payload.payload.features;
        callInfo.remainingPayload = tempArray;
        callInfo.successes = [];
        callInfo.failures = [];

        // Change the message to only include the items that we are processing.
        // In the case of these batch channels, we just change the size of the
        // features property.
        payload.payload.features = splitPayload;
      }

      publishData = {
        channel: payload.channel,
        message: payload.payload
      };

      if (callInfo.hasOwnProperty('mapId') && (typeof(callInfo.mapId) === 'string') && (callInfo.mapId.length > 0)) {
        publishData.dest = {
          id: callInfo.mapId
        };
      }

      // Make sure the environment is ready before sending out any messages.   If it isn't,
      // stick the messages in a queue and wait for the environment to return
      if (this.isEnvironmentReady) {

        // If the environment is ready, and there is anything in the queue,
        // empty out the queue first, then proceed to the message to send.
        // we want to make sure the messages get sent in order that they
        // are received.
        // IMPORTANT: Also, just because the environment is ready, does not
        // mean that the map is necessarily ready.  Remember when debugging.
        if (queue.length > 0) {

          // Empty out the queue.
          while (queue.length > 0) {

            queuedMessage = queue.shift();
            environment.pubSub.publish({
              dest: queuedMessage.sender,
              channel: queuedMessage.channel,
              message: queuedMessage.message
            });
          }
        }

        // Send out the data, waiting for the response before sending the next chunk.
        // The response will be handled in handleTransactionComplete
        environment.pubSub.publish(publishData);
      }
      else {
        queue.push(publishData);
      }
    }.bind(this);

    /**
     * Registers a map with the messageHandler.  The maps are maintained
     * so that eventing can be routed to proper map.
     *
     * @param {emp3.api.Map} map A Map object.
     */
    this.registerMap = function(map) {
      if (!mapHash.hasItem(map.geoId)) {
        mapHash.setItem(map.geoId, map);
      }
    };

    this.lookupMap = function(mapId) {
      if (mapId && typeof mapId === 'string') {
        return mapHash.getItem(mapId);
      }
    };

    this.unregisterMap = function(map) {
      mapHash.removeItem(map.geoId);
    };

    /**
     * Will notify the caller when the map is ready to receive events.
     *
     * @param {object} message
     * @param {CallInfo} message.callInfo - Information about the caller.
     * @param {object} message.args - The arguments passed in from the caller.
     * @param {function} message.args.onSuccess
     * @param {function} message.args.onError
     */
    this.notifyOnReady = function(message) {
      var payload = {},
        messageRef = message;

      function checkEnvReady() {
        if (that.isEnvironmentReady === true) {
          // Send out a blind check to see if the map is already up
          // and ready. If it is the map will respond, otherwise it won't
          // and we'll wait for the notification.
          that.validate(emp3.api.enums.channel.statusRequest, payload, messageRef.callInfo);
        }
        else {
          setTimeout(checkEnvReady, 500);
        }
      }

      // This will check the onSuccess and onFailure callbacks
      // and let the caller know when the map is ready by calling
      // one of the corresponding functions.
      if (message.args.onSuccess) {

        // Send out an immediate status check, in case the map
        // is up.  If the map is not ready to receive messages this
        // message will get lost, so we'll queue the message to process
        // when the map finally loads.
        payload.types = ["initialization"];

        // Save the callback just in case the map isn't already up.
        this.mapReadyCallback.push({
          onSuccess: message.args.onSuccess,
          onError: message.args.onError
        });

        // Check if the map's environment is ready to proceed
        checkEnvReady();

        //this.validate(emp3.api.enums.channel.statusView, payload, message.callInfo);
      }
    };

    /**
     * Launches an instance of the EMP map.  Depending on the environment the
     * actual result of this function differs.  The map will respond by sending
     * an instance id after the map has successfully instantiated.
     *
     * @param  {Object} args [description]
     * @param  {String} args.containerId A unique id telling the environment how or
     * where to spawn the map.
     * @param args.onSuccess
     * @param args.onError
     * @param {emp3.api.Map} args.map
     * @param {object} args.defaultExtent
     * @param {object} args.engine A map engine configuration object.
     */
    this.spawnMap = function(args) {
      var messageId = emp3.api.createGUID(),
        transaction,
        callInfo = {};

      if (!args) {
        throw new Error("Missing args.");
      }
      if (!args.onSuccess) {
        throw new Error("emp3.api.MessageHandler.spawnMap missing args: onSuccess");
      }
      if (!args.onError) {
        throw new Error("emp3.api.MessageHandler.spawnMap missing args: onError");
      }
      if (!args.container) {
        //throw new Error("emp3.api.MessageHandler.spawnMap missing args: container");
      }
      if (!args.map) {
        throw new Error("emp3.api.MessageHandler.spawnMap missing args: map");
      }
      if (!args.engine) {
        throw new Error("emp3.api.MessageHandler.spawnMap missing args: engine");
      }

      // Create a transaction and store it in our transaction hash like we are waiting for a response
      // when the environment is ready, the messageHandler will receive a transaction complete message.
      // This callInfo will then be received and the onSuccess handler will be called.
      args.messageId = messageId;

      callInfo = {
        source: this,
        method: "MessageHandler.spawnMap",
        args: args
      };

      callInfo.map = args.map;

      transaction = {
        transactionId: messageId,
        callInfo: callInfo,
        source: args.map,
        args: callInfo.args,
        onSuccess: args.onSuccess,
        onError: args.onError
      };

      // store the transaction in the hash.
      this.messageCallbackHash.setItem(messageId, transaction);

      environment.createInstance({
        containerId: args.container,
        messageId: messageId,
        extent: args.defaultExtent,
        engine: args.engine,
        farDistanceThreshold: args.farDistanceThreshold,
        midDistanceThreshold: args.midDistanceThreshold,
        brightness: args.brightness,
        recorder: args.recorder,
        environment: args.environment
      });
    };

    this.mapShutdown = function(callInfo, message, transactionId) {
      // Before we shut it down let make sure it exists.
      if (!mapHash.hasItem(callInfo.map.geoId)) {
        // It does not exists.
        this.messageCallbackHash.removeItem(transactionId);
        message.onError({
          errorMessage: "Map with id " + callInfo.map.geoId + " does not exist.",
          callInfo: callInfo,
          source: callInfo.source,
          args: callInfo.args
        });
      }
      else if (environment.name.toLowerCase() === 'browser') {
        environment.destroyInstance({
          id: callInfo.map.geoId,
          messageId: transactionId
        });
      }
      else {
        // We need to figure out what to do for other environments.
      }
    };

    this.handleMapShutdownTransactionComplete = function(callbacks) {
      try {
        callbacks.onSuccess();
      }
      catch (err) {
        console.error("onSuccess function generated an exception." + "\n  name:" + err.name + "\n  message:" + err.message + "\n  stack:" + err.stack);
      }
    };

    /**
     * Handles the getVisibility transaction complete response form the map and calls the onSuccess method.
     *
     * @param {Object} callbacks Information about the original method call,
     * including the callback methods to call when the method succeeds.
     * @param {Object} details The returned values from the core.
     * @param {Array} failures An array of failures that occurred during
     * the operation in the core.  Just report this back to user in case
     * it occurred.
     */
    this.handleGetVisibilityTransactionComplete = function(callbacks, details, failures) {
      try {

        // Simply call the onSuccess method stored in the callback hash.  The
        // onSuccess should pass the original target and parent (if available)
        // back to the user as well as the visibility status.
        //
        // onError callbacks are handled by the calling method handleTransactionComplete
        callbacks.onSuccess({
          target: callbacks.args.target,
          parent: callbacks.args.parent,
          visible: details.visible,
          failures: failures
        });
      }
      catch (err) {
        console.error("onSuccess function generated an exception." + "\n  name:" + err.name + "\n  message:" + err.message + "\n  stack:" + err.stack);
      }
    };

    /**
     * This function is called after a change to the map state occurs or a
     * request for status map initialization.
     * The change occurs on the map.status.initialization channel.
     * The api listens for the ready event and calls the mapReadyCallback
     * for anyone listening for when the map finishes loading.  This handler
     * also listens for the map heartbeat, and sets the last time the api
     * heard back from the map.  The function will also raise a map closed
     * event when the map is closed.
     *
     * @private
     * @param {object} sender - object containing information about the ozone
     * widget that sent the message.
     * @param {object} msg - the object containing the payload sent over
     * the map.status.initialization channel.
     */
    this.handleMapStatus = function(sender, msg) {
      var payload,
        event,
        i, j,
        callbacks,
        callInfo,
        source,
        args,
        map,
        previousState,
        removeSuccess = false;

      // First make sure there is a payload
      if (msg) {
        // make sure the the payload is an object.
        payload = typeof msg === "string" ? JSON.parse(msg) : msg;
        // Find the map with the id associated with it.
        map = mapHash.getItem(sender.id);
        if (map === undefined) {
          // We got a message for a map we know nothing about or it was removed from the hash.
          // However we may want to add it to the hash. It can be a map that was opened
          // by another client.
          map = mapHash.getItem("broadcast");
          if (map === undefined) {
            return;
          }
        }
        previousState = map.getState();
        map.status = emp3.api.convertStatusType(payload.status);

        map.engineId = payload.engineId;
        // Now we need to raise a map state change event
        if (map) {
          if (this.eventListeners[map.geoId] && this.eventListeners[map.geoId][emp3.api.enums.EventType.MAP_STATE_CHANGE]) {
            callbacks = this.eventListeners[map.geoId][emp3.api.enums.EventType.MAP_STATE_CHANGE];
            event = new emp3.api.events.MapStateChangeEvent({
              event: emp3.api.enums.MapEventEnum.STATE_CHANGE,
              target: map,
              previousState: previousState
            });
            for (i = 0; i < callbacks.length; i++) {
              try {
                callbacks[i](event);
              }
              catch (e) {
                console.error("Event callback generated an exception. " + e.message);
              }
            }
          }
        }
        switch (map.status) {
          case emp3.api.enums.MapStateEnum.MAP_READY:
            emp3.api.enums.defaultOverlayId.WMS = payload.defaultWMSOverlayId;
            emp3.api.enums.defaultOverlayId.Layers = payload.defaultLayerOverlayId;
            // The mapReadyCallback contains any callback functions that are waiting to respond
            // to the onSuccess of the Map constructor.  The messageHandler holds those requests
            // until the actual map responds to the caller by telling it is ready.
            //
            // Once we receive a ready event, we need to loop through any waiting map callbacks
            // and check to see if the source of the callback matches the sending map.  If it is
            // that means the map is ready and we should call the callback.
            for (i = 0; i < this.mapReadyCallback.length; i += 1) {
              // Retrieve information from the message
              callInfo = this.mapReadyCallback[i].callInfo;
              source = this.mapReadyCallback[i].source;
              args = this.mapReadyCallback[i].args;
              // Check to see if the sending map matches this particular source of the callback.
              // If it matches, call the onSuccess function.
              if (sender.id === source.geoId || source.geoId === "broadcast") {
                try {
                  this.mapReadyCallback[i].onSuccess();
                }
                catch (e) {
                  console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
                }
                removeSuccess = true;
                break;
              }
            }
            // remove the mapReadyCallback this was pertaining to.  If we did this inside the
            // loop we'd change the size of the array, and mess it up.
            if (removeSuccess) {
              this.mapReadyCallback.splice(i, 1);
            }
            break;
          case emp3.api.enums.MapStateEnum.SHUTDOWN:
            // Event listeners must be removed to prevent memory leak
            for (i in this.eventListeners[map.geoId]) {
              for (j in this.eventListeners[map.geoId][i]) {
                map.removeEventListener({
                  eventType: i,
                  callback: this.eventListeners[map.geoId][i][j]
                });
              }
            }
            this.unregisterMap(map);
            break;
          case "mapInstanceInitFailed":
            // The mapReadyCallback contains any callback functions that are waiting to respond
            // to the onSuccess or onError of the Map constructor.  The messageHandler holds those requests
            // until the actual map responds to the caller by telling it is ready.
            //
            // Once we receive the event, we need to loop through any waiting map callbacks
            // and check to see if the source of the callback matches the sending map.  If it is
            // that means the map failed to initialize and we should call the callback.
            for (i = 0; i < this.mapReadyCallback.length; i += 1) {
              // Retrieve information from the message
              callInfo = this.mapReadyCallback[i].callInfo;
              source = this.mapReadyCallback[i].source;
              args = this.mapReadyCallback[i].args;
              // Check to see if the sending map matches this particular source of the callback.
              // If it matches, call the onError function.
              if (sender.id === source.geoId) {
                this.mapReadyCallback[i].onError({
                  source: source,
                  callInfo: callInfo,
                  args: args,
                  failures: payload.failures
                });
                this.mapReadyCallback.splice(i, 1);
                break;
              }
            }
            break;
          default:
            break;
        }
      }
    };

    /**
     * This function handles the transaction complete for conversion methods.
     * @param {object} callbacks
     * @param {object} details
     * @param {array} failures
     */
    this.handleMapConvert = function(callbacks, details) {

      switch (callbacks.callInfo.method) {
        case "Map.getLatLonFromXY":
          try {
            callbacks.onSuccess({
              lat: details.y,
              lon: details.x,
              invalid: details.invalid
            });
          }
          catch (e) {
            console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
          }
          break;
        case "Map.getXYFromLatLon":
          try {
            callbacks.onSuccess({
              x: details.x,
              y: details.y,
              invalid: details.invalid
            });
          }
          catch (e) {
            console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
          }
          break;
      }
    };

    /**
     * Message progress handler used to call functions related to operations
     * that have intermediate stages.
     *
     * @private
     * @param {object} sender - Contains information about the widget that sent the message.
     * @param {string} msg - The payload sent over the map.message.progress channel.
     */
    this.handleMessageProgress = function(sender, msg) {
      var oMessage;
      var oDetails;
      var sOriginalChannel;
      var transactionId;

      // First make sure there is a payload
      if (msg === undefined || msg === null) {
        return;
      }

      oMessage = typeof msg === "string" ? JSON.parse(msg) : msg;
      sOriginalChannel = oMessage.originatingChannel;
      oDetails = oMessage.details;

      // Get the transactionId of the message.  We will pull the callback
      // functions that are associated with this transactionId.
      transactionId = oMessage.messageId;

      switch (sOriginalChannel) {
        case emp3.api.enums.channel.featureEdit:
          this.handleEdit(sender, oDetails, transactionId);
          break;
        case emp3.api.enums.channel.draw:
          this.handleDraw(sender, oDetails, transactionId);
          break;
        default:
          return;
      }
    };

    /**
     * Handles events related to adding features.
     *
     * @param {Object} callingObject - The object containing information about
     * the api function invocation leading to event generation.
     */
    this.generateFeatureAddEvents = function(sender, payload) {
      var parentId,
        event = {},
        details,
        parentInfo,
        i,
        j;

      details = Array.isArray(payload.details.features) ? payload.details.features : [payload.details.features];
      // Traverse payload details to collect event arguments and generate the event properties.
      for (i = 0; i < details.length; i += 1) {
        // Check for the existence of an event subscription for each unique parent Id.
        // If none exists then skip to the next item. The parentInfo property can be used
        // here because a feature will always have a parent. This is not the case with
        // overlays that reside on the map's root level. The parentInfo property will not exist
        // in this case.
        parentInfo = details[i].parentInfo;
        if (parentInfo) {
          parentId = parentInfo.featureId || parentInfo.overlayId;
        }
        if (parentId && this.eventListeners[parentId] && this.eventListeners[parentId][emp3.api.enums.EventType.CONTAINER]) {
          // Check to see if the id resides in the hash. If it does not, create a new object.
          event[parentId] = event[parentId] || {};
          // Retrieve any callbacks associated with this parentId. In this case the parentId could
          // pertain to a feature or an overlay
          if (!event[parentId].callbacks) {
            event[parentId].callbacks = this.eventListeners[parentId][emp3.api.enums.EventType.CONTAINER];
            // Check to see if the parentInfo object contains a "featureId" property. If it does, then
            // the parent is a feature and a new target Feature object has to be built
            if (parentInfo.hasOwnProperty("featureId")) {
              event[parentId].target = {
                geoId: parentInfo.featureId,
                name: parentInfo.name,
                type: parentInfo.format,
                properties: parentInfo.properties,
                description: parentInfo.description
              };
              switch (event[parentId].target.type) {
                case emp3.api.enums.FeatureTypeEnum.KML:
                  event[parentId].target.KMLString = parentInfo.feature;
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEOJSON:
                  event[parentId].target.GeoJSONData = parentInfo.feature;
                  break;
                default:
                  event[parentId].target.coordinates = emp3.api.convertGeoJsonToCMAPIPositions(parentInfo.feature);
                  break;
              }
              // Add a symbol code if available
              if (event[parentId].target.type === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
                event[parentId].target.symbolCode = parentInfo.feature.symbolCode;
              }
              // Must build a feature for the target since the parent is a feature.
              event[parentId].target = emp3.api.buildFeature(event[parentId].target);
            } else {
              // Build a new target Overlay object based on parentInfo parameters from payload
              event[parentId].target = emp3.api.buildOverlay({
                geoId: parentId,
                name: parentInfo.name,
                dataProviderId: parentInfo.dataProviderId,
                description: parentInfo.description,
                properties: parentInfo.properties,
                children: parentInfo.children,
                readOnly: parentInfo.properties.readOnly
              });
            }
            // Create the affectedChildren array to send into the Container
            // event object.
            event[parentId].affectedChildren = [];
            event[parentId].containerEvent = new emp3.api.events.ContainerEvent({
              event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
              target: event[parentId].target,
              affectedChildren: event[parentId].affectedChildren
            });
          }
          event[parentId].affectedChild = {
            geoId: details[i].featureId,
            name: details[i].name,
            type: details[i].format,
            properties: details[i].properties,
            description: details[i].description
          };
          switch (event[parentId].affectedChild.type) {
            case emp3.api.enums.FeatureTypeEnum.KML:
              event[parentId].affectedChild.KMLString = details[i].feature;
              break;
            case emp3.api.enums.FeatureTypeEnum.GEOJSON:
              event[parentId].affectedChild.GeoJSONData = details[i].feature;
              break;
            default:
              event[parentId].affectedChild.coordinates = emp3.api.convertGeoJsonToCMAPIPositions(details[i].feature);
              break;
          }
          // Check to see if the child's type is a symbol and if it is send the symbol code into
          // the constructor
          if (event[parentId].affectedChild.type === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
            event[parentId].affectedChild.symbolCode = details[i].feature.symbolCode;
          }
          // Push the built Features on the array list
          event[parentId].affectedChildren.push(emp3.api.buildFeature(event[parentId].affectedChild));
        }
      }
      // If we have callbacks then we need to generate the event.
      for (i in event) {
        for (j = 0; j < event[i].callbacks.length; j += 1) {
          try {
            event[i].callbacks[j](event[i].containerEvent);
          } catch (e) {
            console.error("Event callback generated an exception. " + e.message);
          }
        }
      }
    };

    /**
     * Handles events related to removing features.
     *
     * @param {Object} mHCallingObject - The object containing information about
     * the api function invocation leading to event generation.
     */
    this.generateFeatureDeletedEvents = function(sender, payload) {
      var parentId,
        event = {},
        details,
        parentInfo,
        i,
        j;

      details = Array.isArray(payload.details.features) ? payload.details.features : [payload.details.features];
      // Traverse payload details to collect event arguments and generate the event properties.
      for (i = 0; i < details.length; i += 1) {
        // Check for the existence of an event subscription for each unique parent Id.
        // If none exists then skip to the next item. The parentInfo property can be used
        // here because a feature will always have a parent. This is not the case with
        // overlays that reside on the map's root level. The parentInfo property will not exist
        // in this case.
        parentInfo = details[i].parentInfo;
        if (parentInfo) {
          parentId = parentInfo.featureId || parentInfo.overlayId;
        }
        if (parentId && this.eventListeners[parentId] && this.eventListeners[parentId][emp3.api.enums.EventType.CONTAINER]) {
          // Check to see if the id resides in the hash. If it does not, create a new object.
          event[parentId] = event[parentId] || {};
          // Retrieve any callbacks associated with this parentId. In this case the parentId could
          // pertain to a feature or an overlay
          if (!event[parentId].callbacks) {
            event[parentId].callbacks = this.eventListeners[parentId][emp3.api.enums.EventType.CONTAINER];
            // Check to see if the parentInfo object contains a "featureId" property. If it does, then
            // the parent is a feature and a new target Feature object has to be built
            if (parentInfo.hasOwnProperty("featureId")) {
              event[parentId].target = {
                geoId: parentInfo.featureId,
                name: parentInfo.name,
                type: parentInfo.format,
                properties: parentInfo.properties,
                description: parentInfo.description
              };
              switch (event[parentId].target.type) {
                case emp3.api.enums.FeatureTypeEnum.KML:
                  event[parentId].target.KMLString = parentInfo.feature;
                  break;
                case emp3.api.enums.FeatureTypeEnum.GEOJSON:
                  event[parentId].target.GeoJSONData = parentInfo.feature;
                  break;
                default:
                  event[parentId].target.coordinates = emp3.api.convertGeoJsonToCMAPIPositions(parentInfo.feature);
                  break;
              }
              // Add a symbol code if available
              if (event[parentId].target.type === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
                event[parentId].target.symbolCode = parentInfo.feature.symbolCode;
              }
              // Must build a feature for the target since the parent is a feature.
              event[parentId].target = emp3.api.buildFeature(event[parentId].target);
            } else {
              // Build a new target Overlay object based on parentInfo parameters from payload
              event[parentId].target = emp3.api.buildOverlay({
                geoId: parentId,
                name: parentInfo.name,
                dataProviderId: parentInfo.dataProviderId,
                description: parentInfo.description,
                properties: parentInfo.properties,
                children: parentInfo.children,
                readOnly: parentInfo.properties.readOnly
              });
            }
            // Create the affectedChildren array to send into the Container
            // event object.
            event[parentId].affectedChildren = [];
            event[parentId].containerEvent = new emp3.api.events.ContainerEvent({
              event: emp3.api.enums.ContainerEventEnum.OBJECT_REMOVED,
              target: event[parentId].target,
              affectedChildren: event[parentId].affectedChildren
            });
          }
          event[parentId].affectedChild = {
            geoId: details[i].featureId,
            name: details[i].name,
            type: details[i].format,
            properties: details[i].properties,
            description: details[i].description
          };
          switch (event[parentId].affectedChild.type) {
            case emp3.api.enums.FeatureTypeEnum.KML:
              event[parentId].affectedChild.KMLString = details[i].feature;
              break;
            case emp3.api.enums.FeatureTypeEnum.GEOJSON:
              event[parentId].affectedChild.GeoJSONData = details[i].feature;
              break;
            default:
              event[parentId].affectedChild.coordinates = emp3.api.convertGeoJsonToCMAPIPositions(details[i].feature);
              break;
          }
          // Check to see if the child's type is a symbol and if it is send the symbol code into
          // the constructor
          if (event[parentId].affectedChild.type === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
            event[parentId].affectedChild.symbolCode = details[i].feature.symbolCode;
          }
          // Push the built Features on the array list
          event[parentId].affectedChildren.push(emp3.api.buildFeature(event[parentId].affectedChild));
        }
      }
      // If we have callbacks then we need to generate the event.
      for (i in event) {
        for (j = 0; j < event[i].callbacks.length; j += 1) {
          try {
            event[i].callbacks[j](event[i].containerEvent);
          } catch (e) {
            console.error("Event callback generated an exception. " + e.message);
          }
        }
      }
    };

    this.generateOverlayUpdatedEvents = function(callbacks) {
      var i,
          j,
          overlay,
          overlays = [],
          event,
          eventHandlers;

      if (callbacks.data.overlay) {
        overlays = [callbacks.data.overlay];
      } else if (callbacks.data.overlays) {
        overlays = callbacks.data.overlays;
      }

      for (i = 0; i < overlays.length; i++) {
        overlay = overlays[i];
        if (this.eventListeners[overlay.geoId]) {
          eventHandlers = this.eventListeners[overlay.geoId][emp3.api.enums.EventType.OVERLAY_CHANGE];
        }
        if (eventHandlers) {
          event = new emp3.api.events.OverlayUpdatedEvent({
            target: overlay
          });
          for (j = 0; j < eventHandlers.length; j++) {
            try {
              eventHandlers[j](event);
            } catch (e) {
              console.error("Event callback generated an exception. " + e.message);
            }
          }
        }
      }
    };

    /**
     * Handles events related to the adding overlays.
     *
     * @param {Object} mHCallingObject - The object containing information about
     * the api function invocation leading to event generation.
     */
    this.generateOverlayAddEvents = function(sender, payload) {
      var parentId,
        event = {},
        details,
        parentInfo,
        i,
        j;

      details = Array.isArray(payload.details) ? payload.details : [payload.details];
      // Traverse payload details to collect event arguments and generate the event properties.
      for (i = 0; i < details.length; i += 1) {
        // Check for the existence of an event subscription for each unique parentId.
        // If none exists then the parent is a map.
        parentId = details[i].parentId;

        if (parentId && this.eventListeners[parentId] &&
          this.eventListeners[parentId][emp3.api.enums.EventType.CONTAINER]) {

          // Check to see if the id resides in the hash. If it does not, create a new object.
          event[parentId] = event[parentId] || {};
          // Retrieve any callbacks associated with this parentId. In this case the parentId could
          // pertain to a map or an overlay
          if (!event[parentId].callbacks) {
            event[parentId].callbacks = this.eventListeners[parentId][emp3.api.enums.EventType.CONTAINER];
            // Check to see if the parentId pertains to a map or an overlay. If it is a map,
            // retrieve the map object as the target
            if (parentId === sender.id) {
              event[parentId].target = mapHash.getItem(parentId);
            } else {
              // Build a new target Overlay object based on parentInfo parameters from payload
              parentInfo = details[i].parentInfo;
              event[parentId].target = emp3.api.buildOverlay({
                geoId: parentId,
                name: parentInfo.name,
                dataProviderId: parentInfo.dataProviderId,
                description: parentInfo.description,
                properties: parentInfo.properties,
                children: parentInfo.children,
                readOnly: parentInfo.properties.readOnly
              });
            }
            // Create the affectedChildren array to send into the Container
            // event object
            event[parentId].affectedChildren = [];
            event[parentId].containerEvent = new emp3.api.events.ContainerEvent({
              event: emp3.api.enums.ContainerEventEnum.OBJECT_ADDED,
              target: event[parentId].target,
              affectedChildren: event[parentId].affectedChildren
            });
          }
          // Push the built Overlays on the array list
          event[parentId].affectedChildren.push(emp3.api.buildOverlay({
            geoId: details[i].overlayId,
            name: details[i].name,
            dataProviderId: details[i].dataProviderId,
            description: details[i].description,
            properties: details[i].properties,
            children: details[i].children,
            readOnly: details[i].properties.readOnly
          }));
        }
      }
      // If we have callbacks then we need to generate the event.
      for (i in event) {
        for (j = 0; j < event[i].callbacks.length; j += 1) {
          try {
            event[i].callbacks[j](event[i].containerEvent);
          } catch (e) {
            console.error("Event callback generated an exception. " + e.message);
          }
        }
      }
    };

    /**
     * Handles events related to removing overlays
     *
     * @param {Object} mHCallingObject - The object containing information about
     * the api function invocation leading to event generation.
     */
    this.generateOverlayDeletedEvents = function(sender, payload) {
      var parentId,
        event = {},
        details,
        parentInfo,
        i,
        j;

      details = Array.isArray(payload.details) ? payload.details : [payload.details];
      // Traverse payload details to collect event arguments and generate the event properties.
      for (i = 0; i < details.length; i += 1) {
        // Check for the existence of an event subscription for each unique parentId.
        // If none exists then the parent is a map.
        parentId = details[i].parentId;

        if (parentId && this.eventListeners[parentId] &&
          this.eventListeners[parentId][emp3.api.enums.EventType.CONTAINER]) {
          // Check to see if the id resides in the hash. If it does not, create a new object.
          event[parentId] = event[parentId] || {};
          // Retrieve any callbacks associated with this parentId. In this case the parentId could
          // pertain to a map or an overlay
          if (!event[parentId].callbacks) {
            event[parentId].callbacks = this.eventListeners[parentId][emp3.api.enums.EventType.CONTAINER];
            // Check to see if the parentId pertains to a map or an overlay. If it is a map,
            // retrieve the map object as the target
            if (parentId === sender.id) {
              event[parentId].target = mapHash.getItem(parentId);
            } else {

              parentInfo = details[i].parentInfo;
              // Build a new target Overlay object based on parentInfo parameters from payload
              event[parentId].target = emp3.api.buildOverlay({
                geoId: parentId,
                name: parentInfo.name,
                dataProviderId: parentInfo.dataProviderId,
                description: parentInfo.description,
                properties: parentInfo.properties,
                children: parentInfo.children,
                readOnly: parentInfo.properties.readOnly
              });
            }
            // Create the affectedChildren array to send into the Container
            // event object
            event[parentId].affectedChildren = [];
            event[parentId].containerEvent = new emp3.api.events.ContainerEvent({
              event: emp3.api.enums.ContainerEventEnum.OBJECT_REMOVED,
              target: event[parentId].target,
              affectedChildren: event[parentId].affectedChildren
            });
          }
          // Push the built Overlays on the array list
          event[parentId].affectedChildren.push(emp3.api.buildOverlay({
            geoId: details[i].overlayId,
            name: details[i].name,
            dataProviderId: details[i].dataProviderId,
            description: details[i].description,
            properties: details[i].properties,
            children: details[i].children,
            readOnly: details[i].properties.readOnly
          }));
        }
      }
      // If we have callbacks then we need to generate the event.
      for (i in event) {
        for (j = 0; j < event[i].callbacks.length; j += 1) {
          try {
            event[i].callbacks[j](event[i].containerEvent);
          } catch (e) {
            console.error("Event callback generated an exception. " + e.message);
          }
        }
      }
    };

    /**
     * @desc This function generates the visibility change event.
     *
     * @param {object} sender Contains information about the widget that sent the message.
     * @param {object} payload The response payload. The response payload may differ
     * depending on the originating channel of the message.
     */
    this.generateVisibilityEvent = function(sender, payload) {
      var map,
        containers = payload.details,
        parentTargetAttributes,
        parentContainer,
        targetAttributes,
        targetContainer,
        visibilityState,
        visibilityEvent,
        callbacks = [],
        i,
        j;

      if (sender.id) {
        map = mapHash.getItem(sender.id);
        // Check to see if there are any callbacks registered to any map containers. This is executed here instead of
        // inside the loop because we only want to have one instance of the map level callbacks contained in the
        // callbacks array.
        if (this.eventListeners[sender.id] && this.eventListeners[sender.id][emp3.api.enums.EventType.VISIBILITY]) {
          callbacks.push(this.eventListeners[sender.id][emp3.api.enums.EventType.VISIBILITY]);
        }
      }
      for (i = 0; i < containers.length; i = i + 1) {
        visibilityState = containers[i].visibilityState;
        parentTargetAttributes = containers[i].parentTargetAttributes;
        targetAttributes = containers[i].targetAttributes;
        // Should only be "null" if the target is at the root.
        if (parentTargetAttributes !== null) {
          switch (parentTargetAttributes.globalType) {
            case "overlay":
              parentTargetAttributes.geoId = parentTargetAttributes.overlayId;
              if (parentTargetAttributes.properties.hasOwnProperty("readOnly")) {
                parentTargetAttributes.readOnly = parentTargetAttributes.properties.readOnly;
                delete parentTargetAttributes.properties.readOnly;
              }
              parentContainer = emp3.api.buildOverlay(parentTargetAttributes);
              break;
            case "feature":
              parentTargetAttributes.geoId = parentTargetAttributes.featureId;
              parentTargetAttributes.type = parentTargetAttributes.format;
              parentTargetAttributes.coordinates = emp3.api.convertGeoJsonToCMAPIPositions(parentTargetAttributes.data);
              parentContainer = emp3.api.buildFeature(parentTargetAttributes);
              break;
            default:
              break;
          }
        } else {
          // target is at root and therefore the map container is the parent.
          parentContainer = map;
        }
        switch (targetAttributes.globalType) {
          case "overlay":
            targetAttributes.geoId = targetAttributes.overlayId;
            if (targetAttributes.properties.hasOwnProperty("readOnly")) {
              targetAttributes.readOnly = targetAttributes.properties.readOnly;
              delete targetAttributes.properties.readOnly;
            }
            targetContainer = emp3.api.buildOverlay(targetAttributes);
            break;
          case "feature":
            targetAttributes.geoId = targetAttributes.featureId;
            targetAttributes.type = targetAttributes.format;
            targetAttributes.coordinates = emp3.api.convertGeoJsonToCMAPIPositions(targetAttributes.data);
            targetContainer = emp3.api.buildFeature(targetAttributes);
            break;
          default:
            break;
        }
        // Check to see if there are any overlay or feature level callbacks registered for visibility eventing. If so,
        // a visibility event must be generated for each of these callbacks. If the client has registered a map along
        // with an overlay or feature on that map for visibility events, all callbacks pertaining to each container
        // type will be executed. The events sent to these registered callbacks will be the same.
        if (this.eventListeners[targetAttributes.geoId] && this.eventListeners[targetAttributes.geoId][emp3.api.enums.EventType.VISIBILITY]) {
          callbacks.push(this.eventListeners[targetAttributes.geoId][emp3.api.enums.EventType.VISIBILITY]);
        }
        visibilityEvent = new emp3.api.events.VisibilityEvent({
          event: visibilityState,
          target: targetContainer,
          parent: parentContainer,
          map: map
        });
        if (callbacks.length > 0) {
          // If the length is 2 it means that the client has subscribed to visibility eventing on the map AND the target
          // overlay OR feature. If this is the case, only 2 shift operations are necessary to place all relevant callbacks
          // into one array for execution. Otherwise, only 1 shift operation is needed.
          if (callbacks.length === 2) {
            callbacks = callbacks.concat(callbacks.shift(), callbacks.shift());
          } else {
            callbacks = callbacks.concat(callbacks, callbacks.shift());
          }
          for (j = callbacks.length; j > 0; j = j - 1) {
            callbacks.shift()(visibilityEvent);
          }
        }
      }
    };

    /**
     * Handles the result from all transaction complete channel and forwards to the appropriate
     * onSuccess handler.
     *
     * @private
     * @param {object} sender - Contains information about the widget that sent the message.
     * @param {string} msg - The message payload of the response. The response payload may differ
     * depending on the originating channel of the message.
     */
    this.handleTransactionComplete = function(sender, msg) {
      var payload,
        transactionId,
        callbacks,
        eventArgs,
        originChannel,
        failures,
        details,
        drawEventCallbacks,
        editEventCallbacks,
        i,
        event,
        handleCallback = false;

      // First make sure there is a payload
      if (msg === undefined || msg === null) {
        throw new Error(missingMessageError);
      }

      // make sure the the payload is an object.
      payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

      // Get the originating channel that generated the transaction.  We
      // will use this to modify the responses as the data in the
      // successes parameter will differ depending on the origin of the
      // channel.
      originChannel = payload.originatingChannel;

      // Get the transactionId of the message.  We will pull the callback
      // functions that are associated with this transactionId.
      transactionId = payload.messageId;

      // Retrieve all the failures from the transaction.
      if (payload.failures) {
        failures = payload.failures;
      }

      // Retrieve all the success information about the transaction.
      if (payload.details) {
        details = payload.details;
      }

      // find information about the calling function in the lookup table.
      callbacks = this.messageCallbackHash.getItem(transactionId);

      // If a cancel has been called, abandon the transaction.
      if (payload.status === emp3.api.enums.messageCompletionStatus.CANCELLED) {
        // Its a cancelled transaction. We need to see if it was a draw or an edit.
        // These are the only items that can currently be cancelled.
        if (originChannel === emp3.api.enums.channel.draw ||
          originChannel === emp3.api.enums.channel.featureEdit &&
          (sender && sender.id)) {
          // We need to see if there is a draw/edit cancel listener.
          eventArgs = this.handleCancel(sender, payload);
          // Since both edits and draws have their own cancel events, we must
          // place a condition that checks for both
          switch (originChannel) {
            case emp3.api.enums.channel.draw:
              // Get any draw event callbacks that are registered
              drawEventCallbacks = this.eventListeners[sender.id] ? this.eventListeners[sender.id][emp3.api.enums.EventType.FEATURE_DRAW] : null;
              if (drawEventCallbacks) {
                event = new emp3.api.events.FeatureDrawEvent({
                  event: emp3.api.enums.FeatureDrawEventEnum.DRAW_CANCELLED,
                  target: eventArgs.feature,
                  map: eventArgs.map
                });
                for (i = 0; i < drawEventCallbacks.length; i += 1) {
                  try {
                    drawEventCallbacks[i](event);
                  } catch (e) {
                    console.error("Event callback generated an exception. " + e.message);
                  }
                }
              }
              break;
            case emp3.api.enums.channel.featureEdit:
              // Get any edit event callbacks that are registered
              editEventCallbacks = this.eventListeners[sender.id] ? this.eventListeners[sender.id][emp3.api.enums.EventType.FEATURE_EDIT] : null;
              if (editEventCallbacks) {
                event = new emp3.api.events.FeatureEditEvent({
                  event: emp3.api.enums.FeatureEditEventEnum.EDIT_CANCELLED,
                  target: eventArgs.feature,
                  map: eventArgs.map
                });
                for (i = 0; i < editEventCallbacks.length; i += 1) {
                  try {
                    editEventCallbacks[i](event);
                  } catch (e) {
                    console.error("Event callback generated an exception. " + e.message);
                  }
                }
              }
              break;
          }
        }
      } else if (payload.status !== emp3.api.enums.messageCompletionStatus.FAILURE) {
        // There are some or all successes.
        // Now lets process any completion that generates an event.
        switch (originChannel) {
          case emp3.api.enums.channel.plotFeature:
          case emp3.api.enums.channel.plotFeatureBatch:
            this.generateFeatureAddEvents(sender, payload);
            break;
          case emp3.api.enums.channel.unplotFeature:
          case emp3.api.enums.channel.unplotFeatureBatch:
            this.generateFeatureDeletedEvents(sender, payload);
            break;
          case emp3.api.enums.channel.createOverlay:
            this.generateOverlayAddEvents(sender, payload);
            break;
          case emp3.api.enums.channel.removeOverlay:
            this.generateOverlayDeletedEvents(sender, payload);
            break;
          case emp3.api.enums.channel.updateOverlay:
            this.generateOverlayUpdatedEvents(callbacks);
            break;
          case emp3.api.enums.channel.hideFeature:
          case emp3.api.enums.channel.showFeature:
          case emp3.api.enums.channel.hideOverlay:
          case emp3.api.enums.channel.showOverlay:
            this.generateVisibilityEvent(sender, payload);
            break;
          case emp3.api.enums.channel.featureDeselected:
          case emp3.api.enums.channel.featureDeselectedBatch:
            this.manageDeselection(sender, payload);
            break;
          case emp3.api.enums.channel.featureSelected:
          case emp3.api.enums.channel.featureSelectedBatch:
            this.manageSelection(sender, payload);
            break;
          case emp3.api.enums.channel.freehandDrawStart:
          case emp3.api.enums.channel.freehandDrawExit:
            this.handleFreehand(sender, msg);
            break;
        }
      }
      // Check to make sure a callback has been found.  If no callback has been
      // found then just exit out, we don't care about this message as the user
      // will just carry on without a response.
      if (!callbacks) {
        return;
      }

      // Check to see if there are remaining any messages left to be sent before handling
      // the transaction.  Do not respond to the transaction until there are no remaining
      // transactions.
      if (callbacks.callInfo &&
        callbacks.callInfo.remainingPayload) {

        // The original message was too big to send.  It had to be split up.
        // Now we must send the next part.
        // but first let save the success and failures.
        callbacks.callInfo.failures = callbacks.callInfo.failures.concat(failures);
        callbacks.callInfo.successes = callbacks.callInfo.successes.concat(details);

        // In this case, it is one of the batch functions, AND there are
        // more features to send.
        if ((originChannel === emp3.api.enums.channel.plotFeatureBatch ||
          originChannel === emp3.api.enums.channel.unplotFeatureBatch) &&
          callbacks.callInfo.remainingPayload.length > 0) {

          // This was a batch channel message
          var splitPayload = callbacks.callInfo.remainingPayload.splice(0, 500);
          var msgPayload = {
            messageId: callbacks.transactionId,
            features: splitPayload
          };

          environment.pubSub.publish({
            channel: originChannel,
            message: msgPayload
          });
          // It is one of the batch channels, AND there are no more features to send.
        }
        else if ((originChannel === emp3.api.enums.channel.plotFeatureBatch ||
          originChannel === emp3.api.enums.channel.unplotFeatureBatch) &&
          callbacks.callInfo.remainingPayload.length === 0) {

          // now join successes together into a single success.
          payload.details = joinDetails(callbacks.callInfo.successes, originChannel);

          // join errors together.
          callbacks.callInfo.failures = callbacks.callInfo.failures.concat(failures);

          // mark this message to respond to the callback.
          handleCallback = true;

        }

      }
      else {

        // mark this message to respond to the callback.
        handleCallback = true;
      }

      // Check to make sure we have clearance to process the transaction response.  We will only
      // get this once the entire message has been processed.  If only part of the message was
      // process because the original transaction was split, we should not return the success or
      // failure of the transaction.
      if (handleCallback) {

        // Remove transactionId from hash.  We want to do this regardless if we
        // have a onSuccess handler or not, and we want it to be first in case an
        // error occurs later.
        this.messageCallbackHash.removeItem(transactionId);

        // If there are no successes, but we have failures, call onError.
        // Report the first error.  If there are more that is fine, but
        // the callback only supports one message at a time.
        if ((payload.status === emp3.api.enums.messageCompletionStatus.FAILURE) &&
          (originChannel !== emp3.api.enums.channel.draw &&
          originChannel !== emp3.api.enums.channel.featureEdit)) {
          try {
            callbacks.onError({
              callInfo: callbacks.callInfo,
              source: callbacks.source,
              args: callbacks.args,
              errorMessage: failures[0].message
            });
          }
          catch (e) {
            console.error("onError function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
          }
        }
        else {

          if (originChannel) {

            // Grab the appropriate channel response broker
            var broker = emp3.api.ResponseBrokerFactory.getBroker(originChannel);
            if (broker) {
              try {
                broker.process(callbacks, payload.details, failures);
              }
              catch (err) {
                console.error("Callback function generated an exception." + "\n  name:" + err.name + "\n  message:" + err.message + "\n  stack:" + err.stack);
              }
              return;
            }

            // There are some successes so finish through the transaction.
            switch (originChannel) {
              case emp3.api.enums.channel.centerOnBounds:
                this.handleCenterOnBoundsTransactionComplete(callbacks, payload.details);
                break;
              case emp3.api.enums.channel.zoom:
                this.handleZoomTransactionComplete(callbacks, payload.details);
                break;
              case emp3.api.enums.channel.centerOnFeature:
                this.handleCenterOnFeatureTransactionComplete(callbacks, payload.details);
                break;
              case emp3.api.enums.channel.centerOnLocation:
                this.handleCenterOnLocationTransactionComplete(callbacks, payload.details);
                break;
              case emp3.api.enums.channel.lookAtLocation:
                this.handleLookAtLocationTransactionComplete(callbacks, payload.details);
                break;
              case emp3.api.enums.channel.draw:
              case emp3.api.enums.channel.featureEdit:
                this.handleDrawEditTransactionComplete(callbacks, payload, failures);
                break;
              case emp3.api.enums.channel.convert:
                this.handleMapConvert(callbacks, payload.details);
                break;
              case emp3.api.enums.channel.mapShutdown:
                this.handleMapShutdownTransactionComplete(callbacks);
                break;
              case emp3.api.enums.channel.getVisibility:
                this.handleGetVisibilityTransactionComplete(callbacks, payload.details, failures);
                break;
              case emp3.api.enums.channel.setVisibility:
                try {
                  callbacks.onSuccess({
                    failures: failures
                  });
                }
                catch (e) {
                  console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
                }
                break;
              default:
                try {
                  callbacks.onSuccess();
                }
                catch (e) {
                  console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
                }

                break;
            }
          }
          else {
            // if there is no origin channel, then this is a map instantiation.  This
            // is not a normal message.  It will come with no origin channel.  This occurs
            // when the map is created and the map needs an id to complete its instantiation.
            // The map receives its id from the map core.  A request is made to the map using
            // environment.createInstance, and we expect a transaction response in return.
            try {
              callbacks.onSuccess({
                id: sender.id
              });
            }
            catch (e) {
              console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
            }
          }
        }
      }
    };

    /**
     Handles the error messages from a CMAPI map.

     @param {string} sender - the widget instance id of the map sending the error response.
     @param {object} msg - the message payload of the error.
     */
    this.handleError = function(sender, msg) {

      var payload,
        transactionId,
        callbacks,
        i;

      // First make sure there is a payload
      if (msg !== undefined && msg !== null) {

        // get message id from response.

        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        if ((payload.sender !== undefined && payload.sender !== null) &&
          (payload.type !== undefined && payload.type !== null) &&
          (payload.msg !== undefined && payload.msg !== null)) {

          // If the payload is not meant for this message handler
          // then exit out immediately.
          if (payload.sender !== environment.sender.id) {
            return;
          }

          //var type = payload.type;

          if (Array.isArray(payload.msg)) {
            for (i = 0; i < payload.msg.length; i += 1) {
              if (payload.msg[i].transactionId !== undefined && payload.msg[i].transactionId !== null) {
                transactionId = payload.msg[i].transactionId;

                // find message id in lookup table.
                callbacks = this.messageCallbackHash.getItem(transactionId);

                // Check to make sure a callback has been found.
                if (callbacks !== undefined && callbacks !== null) {

                  // Remove transactionId from hash.
                  this.messageCallbackHash.removeItem(transactionId);

                  //call the error function associated with that lookup id
                  //format the data based on the type of message.
                  callbacks.onError({
                    callInfo: callbacks.callInfo,
                    source: callbacks.source,
                    args: callbacks.args,
                    errorMessage: payload.error
                  });
                }
                break;
              }
            }
          }
          else {
            // get the message id, type of message.
            if (payload.msg.transactionId !== undefined && payload.msg.transactionId !== null) {
              transactionId = payload.msg.transactionId;

              // find message id in lookup table.
              callbacks = this.messageCallbackHash.getItem(transactionId);

              // Check to make sure a callback has been found.
              if (callbacks !== undefined && callbacks !== null) {

                //call the error function associated with that lookup id
                //format the data based on the type of message.
                callbacks.onError({
                  callInfo: callbacks.callInfo,
                  source: callbacks.source,
                  args: callbacks.args,
                  errorMessage: payload.error
                });

                // Remove transactionId from hash.
                this.messageCallbackHash.removeItem(transactionId);
              }
            }
          }

          // Report the error for debugging tools.
          if (window.hasOwnProperty("console")) {
            console.error(payload.error);
            console.info(msg); // eslint-disable-line no-console
          }

        }
        else {
          throw new Error(missingParameterError);
        }
      }
      else {
        throw new Error(missingMessageError);
      }
    };

    /**
     Receives a message when a request has been made to get the current
     bounds of the map.
     */
    this.handleStatusView = function(sender, msg) {
      var payload,
        map,
        camera,
        lookAt,
        mapViewCallbacks,
        cameraCallbacks,
        lookAtCallbacks,
        executeCallbacks,
        cameraEvent,
        lookAtEvent,
        mapViewEvent,
        extent;

      if (sender && sender.id) {
        // Retrieve the payload
        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;
        // Retrieve the map.  We will need to set it's extent.
        // A call from the map means the extent change.  Updating
        // the map will allow developers to have latest extent
        map = mapHash.getItem(sender.id);
        extent = {
          north: payload.bounds.northEast.lat,
          west: payload.bounds.southWest.lon,
          south: payload.bounds.southWest.lat,
          east: payload.bounds.northEast.lon,
          range: payload.range,
          altitude: payload.altitude,
          scale: payload.scale,
          centerLat: payload.center.lat,
          centerLon: payload.center.lon,
          roll: payload.roll,
          heading: payload.heading,
          tilt: payload.tilt
        };
        if (map) {
          //Set the new map extents
          map.bounds = extent;

          camera = map.getCamera();
          if (!camera) {
            camera = new emp3.api.Camera();
            emp3.api.CameraManager.setCameraForMap({
              camera: camera,
              map: map
            });
          }
          camera.latitude = extent.centerLat;
          camera.longitude = extent.centerLon;
          camera.altitude = extent.altitude;
          camera.roll = extent.roll;
          camera.tilt = extent.tilt;
          camera.heading = extent.heading;

          lookAt = map.getLookAt();
          if (!lookAt) {
            lookAt = new emp3.api.LookAt();
            emp3.api.LookAtManager.setLookAtForMap({
              lookAt: lookAt,
              map: map
            });
          }

          lookAt.latitude = payload.lookAt.latitude;
          lookAt.longitude = payload.lookAt.longitude;
          lookAt.altitude = payload.lookAt.altitude;
          lookAt.range = payload.lookAt.range;
          lookAt.tilt = payload.lookAt.tilt;
          lookAt.heading = payload.lookAt.heading;
          lookAt.altitudeMode = cmapi.enums.altitudeMode.CLAMP_TO_GROUND;
        }
        // Send out the extent changed event if needed.
        // Make sure this is coming from map--from somebody.  We'll then
        // check if there is callbacks associated with it.  If there are
        // callbacks, then call them at this point.  There is a try catch
        // block around callbacks in case the callback has an error.  If an
        // error occurred, the rest of the callbacks would not fire.
        if (this.eventListeners[sender.id]) {
          executeCallbacks = function(args) {
            for (var i = 0; i < args.callbacksArray.length; i += 1) {
              try {
                args.callbacksArray[i](args.event);
              }
              catch (e) {
                console.error("Event callback generated an exception. " + e.message);
              }
            }
          };
          // get the camera with extent values previously assigned to the map
          camera = map.getCamera();
          cameraEvent = new emp3.api.events.CameraEvent({
            event: payload.animate !== 0 ? emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION : emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED,
            target: camera
          });
          // if this is our first time the extent was set, make the old extent the same
          // as the new.
          //              if (latestExtent) {
          //TODO:  This is wrong, latestExtent picks up from all maps, will have map extents from
          //multiple maps in this.
          //                latestExtent.oldExtent = latestExtent.extent;
          //                latestExtent.extent = extent;
          //              } else {
          mapViewEvent = new emp3.api.events.MapViewChangeEvent({
            event: payload.animate || emp3.api.enums.MapViewEventEnum.VIEW_MOTION_STOPPED,
            target: map
          });
          //              }
          mapViewCallbacks = this.eventListeners[sender.id][emp3.api.enums.EventType.MAP_VIEW_CHANGE];
          cameraCallbacks = this.eventListeners[sender.id][emp3.api.enums.EventType.CAMERA_EVENT];
          if (mapViewCallbacks) {
            try {
              executeCallbacks({
                callbacksArray: mapViewCallbacks,
                event: mapViewEvent
              });
            }
            catch (e) {
              console.error("Event callback generated an exception. " + e.message);
            }
          }
          if (cameraCallbacks) {
            try {
              executeCallbacks({
                callbacksArray: cameraCallbacks,
                event: cameraEvent
              });
            }
            catch (e) {
              console.error("Event callback generated an exception. " + e.message);
            }
          }
          if (lookAtCallbacks) {
            try {
              executeCallbacks({
                callbacksArray: lookAtCallbacks,
                event: lookAtEvent
              });
            }
            catch (e) {
              console.error("Event callback generated an exception. " + e.message);
            }
          }
        }
      }
    };

    this.handleStatusAboutResponse = function(sender, msg) {
      var payload,
        callbacks;

      // First make sure there is a payload
      if (msg !== undefined && msg !== null) {
        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        while (this.statusRequestPendingList.about.length > 0) {
          callbacks = this.statusRequestPendingList.about[0];
          // Send the about information back to the user.
          if (callbacks !== undefined && callbacks !== null) {
            if (typeof callbacks.onSuccess === "function") {
              try {
                callbacks.onSuccess(payload);
              }
              catch (e) {
                console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
              }
            }
          }
          this.statusRequestPendingList.about.splice(0, 1);
        }
      }
      else {
        throw new Error(missingMessageError);
      }
    };

    this.handleStatusFormatResponse = function(sender, msg) {
      var payload,
        callbacks;

      // First make sure there is a payload
      if (msg !== undefined && msg !== null) {
        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        while (this.statusRequestPendingList.format.length > 0) {
          callbacks = this.statusRequestPendingList.format[0];
          // Send the about information back to the user.
          if (callbacks !== undefined && callbacks !== null) {
            if (typeof callbacks.onSuccess === "function") {
              try {
                callbacks.onSuccess(payload);
              }
              catch (e) {
                console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
              }
            }
          }

          this.statusRequestPendingList.format.splice(0, 1);
        }
      }
      else {
        throw new Error(missingMessageError);
      }
    };

    this.handleStatusScreenshot = function(sender, msg) {
      var payload,
        callbacks;

      // First make sure there is a payload
      if (msg !== undefined && msg !== null) {
        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        if (this.statusRequestPendingList.screenshot.length > 0) {
          callbacks = this.statusRequestPendingList.screenshot[0];

          if (callbacks !== undefined && callbacks !== null) {
            if (typeof callbacks.onSuccess === "function") {
              try {
                callbacks.onSuccess({
                  dataUrl: payload.dataUrl
                });
              }
              catch (e) {
                console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
              }
            }
          }
          this.statusRequestPendingList.screenshot.splice(0, 1);
        }
      }
      else {
        throw new Error(missingMessageError);
      }
    };

    /**
     Receives a message from the overlays status channel which occurs after an overlays
     request is made.
     */
    this.handleOverlaysStatus = function(sender, msg) {

      var payload,
        transactionId,
        map,
        overlays,
        overlayArray,
        callbacks;

      // First make sure there is a payload
      if (msg !== undefined && msg !== null) {

        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        if (payload.overlays !== undefined && payload.overlay !== null) {
          overlays = payload.overlays;
        }

        // get the message id if available.
        if (payload.messageId !== undefined && payload.messageId !== null) {

          transactionId = payload.messageId;

          // find message id in lookup table.
          callbacks = this.messageCallbackHash.getItem(transactionId);

          // Check to make sure a callback has been found.
          if (callbacks !== undefined && callbacks !== null) {

            map = callbacks.source;
            map.overlays = {};
            overlayArray = [];

            overlayArray = this.buildOverlayArray(overlays, overlayArray, map);

            try {
              callbacks.onSuccess({
                overlays: overlayArray
              });
            }
            catch (e) {
              console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
            }

            // Remove transactionId from hash.
            this.messageCallbackHash.removeItem(transactionId);
          }
        }
      }
      else {
        throw new Error(missingMessageError);
      }
    };

    /**
     * Helper method for handleOverlaysStatus, recursively retrieves all
     * overlays and child overlays
     * @returns {Array} overlayArray
     */
    this.buildOverlayArray = function(overlays, overlayArray, map) {
      var overlayId,
        obj,
        overlay;
      for (overlayId in overlays) {
        if (overlays.hasOwnProperty(overlayId)) {
          overlay = overlays[overlayId];

          obj = new emp3.api.Overlay({
            id: overlay.id,
            name: overlay.name,
            parentId: overlay.parentId,
            owner: overlay.owner,
            description: overlay.description,
            iconUrl: overlay.iconUrl,
            isVisible: overlay.visible,
            permissions: {
              readonly: overlay.readonly
            },
            map: map
          });

          map.overlays[overlay.id] = obj;
          overlayArray.push(obj);

          if (overlay.children) {
            overlayArray = this.buildOverlayArray(overlay.children, overlayArray, map);
          }
        }
      }
      return overlayArray;
    };

    /**
     Receives a message from the overlay status channel which occurs after a single overlay
     request is made.
     */
    this.handleOverlayStatus = function(sender, msg) {

      var payload,
        transactionId,
        map,
        overlay,
        callbacks;

      // First make sure there is a payload
      if (msg !== undefined && msg !== null) {

        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        // get the message id if available.
        if (payload.messageId !== undefined && payload.messageId !== null) {

          transactionId = payload.messageId;

          // find message id in lookup table.
          callbacks = this.messageCallbackHash.getItem(transactionId);

          // Check to make sure a callback has been found.
          if (callbacks !== undefined && callbacks !== null) {

            map = callbacks.source;
            overlay = new emp3.api.Overlay({
              id: payload.id,
              name: payload.name,
              owner: payload.owner,
              isVisible: payload.isVisible,
              permissions: {
                readonly: payload.readonly
              },
              map: map
            });

            overlay.parentId = payload.parentId;

            //map.overlays[overlay.id] = overlay;
            try {
              callbacks.onSuccess({
                overlay: overlay
              });
            }
            catch (e) {
              console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
            }

            // Remove transactionId from hash.
            this.messageCallbackHash.removeItem(transactionId);
          }
        }
      }
      else {
        throw new Error(missingMessageError);
      }
    };

    /**
     Called when message handler intercepts a message over
     the map.status.selected channel. If msg has a message id, this function
     will fetch the proper callback and invoke the onSuccess(args) function
     associated with the corresponding method that is using the
     map.status.selected channel.

     @private
     @param {string} sender - object containing information about the ozone
     widget that sent the message.
     @param {object} msg - object containing the payload sent over
     the map.status.selected channel
     **/
    this.handleStatusSelected = function(sender, msg) {

      var callbacks;
      var args;
      var selectedFeature;
      var payload;
      var i;
      var transactionId;
      var feature;

      // First make sure there is a payload
      if (msg) {

        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        if (payload) {

          // find message id in lookup table.
          transactionId = payload.messageId;
          callbacks = this.messageCallbackHash.getItem(transactionId);

          // Check to make sure a callback has been found.  If none
          // is found, this widget probably did not make the call so
          // skip returning anything.
          if (callbacks) {
            // Use callbacks only if it exists.
            args = {
              failures: payload.failures
            };

            switch (callbacks.callInfo.method) {
              case "Map.getSelected":

                args.features = [];

                for (i = 0; i < payload.selectedFeatures.length; i++) {
                  selectedFeature = payload.selectedFeatures[i];

                  feature = emp3.api.buildFeature({
                    type: selectedFeature.properties.featureType,
                    geoId: selectedFeature.featureId,
                    name: selectedFeature.name,
                    coordinates: emp3.api.convertLocationArrayToCMAPI(selectedFeature.feature.coordinates),
                    properties: selectedFeature.properties
                  });

                  args.features.push(feature);
                }
                break;
            }

            if (typeof callbacks.onSuccess === "function") {
              // Make sure the onSuccess exists.
              try {
                callbacks.onSuccess(args);
              }
              catch (e) {
                console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
              }
            }
          }
        }
      }
      else {
        throw new Error(missingMessageError);
      }
    };

    /**
     * Cancel handler used to execute drawCancel/editCancel callback(s).
     *
     * @private
     * @param {object} sender - Contains information about the widget that sent the message.
     * @param {object} message - The object containing the payload sent over
     * the map.message.complete channel.
     * @return {object} Object containing map and feature information.
     */
    this.handleCancel = function(sender, message) {
      var messageId,
        callbacks,
        args = {};

      // retrieve the messageId associated with the cancel.
      messageId = message.messageId;
      // retrieve the callbacks associated with the original
      // Map.drawFeature/Map.editFeature call.
      callbacks = this.messageCallbackHash.getItem(messageId);
      args.map = mapHash.getItem(sender.id);
      if (callbacks) {
        args.feature = callbacks.data.feature;
        // If callbacks are defined for this message we must call it.
        if (callbacks.cancelCallback) {
          callbacks.cancelCallback(args);
        }
        // cancelling sent to the api map that covers the case of user editing of drawing and cancelling
        // the operation to start a freehand draw. The cancelling originates on the map core so this notifies the
        // api about the cancelling by setting the transaction to null  with a delay. The delay
        // allows the cancelling operation to complete. A more proper implementation would be to
        // use a callback to set the transaction to null. The existing callbaks in the transaction
        // can originate in the client I need a callback originating in the api map to be able to
        // access the transactions.
        if (message.originatingChannel && message.originatingChannel === 'map.feature.edit')
        {
          setTimeout(function() {
              callbacks.source.editTransaction = null;
          }, 50);
        }
        else if (message.originatingChannel && message.originatingChannel === 'map.feature.draw')
        {
          setTimeout(function() {
              callbacks.source.drawTransaction = null;
          }, 50);
        }
      }
      return args;
    };

    /**
     * Draw handler used to call the start, update, or complete operations.
     *
     * @private
     * @param {object} sender - Contains information about the widget that sent the message.
     * @param {object} message - The object containing the payload sent over
     * the map.message.progress channel.
     * @param {string} messageId - The transaction id related to the message.
     */
    this.handleDraw = function(sender, message, messageId) {
      var eventArgs,
        event,
        i,
        drawEventCallbacks;

      if (message && message.status && sender && sender.id) {
        // Get any draw event callbacks that are registered
        drawEventCallbacks = this.eventListeners[sender.id] ? this.eventListeners[sender.id][emp3.api.enums.EventType.FEATURE_DRAW] : null;
        switch (message.status) {
          case emp3.api.enums.FeatureDrawEventEnum.DRAW_START:
            eventArgs = this.handleStart(sender, message, messageId);
            if (drawEventCallbacks) {
              event = new emp3.api.events.FeatureDrawEvent({
                event: emp3.api.enums.FeatureDrawEventEnum.DRAW_START,
                target: eventArgs.feature,
                map: eventArgs.map
              });
              for (i = 0; i < drawEventCallbacks.length; i += 1) {
                try {
                  drawEventCallbacks[i](event);
                }
                catch (e) {
                  console.error("Event callback generated an exception. " + e.message);
                }
              }
            }
            break;
          case emp3.api.enums.FeatureDrawEventEnum.DRAW_UPDATE:
            eventArgs = this.handleUpdate(sender, message, messageId);
            if (drawEventCallbacks) {
              event = new emp3.api.events.FeatureDrawEvent({
                event: emp3.api.enums.FeatureDrawEventEnum.DRAW_UPDATE,
                target: eventArgs.feature,
                map: eventArgs.map,
                updateList: eventArgs.updateList
              });
              for (i = 0; i < drawEventCallbacks.length; i += 1) {
                try {
                  drawEventCallbacks[i](event);
                }
                catch (e) {
                  console.error("Event callback generated an exception. " + e.message);
                }
              }
            }
            break;
          case emp3.api.enums.FeatureDrawEventEnum.DRAW_COMPLETE:
            eventArgs = this.handleComplete(sender, message, messageId);
            if (drawEventCallbacks) {
              event = new emp3.api.events.FeatureDrawEvent({
                event: emp3.api.enums.FeatureDrawEventEnum.DRAW_COMPLETE,
                target: eventArgs.feature,
                map: eventArgs.map
              });
              for (i = 0; i < drawEventCallbacks.length; i += 1) {
                try {
                  drawEventCallbacks[i](event);
                }
                catch (e) {
                  console.error("Event callback generated an exception. " + e.message);
                }
              }
            }
            break;
        }
      }
    };

    /**
     * Start handler used to execute drawStart/editStart callback(s).
     *
     * @private
     * @param {object} sender - Contains information about the widget that sent the message.
     * @param {object} message - The object containing the payload sent over
     * the map.message.progress channel.
     * @param {string} messageId - The transaction id related to the message.
     * @return {object} Object containing map and feature information.
     */
    this.handleStart = function(sender, message, messageId) {
      var callbacks,
        args = {};

      // retrieve the callbacks associated with the original
      // Map.drawFeature/Map.editFeature call.
      callbacks = this.messageCallbackHash.getItem(messageId);
      args.map = mapHash.getItem(sender.id);
      // make sure message.properties.featureType is defined -- if not we
      // won't know what to build.
      if (message.properties && message.properties.featureType && message.feature) {
        args.feature = emp3.api.buildFeature({
          type: message.properties.featureType,
          geoId: message.featureId,
          name: message.name,
          coordinates: emp3.api.convertGeoJsonToCMAPIPositions(message.feature),
          properties: message.properties,
          symbolCode: message.feature.symbolCode
        });
      }
      if (callbacks) {
        // If callbacks are defined for this message we must call it.
        if (callbacks.startCallback) {
          callbacks.startCallback(args);
        }
      }
      return args;
    };

    /**
     * Update handler used to execute drawUpdate/editUpdate callback(s).
     *
     * @private
     * @param {object} sender - Contains information about the widget that sent the message.
     * @param {object} message - The object containing the payload sent over
     * the map.message.progress channel.
     * @param {string} messageId - The transaction id related to the message.
     * @return {object} Object containing map and feature information.
     */
    this.handleUpdate = function(sender, message, messageId) {
      var callbacks,
        args = {};

      // retrieve the callbacks associated with the original
      // Map.drawFeature/Map.editFeature call.
      callbacks = this.messageCallbackHash.getItem(messageId);
      args.map = mapHash.getItem(sender.id);
      // the update callback sends back 3 args, map,
      // the new feature, and updates object.
      // create the updated feature.
      args.updateList = [];
      if (message.updates) {
        // make sure message.properties.featureType is defined -- if not we
        // won't know what to build.
        if (message.properties && message.properties.featureType && message.feature) {
          args.feature = emp3.api.buildFeature({
            type: message.properties.featureType,
            geoId: message.featureId,
            name: message.name,
            coordinates: emp3.api.convertLocationArrayToCMAPI(message.updates.coordinates),
            properties: message.properties,
            symbolCoce: message.feature.symbolCode
          });
        }
        args.updateList.push({
          changedAttribute: undefined,
          changedModifier: undefined,
          coordinateIndexes: message.updates.indices,
          updateType: message.updates.type
        });
      }
      if (callbacks) {
        // If callbacks are defined for this message we must call it.
        if (callbacks.updateCallback) {
          callbacks.updateCallback(args);
        }
      }
      return args;
    };

    /**
     * Complete handler used to execute drawComplete/editComplete callback(s).
     *
     * @private
     * @param {object} sender - Contains information about the widget that sent the message.
     * @param {object} message - The object containing the payload sent over
     * the map.message.progress channel.
     * @param {string} messageId - The transaction id related to the message.
     * @return {object} Object containing map and feature information.
     */
    this.handleComplete = function(sender, message, messageId) {
      var callbacks,
        args = {};

      // retrieve the callbacks associated with the original
      // Map.drawFeature/Map.editFeature call.
      callbacks = this.messageCallbackHash.getItem(messageId);
      args.map = mapHash.getItem(sender.id);
      // make sure message.properties.featureType is defined -- if not we
      // won't know what to build.
      if (message.updates && message.properties && message.properties.featureType && message.feature) {
        if (callbacks.args && callbacks.args.feature )
        {
          //callbacks is holding original feature sent by client. Use this message feature to keep
          //the reference to the client's feature instead of sending a copy with no reference to client.
          //Update original feature with updates sent by the editor
          args.feature = callbacks.args.feature;
          args.feature.coordinates = emp3.api.convertLocationArrayToCMAPI(message.updates.coordinates);
          args.feature.properties = message.properties;
          args.feature.symbolCode = message.symbolCode;
        }
        else
        {

          args.feature = emp3.api.buildFeature({
            type: message.properties.featureType,
            geoId: message.featureId,
            name: message.name,
            coordinates: emp3.api.convertLocationArrayToCMAPI(message.updates.coordinates),
            properties: message.properties,
            symbolCode: message.feature.symbolCode
          });
       }
      }
      if (callbacks) {
        // If callbacks are defined for this message we must call it.
        if (callbacks.completeCallback) {
          callbacks.completeCallback(args);
        }
      }
      return args;
    };

    /**
     * Edit handler used to call the start, update, or complete operations.
     *
     * @private
     * @param {object} sender - Contains information about the widget that sent the message.
     * @param {object} message - The object containing the payload sent over
     * the map.message.progress channel.
     * @param {string} messageId - The transaction id related to the message.
     */
    this.handleEdit = function(sender, message, messageId) {
      var eventArgs,
        event,
        i,
        editEventCallbacks;

      if (message && message.status && sender && sender.id) {
        // Get any edit event callbacks that are registered
        editEventCallbacks = this.eventListeners[sender.id] ? this.eventListeners[sender.id][emp3.api.enums.EventType.FEATURE_EDIT] : null;
        switch (message.status) {
          case emp3.api.enums.FeatureEditEventEnum.EDIT_START:
            eventArgs = this.handleStart(sender, message, messageId);
            if (editEventCallbacks) {
              event = new emp3.api.events.FeatureEditEvent({
                event: emp3.api.enums.FeatureEditEventEnum.EDIT_START,
                target: eventArgs.feature,
                map: eventArgs.map
              });
              for (i = 0; i < editEventCallbacks.length; i += 1) {
                try {
                  editEventCallbacks[i](event);
                }
                catch (e) {
                  console.error("Event callback generated an exception. " + e.message);
                }
              }
            }
            break;
          case emp3.api.enums.FeatureEditEventEnum.EDIT_UPDATE:
            eventArgs = this.handleUpdate(sender, message, messageId);
            if (editEventCallbacks) {
              event = new emp3.api.events.FeatureEditEvent({
                event: emp3.api.enums.FeatureEditEventEnum.EDIT_UPDATE,
                target: eventArgs.feature,
                map: eventArgs.map,
                updateList: eventArgs.updateList
              });
              for (i = 0; i < editEventCallbacks.length; i += 1) {
                try {
                  editEventCallbacks[i](event);
                }
                catch (e) {
                  console.error("Event callback generated an exception. " + e.message);
                }
              }
            }
            break;
          case emp3.api.enums.FeatureEditEventEnum.EDIT_COMPLETE:
            eventArgs = this.handleComplete(sender, message, messageId);
            if (editEventCallbacks) {
              event = new emp3.api.events.FeatureEditEvent({
                event: emp3.api.enums.FeatureEditEventEnum.EDIT_COMPLETE,
                target: eventArgs.feature,
                map: eventArgs.map
              });
              for (i = 0; i < editEventCallbacks.length; i += 1) {
                try {
                  editEventCallbacks[i](event);
                }
                catch (e) {
                  console.error("Event callback generated an exception. " + e.message);
                }
              }
            }
            break;
        }
      }
    };

    this.handleMapCursorMove = function(sender, msg) {
      var callbacks,
          payload,
          mapCursorMoveEvent = {},
          keys = [],
          i;

      if (sender.id && this.eventListeners[sender.id]) {
        callbacks = this.eventListeners[sender.id][emp3.api.enums.EventType.MAP_CURSOR_MOVE];
        // If we have any callbacks to call loop through them
        // and call them.
        if (callbacks) {
          // make sure there is a payload
          if (msg !== undefined && msg !== null) {
            // make sure the the payload is an object.
            payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;
            mapCursorMoveEvent.type = emp3.api.enums.EventType.MAP_CURSOR_MOVE;
            mapCursorMoveEvent.event = emp3.api.enums.UserInteractionEventEnum.MOUSE_MOVE;
            mapCursorMoveEvent.target = mapHash.getItem(sender.id);
            mapCursorMoveEvent.point = {
              x: payload.clientX,
              y: payload.clientY
            };
            mapCursorMoveEvent.position = {
              latitude: payload.latitude,
              longitude: payload.longitude,
              altitude: payload.altitude
            };
            for (i in payload.keys) {
              switch (payload.keys[i]) {
                case "ctrl":
                  keys.push(emp3.api.enums.UserInteractionKeyEventEnum.CTRL);
                  break;
                case "shift":
                  keys.push(emp3.api.enums.UserInteractionKeyEventEnum.SHIFT);
                  break;
                case "alt":
                  keys.push(emp3.api.enums.UserInteractionKeyEventEnum.ALT);
                  break;
              }
            }
            mapCursorMoveEvent.keys = keys;
            // There is no button used during a mouse move. The value passed back is "mousemove"
            // This value does not correspond to a mouse button value.
            for (i = 0; i < callbacks.length; i += 1) {
              try {
                // Instead of instantiating an object of the emp3.api.events.MapCursorMoveEvent
                // class type, a generic object with relevant information is passed back to the client
                callbacks[i](mapCursorMoveEvent);
              }
              catch (e) {
                console.error("Event callback generated an exception. " + e.message);
              }
            }
          }
        }
      }
    };

    this.handleMapClick = function(sender, msg) {
      var keys,
        clickType,
        event,
        payload,
        callbacks,
        i;

      // First make sure there is a payload
      if (msg !== undefined && msg !== null) {
        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;
        keys = [];
        for (i in payload.keys) {
          switch (payload.keys[i]) {
            case "ctrl":
              keys.push(emp3.api.enums.UserInteractionKeyEventEnum.CTRL);
              break;
            case "shift":
              keys.push(emp3.api.enums.UserInteractionKeyEventEnum.SHIFT);
              break;
            case "alt":
              keys.push(emp3.api.enums.UserInteractionKeyEventEnum.ALT);
              break;
          }
        }
        switch (payload.type) {
          case "single":
            clickType = emp3.api.enums.UserInteractionEventEnum.CLICKED;
            break;
          case "double":
            clickType = emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED;
            break;
          case "mouseDown":
            clickType = emp3.api.enums.UserInteractionEventEnum.MOUSE_DOWN;
            break;
          case "mouseUp":
            clickType = emp3.api.enums.UserInteractionEventEnum.MOUSE_UP;
            break;
          case "drag":
            clickType = emp3.api.enums.UserInteractionEventEnum.DRAG;
            break;
          case "dragComplete":
            clickType = emp3.api.enums.UserInteractionEventEnum.DRAG_COMPLETE;
            break;
          default:
            clickType = payload.type;
            break;
        }
        switch (payload.button) {
          case "left":
            payload.button = emp3.api.enums.UserInteractionMouseButtonEventEnum.LEFT;
            break;
          case "right":
            payload.button = emp3.api.enums.UserInteractionMouseButtonEventEnum.RIGHT;
            break;
          case "middle":
            payload.button = emp3.api.enums.UserInteractionMouseButtonEventEnum.MIDDLE;
            break;
          default:
          // do nothing
        }
        if (sender.id && this.eventListeners[sender.id]) {
          callbacks = this.eventListeners[sender.id][emp3.api.enums.EventType.MAP_INTERACTION];
          event = new emp3.api.events.MapUserInteractionEvent({
            event: clickType,
            target: mapHash.getItem(sender.id),
            point: {
              x: payload.clientX,
              y: payload.clientY
            },
            position: new emp3.api.GeoPosition({
              latitude: payload.lat,
              longitude: payload.lon,
              altitude: payload.alt
            }),
            button: payload.button,
            keys: keys
          });
          // If we have any callbacks to call loop through them and call them.
          if (callbacks) {
            for (i = 0; i < callbacks.length; i += 1) {
              try {
                callbacks[i](event);
              }
              catch (e) {
                console.error("Event callback generated an exception. " + e.message);
              }
            }
          }
        }
      }
      else {
        throw new Error(missingMessageError);
      }
    };

    this.handleFeatureClick = function(sender, msg) {
      var event,
        keys,
        clickType,
        payload,
        features = [],
        feature,
        callbacks,
        i;

      // First make sure there is a payload
      if (msg !== undefined && msg !== null) {
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;
        keys = [];
        for (i in payload.keys) {
          switch (payload.keys[i]) {
            case "ctrl":
              keys.push(emp3.api.enums.UserInteractionKeyEventEnum.CTRL);
              break;
            case "shift":
              keys.push(emp3.api.enums.UserInteractionKeyEventEnum.SHIFT);
              break;
            case "alt":
              keys.push(emp3.api.enums.UserInteractionKeyEventEnum.ALT);
              break;
          }
        }
        switch (payload.type) {
          case "single":
            clickType = emp3.api.enums.UserInteractionEventEnum.CLICKED;
            break;
          case "double":
            clickType = emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED;
            break;
          case "mouseDown":
            clickType = emp3.api.enums.UserInteractionEventEnum.MOUSE_DOWN;
            break;
          case "mouseUp":
            clickType = emp3.api.enums.UserInteractionEventEnum.MOUSE_UP;
            break;
          case "drag":
            clickType = emp3.api.enums.UserInteractionEventEnum.DRAG;
            break;
          case "dragComplete":
            clickType = emp3.api.enums.UserInteractionEventEnum.DRAG_COMPLETE;
            break;
          default:
            clickType = payload.type;
            break;
        }
        switch (payload.button) {
          case "left":
            payload.button = emp3.api.enums.UserInteractionMouseButtonEventEnum.LEFT;
            break;
          case "right":
            payload.button = emp3.api.enums.UserInteractionMouseButtonEventEnum.RIGHT;
            break;
          case "middle":
            payload.button = emp3.api.enums.UserInteractionMouseButtonEventEnum.MIDDLE;
            break;
          default:
            payload.button = payload.button;
            break;
        }
        // If there is an event listener for this feature find the feature callbacks
        // and call them.
        if (sender.id && this.eventListeners[sender.id]) {
          callbacks = this.eventListeners[sender.id][emp3.api.enums.EventType.FEATURE_INTERACTION];
          // If there are callbacks to call, create the feature click
          // event; otherwise, don't bother.
          if (callbacks) {
            // check to make sure we are not getting an array back.
            if (Object.prototype.toString.call(payload) === "[object Array]") {
              for (i = 0; i < payload.length; i += 1) {

                feature = emp3.api.buildFeature({
                  type: payload[i].format,
                  geoId: payload[i].featureId,
                  name: payload[i].name,
                  coordinates: emp3.api.convertGeoJsonToCMAPIPositions(payload[i].feature),
                  properties: payload[i].properties,
                  symbolCode: payload[i].feature.symbolCode
                });

                features.push(feature);
              }
            }
            else {
              feature = emp3.api.buildFeature({
                type: payload.format,
                geoId: payload.featureId,
                name: payload.name,
                coordinates: emp3.api.convertGeoJsonToCMAPIPositions(payload.feature),
                properties: payload.properties,
                symbolCode: payload.feature.symbolCode
              });

              features.push(feature);
            }

            event = new emp3.api.events.FeatureUserInteractionEvent({
              event: clickType,
              target: features,
              point: {
                x: payload.clientX,
                y: payload.clientY
              },
              position: new emp3.api.GeoPosition({
                latitude: payload.lat,
                longitude: payload.lon,
                altitude: payload.alt
              }),
              map: mapHash.getItem(sender.id),
              button: payload.button,
              keys: keys
            });
            for (i = 0; i < callbacks.length; i += 1) {
              try {
                callbacks[i](event);
              }
              catch (e) {
                console.error("Event callback generated an exception. " + e.message);
              }
            }
          }
        }
      }
      else {
        throw new Error(missingMessageError);
      }
    };

    this.handleConvertResponse = function(sender, msg) {
      var callbacks;

      // First make sure there is a payload
      if (msg) {
        var payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        // find message id in lookup table.
        callbacks = this.messageCallbackHash.getItem(msg.messageId);

        // Check to make sure a callback has been found.
        if (callbacks) {

          try {
            callbacks.onSuccess({
              x: payload.x,
              y: payload.y
            });
          }
          catch (e) {
            console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
          }
        }
      }
    };

    this.handleDrawEditTransactionComplete = function(callbacks, payload, failures) {
      // The only time we should get here on a transaction complete for an edit
      // or draw, is if this is an error or cancel.  There is no onSuccess for edits
      // or draws.
      // If we get a transaction complete, but there is a failure;
      // Check the failure.  If there is only one and the level is 0,
      // It was an actual cancel that occurred
      if (failures && failures.length > 0) {
        // If we have a cancel, it will be one and only one error, with a level of 0.
        // Don't do anything if the edit was cancelled
        if (payload.status !== emp3.api.enums.messageCompletionStatus.CANCELLED) {
          callbacks.onError({
            callInfo: callbacks.callInfo,
            source: callbacks.source,
            args: callbacks.args,
            errorMessage: failures[0].message
          });
        }
      }
    };
    /**
     * The transaction complete handler for centering on a location.  Will call the callbacks
     * associated with the calling function.  Since the centerOnLocation is used for multiple
     * APIs, we need to route to the the correct handler, formatting the onSuccess
     * args for the original caller.
     *
     * @param {Object} callbacks Contains information about the calling method,
     * its, arguments, and the callbacks assigned to it.
     * @param {Object} details Contains the response from the map for the calling
     * method.
     */
    this.handleCenterOnLocationTransactionComplete = function(callbacks, details) {
      try {

        // Determine who originally called the center on view.
        if (callbacks.callInfo.method === "Map.setCamera") {

          // If the original call was Map.setCamera, return
          // a Camera object back to the calling method.
          callbacks.onSuccess({
            camera: new emp3.api.Camera({
              geoId: callbacks.callInfo.args.camera.geoId,
              name: callbacks.callInfo.args.camera.name,
              latitude: details.center.lat,
              longitude: details.center.lon,
              altitude: details.range,
              tilt: details.tilt,
              roll: details.roll,
              heading: details.heading
            })
          });
        }
      }
      catch (e) {
        console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
      }
    };

    this.handleCenterOnFeatureTransactionComplete = function(callbacks, details) {
      try {
        callbacks.onSuccess({
          centerLat: details.center.lat,
          centerLon: details.center.lon,
          north: details.bounds.northEast.lat,
          east: details.bounds.northEast.lon,
          south: details.bounds.southWest.lat,
          west: details.bounds.southWest.lon,
          range: details.range
        });
      }
      catch (e) {
        console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
      }
    };

    this.handleCenterOnBoundsTransactionComplete = function(callbacks, details) {
      try {
        callbacks.onSuccess({
          centerLat: details.center.lat,
          centerLon: details.center.lon,
          north: details.bounds.northEast.lat,
          east: details.bounds.northEast.lon,
          south: details.bounds.southWest.lat,
          west: details.bounds.southWest.lon,
          range: details.range
        });
      }
      catch (e) {
        console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
      }
    };

    this.handleLookAtLocationTransactionComplete = function(callbacks, details) {
      try {
        callbacks.onSuccess({
          latitude: details.latitude,
          longitude: details.longitude,
          altitude: details.altitude,
          altitudeMode: details.altitudeMode,
          range: details.range,
          tilt: details.tilt,
          heading: details.heading
        });
      }
      catch (e) {
        console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
      }
    };

    this.handleZoomTransactionComplete = function(callbacks, details) {
      try {
        callbacks.onSuccess({
          centerLat: details.center.lat,
          centerLon: details.center.lon,
          north: details.bounds.northEast.lat,
          east: details.bounds.northEast.lon,
          south: details.bounds.southWest.lat,
          west: details.bounds.southWest.lon,
          range: details.range
        });
      }
      catch (e) {
        console.error("onSuccess function generated an exception." + "\n  name:" + e.name + "\n  message:" + e.message + "\n  stack:" + e.stack);
      }
    };

    /**
     * This method is a direct call to the map engine. It is not asynchronous.
     *
     * @param {CallInfo} callInfo
     * @param {object} message
     * @returns {*}
     */
    this.convert = function(callInfo, message) {
      return emp.environment.browser.mediator.publishSynch({
        mapId: callInfo.mapId,
        message: message
      });
    };

    this.overlayClusterActivate = function(callInfo, message, transactionId) {
      var payload;

      if (callInfo.method === "Overlay.clusterActivate") {
        payload = {
          overlayId: callInfo.args.overlay.id,
          messageId: transactionId
        };
      }

      this.validate(emp3.api.enums.channel.overlayClusterActivate, payload);
    };

    this.overlayClusterDeactivate = function(callInfo, message, transactionId) {
      var payload;

      if (callInfo.method === "Overlay.clusterDeactivate") {
        payload = {
          overlayId: callInfo.args.overlay.id,
          messageId: transactionId
        };
      }

      this.validate(emp3.api.enums.channel.overlayClusterDeactivate, payload);
    };

    this.overlayClusterRemove = function(callInfo, message, transactionId) {
      var payload;

      if (callInfo.method === "Overlay.clusterRemove") {
        payload = {
          overlayId: callInfo.args.overlay.id,
          messageId: transactionId
        };
      }

      this.validate(emp3.api.enums.channel.overlayClusterRemove, payload);
    };


    /**
     * Sends an edit message to the map.  This puts the map
     * in edit mode.  The user will be able to modify the vertices of
     * the graphic.
     */
    this.featureEdit = function(callInfo, message, transactionId) {
      var payload;

      payload = {
        featureId: message.feature.geoId,
        messageId: transactionId
      };

      this.validate(emp3.api.enums.channel.featureEdit, payload, callInfo);

      return new emp3.api.Transaction({
        id: transactionId,
        mapId: callInfo.mapId,
        geoId: message.feature.geoId
      });
    };

    this.hideFeature = function(callInfo, message, transactionId) {
      var payload,
        i;

      payload = [];

      for (i = 0; i < message.features.length; i += 1) {
        payload.push({
          featureId: message.features[i],
          overlayId: message.parent || emp.constant.parentIds.ALL_PARENTS,
          messageId: transactionId
        });
      }

      this.validate(emp3.api.enums.channel.hideFeature, payload, callInfo);

    };

    this.showFeature = function(callInfo, message, transactionId) {
      var payload,
        i;

      payload = [];

      for (i = 0; i < message.features.length; i += 1) {
        payload.push({
          featureId: message.features[i],
          overlayId: message.parent || emp.constant.parentIds.ALL_PARENTS,
          messageId: transactionId
        });
      }

      this.validate(emp3.api.enums.channel.showFeature, payload, callInfo);
    };

    this.statusRequest = function(callInfo, transaction, transactionId) {
      var payload;

      switch (transaction.callInfo.method) {

        case "Map.getScreenshot":
          payload = {
            types: ["screenshot"],
            messageId: transactionId
          };
          this.statusRequestPendingList.screenshot.push(transaction);
          break;
      }

      this.validate(emp3.api.enums.channel.statusRequest, payload, callInfo);
    };

    /**
     *
     * @param {string} mapId
     * @param {string} featureId GeoId of the feature
     * @returns {boolean}
     */
    this.isSelected = function(mapId, featureId) {
      var selected = false;

      if (selectionHash[mapId]) {
        if (selectionHash[mapId][featureId]) {
          selected = true;
        }
      }

      return selected;
    };

    /**
     *
     * @param mapId
     * @returns {emp3.api.Feature[]}
     */
    this.getSelected = function(mapId) {
      var featureId,
        selected = [];
      if (selectionHash[mapId]) {
        for (featureId in selectionHash[mapId]) {
          selected.push(selectionHash[mapId][featureId]);
        }
      }

      return selected;
    };


    /**
     * Retrieves the requested data for the API using the map.get channel.
     *
     * @private
     * @param  {object} message       The message to send
     * @param  {string} transactionId The id of the transaction created for this message.
     */
    this.get = function(callInfo, message, transactionId) {
      var payload;

      payload = {
        types: message.types,
        recursive: message.recursive,
        select: message.select,
        filter: message.filter,
        messageId: transactionId
      };

      this.validate(emp3.api.enums.channel.get, payload, callInfo);
    };

    /**
     * Keep tracks of the items that are selected.  Called when a selection
     * transaction complete occurs.  Stores selected items
     * in a selectionHash maintained by the MessageHandler.  Each mapId
     * contains a separate list of selected items.
     *
     * @param {object} sender - Contains the CMAPI sender object.
     * @param {string} sender.id - the id of the map that sent the selection
     * transaction complete.
     * @param {object} msg - the transaction complete response
     * @param {object} msg.details - contains the successes and errors
     * of the transaction complete response.
     * @param {emp3.api.Feature[]} msg.detail.features - contains the features
     * that were selected on this map.
     */
    this.manageSelection = function(sender, msg) {
      var mapId,
        payload,
        featureId,
        feature;

      if (sender && sender.id && msg) {

        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        // retrieve the map id that sent this message.
        mapId = sender.id;

        // Check to see if we have an instance of the map in our selectionHash
        // If not create an entry
        if (!selectionHash[mapId]) {
          selectionHash[mapId] = [];
        }

        for (var i = 0, len = payload.details.features.length; i < len; i++) {
          featureId = payload.details.features[i].featureId;
          feature = emp3.api.buildFeature({
            type: payload.details.features[i].properties.featureType,
            geoId: payload.details.features[i].featureId,
            name: payload.details.features[i].name,
            coordinates: emp3.api.convertGeoJsonToCMAPIPositions(payload.details.features[i].feature),
            properties: payload.details.features[i].properties,
            symbolCode: payload.details.features[i].symbolCode
          });


          if (featureId && feature) {
            if (!selectionHash[mapId][featureId]) {
              selectionHash[mapId][featureId] = feature;
            }
          }
        }
      }
    };

    /**
     * Keep tracks of the items that are deselected.  Fires off of
     * a transaction complete message.  Removes selected items
     * from a selectionHash maintained by the MessageHandler.  Each mapId
     * contains a separate list of selected items.
     *
     * @param {object} sender - Contains the CMAPI sender object.
     * @param {string} sender.id - the id of the map that sent the selection
     * transaction complete.
     * @param {object} msg - the transaction complete response
     * @param {object} msg.details - contains the successes and errors
     * of the transaction complete response.
     * @param {emp3.api.Feature[]} msg.detail.features - contains the features
     * that were deselected on this map.
     */
    this.manageDeselection = function(sender, msg) {
      var mapId,
        payload,
        featureIds = [];

      if (sender && sender.id && msg) {

        // make sure the the payload is an object.
        payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

        // retrieve the map id that sent this message.
        mapId = sender.id;

        if (payload.details && payload.details.features) {

          for (var i = 0, len = payload.details.features.length; i < len; i++) {
            featureIds.push(payload.details.features[i].featureId);
          }

          this.removeSelection(mapId, featureIds);
        }
      }
    };

    /**
     * Removes features from the selection Hash.  This is separated out
     * so other methods can remove items.
     *
     * @param {String} mapId the id of the map the item is on.
     * @param {String} featureIds An array of featuresIds of items to remove.
     */
    this.removeSelection = function(mapId, featureIds) {
      var featureId,
        features;

      // Check to see if we have an instance of the map in our selectionHash
      // if we do, check each deselected item and remove from the hash.
      if (selectionHash[mapId]) {
        for (var i = 0, len = featureIds.length; i < len; i++) {
          featureId = featureIds[i];
          features = selectionHash[mapId];

          // Delete the item from the hash if it's here.
          if (features[featureId]) {
            delete features[featureId];
          }
        }
      }
    };

    /**
     * Adds a series of callbacks to perform on an overlay if a draw occurs on the map.
     *
     * @param {Object} args  Parameters are provided as members of the arg object.
     * @param {String} args.overlayId The id of the overlay we are listening to for draws.  If a draw is done on a different
     * overlay, it will not call the callback functions.
     * @param {StartDrawCallback} [args.startDrawCallback] The callback function to be executed if a drawing starts
     * @param {DrawCallback} [args.drawCallback] The callback function to be executed when a drawing has started
     * @param {CompleteDrawCallback} [args.completeDrawCallback] The callback function to be executed if a drawing is finished
     * @param {CancelDrawCallback} [args.cancelDrawCallback] The callback function to be executed if a drawing is cancelled
     * @param {onErrorCallback} [args.errorDrawCallback] The callback function to be executed if an error has occurred in edit
     */
    this.setDrawCallbackHash = function(args) {

      // If a drawCallback listener was already added for this overlay, overwrite it.
      // The way we defined the API would not allow us to remove a particular draw
      // listener, so we are just moving towards one draw listener per overlay.
      drawListenerCallbackHash.setItem(args.overlayId, {
        startDrawCallback: args.startDrawCallback,
        drawCallback: args.drawCallback,
        completeDrawCallback: args.completeDrawCallback,
        cancelDrawCallback: args.cancelDrawCallback,
        errorDrawCallback: args.errorDrawCallback
      });
    };

    /**
     * Completely clear the map of all layers, features, and overlays.
     * @private
     */
    this.clearMap = function(callInfo, message, transactionId) {
      var payload;

      payload = {
        messageId: transactionId
      };
      this.validate(emp3.api.enums.channel.updateFeature, payload, callInfo);
    };

    this.clearFeatures = function(callInfo, message, transactionId) {
      var payload;

      payload = {
        overlayId: message.overlay.geoId,
        messageId: transactionId
      };

      this.validate(emp3.api.enums.channel.clearFeatures, payload, callInfo);
    };

    /**
     * Synchronous call to see whether or not a container has any children
     * @param {emp3.api.Map|emp3.api.Overlay|emp3.api.Feature} container
     * @returns boolean
     */
    this.hasChildren = function(container) {
      if (!container || !container.geoId) {
        return false;
      }

      var publishData = {
        message: {
          cmd: 'Container.hasChildren',
          container: container
        }
      };

      var rc = environment.pubSub.publishSync(publishData);
      return rc.hasChildren;
    };

    /**
     * Locks or unlocks map view synchronously
     *
     * @param {object} callInfo
     * @param {object} message
     */
    this.lockView = function(callInfo, message) {
      return emp.environment.browser.mediator.publishSynch({
        mapId: callInfo.mapId,
        message: message
      });
    };


    /**
     * Stores updates and sends them out only if other updates don't come
     * in within a certain interval.
     * @param {emp3.api.Feature} feature
     */
    this.update = function(feature) {

      var payload;
      var that;

      var convertedFeature = emp3.api.convertFeatureToGeoJSON(feature);
      var properties = emp3.api.getProperties(feature);
      var timeElapsedSinceLastUpdate = Date.now() - updateTime;

      payload = {
        overlayId: emp.constant.parentIds.ALL_PARENTS,
        featureId: feature.geoId,
        format: feature.featureType,
        feature: convertedFeature,
        name: feature.name,
        readOnly: feature.readOnly,
        properties: properties
      };

      updates.push(payload);


      if (updateTimer && timeElapsedSinceLastUpdate < 100 && updates.length < 500) {
        clearTimeout(updateTimer);
      }

      // If we have 500 updates or we have had an update in 50 ms then
      // send the updates in one shot.
      updateTime = Date.now();
      that = this;
      updateTimer = setTimeout(function() {
        that.validate(emp3.api.enums.channel.plotFeature, updates, {});
        updates = [];
      }, 50);

    };

    /**
     * Called when features are added to a map instance.  Will be called once
     * for each map instance the newly added feature is on.
     *
     * @param {object} sender contains the id of the map that the event
     * occurred on.
     *
     * @param msg
     */
    this.handleFeatureAdd = function(sender, msg) {
      this.handleFeatureEvent(emp3.api.enums.EventType.MAP_FEATURE_ADDED, sender, msg);
    };

    /**
     * Called when features are updated on a map instance.  Will be called once
     * for each map instance the feature is updated on.
     *
     * @param {object} sender contains the id of the map that the event
     * occurred on.
     */
    this.handleFeatureUpdate = function(sender, msg) {
      this.handleFeatureEvent(emp3.api.enums.EventType.MAP_FEATURE_UPDATED, sender, msg);
    };

    /**
     * Called when features are removed from a map instance.  Will be called once
     * for each map instance the newly added feature is on.
     *
     * @param {object} sender contains the id of the map that the event
     * occurred on.
     * @param {object} msg
     */
    this.handleFeatureRemove = function(sender, msg) {
      this.handleFeatureEvent(emp3.api.enums.EventType.MAP_FEATURE_REMOVED, sender, msg);
    };

    /**
     * Creates events and calls the callbacks associated to those events
     * for feature added, feature removed and feature updated events.
     *
     * @param {emp3.api.enums.EventType} eventType should be
     * MAP_FEATURE_REMOVED, MAP_FEATURE_ADDED, or MAP_FEATURE_UPDATED.
     * @param {object} sender An object containing the map instance id that raised the event.
     * @param {object} msg cmapi2 temp holder for a feature event message.
     * Made up until cmapi2 comes out.
     */
    this.handleFeatureEvent = function(eventType, sender, msg) {
      var payload,
        cmapiFeature,
        feature,
        features = [],
        featureIds = [],
        callbacks,
        i,
        len,
        myevent;

      // First make sure there is a payload
      if (msg === undefined || msg === null) {
        throw new Error(missingMessageError);
      }

      // If there is an event listener for this map updated event,
      // then do the logic.  We don't want to waste cycles convertLocationArrayToString
      // cmapi messages to feature messages.
      if (sender.id && this.eventListeners[sender.id]) {
        callbacks = this.eventListeners[sender.id][eventType];
        if (callbacks) {

          // make sure the the payload is an object.
          payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

          // convert cmapi messages to Feature objects.
          if (payload.features) {
            for (i = 0, len = payload.features.length; i < len; i++) {
              cmapiFeature = payload.features[i];
              if (cmapiFeature.properties && cmapiFeature.properties.featureType) {
                feature = {
                  type: cmapiFeature.properties.featureType,
                  geoId: cmapiFeature.featureId,
                  name: cmapiFeature.name,
                  properties: cmapiFeature.properties,
                  symbolCode: cmapiFeature.symbolCode
                };
                switch (feature.type) {
                  case emp3.api.enums.FeatureTypeEnum.KML:
                    feature.KMLString = cmapiFeature.feature;
                    break;
                  default:
                    feature.coordinates = emp3.api.convertGeoJsonToCMAPIPositions(cmapiFeature.feature);
                    break;
                }
                feature = emp3.api.buildFeature(feature);
                if (feature) {
                  features.push(feature);
                  featureIds.push(feature.geoId);
                }
              }
            }
          }

          if (eventType === emp3.api.enums.EventType.MAP_FEATURE_REMOVED) {
            // if an item is being removed from map, we also need to
            // update the selection hash.
            this.removeSelection(sender.id, featureIds);
          }

          // For each callback subscribed, create a new MapFeatureAddedEvent.
          for (i = 0, len = callbacks.length; i < len; i++) {

            switch (eventType) {
              case emp3.api.enums.EventType.MAP_FEATURE_REMOVED:
                myevent = new emp3.api.events.MapFeatureRemovedEvent({
                  target: mapHash.getItem(sender.id),
                  features: features
                });

                break;
              case emp3.api.enums.EventType.MAP_FEATURE_ADDED:
                myevent = new emp3.api.events.MapFeatureAddedEvent({
                  target: mapHash.getItem(sender.id),
                  features: features
                });
                break;
              case emp3.api.enums.EventType.MAP_FEATURE_UPDATED:
                myevent = new emp3.api.events.MapFeatureUpdatedEvent({
                  target: mapHash.getItem(sender.id),
                  features: features
                });
                break;
            }

            // always put a try around user callbacks so it doesn't
            // break map code.
            try {
              callbacks[i](myevent);
            }
            catch (e) {
              console.error("Event callback generated an exception. " + e.message);
            }
          }
        }
      }
    };

    this.handleFreehand = function(sender, msg) {
      var event,
        payload,
        callbacks,
        j,
        i,
        coordinateArray,
        geoPositions = [];

      // First make sure there is a payload
      if (msg === undefined || msg === null) {
        throw new Error(missingMessageError);
      }

      payload = typeof(msg) === "string" ? JSON.parse(msg) : msg;

      // If there is an event listener for the freehand line draw event,
      // then raise the event.
      if (sender.id && this.eventListeners[sender.id]) {
        callbacks = this.eventListeners[sender.id][emp3.api.enums.EventType.MAP_FREEHAND_DRAW_EVENT];
        if (callbacks) {
          for (i in callbacks) {

            // messages can come from two different places.  Entering and existing
            // freehand mode comes from transactionComplete channel.  If it is
            // transactionComplete we need to format the event slightly different.
            if (payload.details) {
              if (payload.originatingChannel === emp3.api.enums.channel.freehandDrawStart) {
                event = new emp3.api.events.MapFreehandEvent({
                  event: emp3.api.enums.MapFreehandEventEnum.MAP_ENTERED_FREEHAND_DRAW_MODE,
                  target: mapHash.items[sender.id]
                });
              }
              else if (payload.originatingChannel === emp3.api.enums.channel.freehandDrawExit) {
                event = new emp3.api.events.MapFreehandEvent({
                  event: emp3.api.enums.MapFreehandEventEnum.MAP_EXIT_FREEHAND_DRAW_MODE,
                  target: mapHash.items[sender.id]
                });
              }
            }
            else {
              coordinateArray = emp3.api.convertGeoJsonToCMAPIPositions(payload.feature);
              for (j in coordinateArray) {
                geoPositions.push(new emp3.api.GeoPosition({
                  latitude: coordinateArray[j].latitude,
                  longitude: coordinateArray[j].longitude,
                  altitude: coordinateArray[j].altitude
                }));
              }
              event = new emp3.api.events.MapFreehandEvent({
                event: payload.type,
                target: mapHash.items[sender.id],
                positionGroup: {
                  positions: geoPositions
                },
                style: payload.strokeStyle
              });
            }

            if (event) {
              try {
                callbacks[i](event);
              }
              catch (e) {
                console.error("Event callback generated an exception. " + e.message);
              }
            }
          }
        }
      }
    };

    // Subscribe to all the channels required to listen for
    // events and return calls.
    environment.init({
      initcallback: function(args) {
        if (args.success === true) {
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.transactionComplete,
            callback: that.handleTransactionComplete.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.messageProgress,
            callback: that.handleMessageProgress.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.statusView,
            callback: that.handleStatusView.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.statusAbout,
            callback: that.handleStatusAboutResponse.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.statusFormat,
            callback: that.handleStatusFormatResponse.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.statusScreenshot,
            callback: that.handleStatusScreenshot.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.statusSelected,
            callback: that.handleStatusSelected.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.statusInitialization,
            callback: that.handleMapStatus.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.clicked,
            callback: that.handleMapClick.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.freehandLineDraw,
            callback: that.handleFreehand.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.mouseup,
            callback: that.handleMapClick.bind(that)
          });
          /*
           environment.pubSub.subscribe({
           channel: emp3.api.enums.channel.mousemove,
           callback: that.handleMapCursorMove.bind(that)
           });
           */
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.mousedown,
            callback: that.handleMapClick.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.drag,
            callback: that.handleMapClick.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.dragComplete,
            callback: that.handleMapClick.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.featureDrag,
            callback: that.handleFeatureClick.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.featureDragComplete,
            callback: that.handleFeatureClick.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.featureClicked,
            callback: that.handleFeatureClick.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.featureMouseDown,
            callback: that.handleFeatureClick.bind(that)
          });
          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.featureMouseUp,
            callback: that.handleFeatureClick.bind(that)
          });

          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.convertResponse,
            callback: that.handleConvertResponse.bind(that)
          });

          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.featureAddEvent,
            callback: that.handleFeatureAdd.bind(that)
          });

          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.featureRemoveEvent,
            callback: that.handleFeatureRemove.bind(that)
          });

          environment.pubSub.subscribe({
            channel: emp3.api.enums.channel.featureUpdateEvent,
            callback: that.handleFeatureUpdate.bind(that)
          });

          that.isEnvironmentReady = true;
        }
        else {
          if (console) {
            console.error("An error occurred while initializing the " + environment.name + " environment for the CPCE Map API and will not be able to communicate with the map.");
          }
        }
      }
    });

  } // PrivateConstructor

  /////////////////////////////////////////////////////////////////////////////
  // Exposes the getInstance method ///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  return {
    /**
     * @memberof emp3.api.MessageHandler
     * Destroys the instance
     */
    destroyInstance: function() {
      instance = null;
    },
    /**
     * Method to get the singleton implementation of this class.
     * @memberof emp3.api.MessageHandler
     *
     * @example
     * var mh = emp3.api.MessageHandler.getInstance();
     *
     * @param {object} [args]
     * @param {object} [args.spawnWidget] The name of the widget being spawned.
     * @returns {emp3.api.MessageHandler}
     */
    getInstance: function(args) {
      if (instance === null) {
        instance = new PrivateConstructor(args);
        instance.constructor = null;
      }

      return instance;
    }
  };

})();
