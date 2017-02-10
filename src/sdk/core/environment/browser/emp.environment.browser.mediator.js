/*global emp */

/**
 * @ignore
 */

/**
 * @class
 */
emp.environment.browser.mediator = (function() {
  var listeners = new emp.utilities.Hash();
  var publicInterface = {

    /**
     * @method
     * @public
     * @memberOf emp.transactionQueue.listener
     * @see emp.intents.control enumeration for a list of the intents types you can register for
     * @param {object} listenerInfo
     */
    subscribe: function(listenerInfo) {
      if (listeners.getItem(listenerInfo.channel) !== null && listeners.getItem(listenerInfo.channel) !== undefined) {
        listeners.getItem(listenerInfo.channel).push({
          callback: listenerInfo.callback,
          senderId: listenerInfo.senderId
        });
      } else {
        var callbacks = [];
        callbacks.push({callback: listenerInfo.callback, senderId: listenerInfo.senderId});
        listeners.setItem(listenerInfo.channel, callbacks);
      }
    },
    /**
     * @method
     * @public
     * @memberOf emp.transactionQueue.listener
     * @param  {object} listenerInfo
     * @return {boolean}
     */
    unsubscribe: function(listenerInfo) {
      var callbackArray,
        len,
        i;

      if (listeners.getItem(listenerInfo.channel) !== null && listeners.getItem(listenerInfo.channel) !== undefined) {
        callbackArray = listeners.getItem(listenerInfo.channel);
        len = callbackArray.length;

        for (i = 0; i < len; i += 1) {
          if (callbackArray[i].callback === listenerInfo.callback) {
            callbackArray.splice(i, 1);
            return true;
          }
        }
      }
      return false;
    },
    /**
     *
     * @param {object} message
     * @param {string} message.channel
     * @param {object|string} message.message
     * @param {object} [message.dest]
     * @param {string} [message.dest.id]
     * @param {object} message.sender
     * @param {string} message.sender.id
     * @param {function} message.sender.forwardMsg
     * @returns {{success: boolean, message: string}}
     */
    publish: function(message) {
      var callbacks = listeners.getItem(message.channel),
        len,
        i,
        errorMessages = [],
        success = {
          success: false,
          message: "An unanticipated error has occurred in emp.environment.browser.mediator.dispatch"
        };

      try {
        if (typeof(message.message) === "string") {
          message.message = JSON.parse(message.message);
        }

        if (callbacks !== null && callbacks !== undefined) {
          len = callbacks.length;
          for (i = 0; i < len; i += 1) {
            if (callbacks[i] !== null) {
              try {
                if (message.hasOwnProperty("dest") &&
                  (message.dest !== null) &&
                  (message.dest !== "") && !emp.helpers.isEmptyString(message.dest.id)) {
                  if (message.dest.id === callbacks[i].senderId) {
                    try {
                      callbacks[i].callback(message.sender, message.message, message.channel);
                    } catch (err) {
                      emp.errorHandler.log({
                        level: emp.typeLibrary.Error.level.MINOR,
                        jsError: err,
                        message: "An error occurred in emp.environment.browser.mediator.js"
                      });
                      errorMessages.push(err.message);
                    }
                  }
                } else if (emp.helpers.isEmptyString(callbacks[i].senderId)) {
                  try {
                    callbacks[i].callback(message.sender, message.message, message.channel);
                  } catch (err) {
                    emp.errorHandler.log({
                      level: emp.typeLibrary.Error.level.MINOR,
                      jsError: err,
                      message: "An error occurred in emp.environment.browser.mediator.js"
                    });
                    errorMessages.push(err.message);
                  }
                }
              } catch (err) {
                emp.errorHandler.log({
                  level: emp.typeLibrary.Error.level.MINOR,
                  jsError: err,
                  message: "An error occurred in emp.environment.browser.mediator.js"
                });
                emp.typeLibrary.Error({
                  level: emp.typeLibrary.Error.level.INFO,
                  jsError: err,
                  message: "An error occurred in emp.transactionQueue.dispatch while attempting to invoke a callback function"
                });
              }
            }
          }
        }
      } catch (err2) {
        errorMessages.push(err2.message);

        emp.errorHandler.log({
          level: emp.typeLibrary.Error.level.MINOR,
          jsError: err2,
          message: "An error occurred in emp.transactionQueue.dispatch while attempting to invoke a callback function"
        });
        success = {
          success: false,
          message: err2.toString()
        };
      }
      if (errorMessages.length === 0) {
        success = {
          success: true
        };
      } else {
        success = {
          success: false,
          message: "An unanticipated error has occurred in emp.environment.browser.mediator.dispatch: " + JSON.stringify(errorMessages)
        };
      }
      return success;
    },

    /**
     * Method to call for all synchronous methods types.  Does not create a transaction
     * simply calls the engines directly.
     * @param {object} args
     * @param {string} args.mapId
     * @param {object} args.message
     * @param {object} args.message.conversionType
     * @param {object} args.message.cmd
     * @param {object} args.originalMessage
     */
    publishSynch: function(args) {

      var result,
        storageObject,
        engineTemplate,
        transaction,
        items = [];

      // get the correct map instance to call,
      engineTemplate = emp.instanceManager.getInstance(args.mapId);

      if (args.message) {

        // check the method to call
        switch (args.message.cmd) {
          case "Container.hasChildren":
            try {
              // Direct storage access, be very careful
              storageObject = emp.storage.get.id({id: args.message.container.geoId});
              if (!storageObject || !storageObject.options || !storageObject.options.childObjects) {
                result = {
                  success: true,
                  hasChildren: false
                };
              }

              for (var child in storageObject.options.childObjects) {
                if (storageObject.options.childObjects.hasOwnProperty(child)) {
                  result = {
                    success: true,
                    hasChildren: true
                  };
                  return result;
                }
              }

              result = {
                success: true,
                hasChildren: false
              };
            } catch (err) {
              result = {
                success: false,
                hasChildren: false,
                message: err.message
              };
            }

            break;
          case "map.convert":
            if (!engineTemplate) {
              break;
            }
            // Currently just kept using transactions.  This isn't the greatest way of doing this
            // but initially wrote this with transactions in an asynchronous manner using the
            // transactionQueue.  However, we needed it synchronous, so we kept the objects
            // that were being passed by the engines.  Keeping it this way will allow us
            // to be able to maybe implement sync and async version of the method in the future.


            // look at message and determine which conversion needs to be made.
            if (args.message.conversionType === "offsetPixelToDecimalDegrees") {
              // create a typelib object to be added to a transaction
              oItem = new emp.typeLibrary.Convert({
                y: args.message.y,
                x: args.message.x
              });
              // transactions take arrays of items, push it to an array.
              items.push(oItem);

              // We don't really need all this transaction info, but
              // just filling it in to be correct.

              transaction = new emp.typeLibrary.Transaction({
                intent: emp.intents.control.GET_LATLON_FROM_XY,
                mapInstanceId: args.mapId,
                transactionId: "",
                sender: "",
                source: emp.api.cmapi.SOURCE,
                originChannel: cmapi.channel.names.MAP_CONVERT,
                originalMessage: args.message,
                messageOriginator: "",
                originalMessageType: cmapi.channel.names.MAP_CONVERT,
                items: items
              });

              engineTemplate.engine.view.getLatLonFromXY(transaction);

              if (transaction.items[0].invalid) {
                result = null;
              } else {
                result = new emp3.api.GeoPosition({
                  latitude: transaction.items[0].lat,
                  longitude: transaction.items[0].lon
                });
              }

            } else if (args.message.conversionType === "decimalDegreesToOffsetPixel") {

              oItem = new emp.typeLibrary.Convert({
                lat: args.message.y,
                lon: args.message.x
              });

              items.push(oItem);

              // We don't really need all this transaction info, but
              // just filling it in to be correct.
              transaction = new emp.typeLibrary.Transaction({
                intent: emp.intents.control.GET_XY_FROM_LATLON,
                mapInstanceId: args.mapInstanceId,
                transactionId: "",
                sender: "",
                source: emp.api.cmapi.SOURCE,
                originChannel: cmapi.channel.names.MAP_CONVERT,
                originalMessage: args.originalMessage,
                messageOriginator: "",
                originalMessageType: cmapi.channel.names.MAP_CONVERT,
                items: items
              });

              engineTemplate.engine.view.getXYFromLatLon(transaction);

              if (transaction.items.length === 0 || transaction.items[0].invalid) {
                window.console.error(transaction.failures);
                result = null;
              } else {
                result = {
                  x: transaction.items[0].x,
                  y: transaction.items[0].y
                };
              }
            }
            break;
          case "map.view.lock":
            if (!engineTemplate) {
              break;
            }

            var oItem = new emp.typeLibrary.Lock({
              lock: args.message.lock
            });

            items.push(oItem);

            transaction = new emp.typeLibrary.Transaction({
              intent: emp.intents.control.VIEW_LOCK,
              mapInstanceId: args.mapInstanceId,
              transactionId: "",
              sender: "",
              source: emp.api.cmapi.SOURCE,
              originChannel: cmapi.channel.names.MAP_CONVERT,
              originalMessage: args.originalMessage,
              messageOriginator: "",
              originalMessageType: cmapi.channel.names.MAP_CONVERT,
              items: items
            });

            engineTemplate.engine.navigation.enable(transaction);
            break;
          default:
            // do nothing
            break;
        }

      }

      return result;
    }
  };

  return publicInterface;
}());
