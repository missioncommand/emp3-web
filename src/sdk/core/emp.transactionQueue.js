var emp = window.emp || {};

/**
 * Queue used to buffer the core application from locking the process thread with back to back transaction calls
 * @namespace
 * @memberof emp
 */
emp.transactionQueue = (function() {
  var mapInstanceData = function(args) {
    return {
      mapInstanceId: args.mapInstanceId,
      transQueue: [],
      running: false,
      pauseCnt: 1,
      bViewSetProcessed: false
    };
  };
  /**
   * Hash of transactions to process
   * @private
   */
  var transHash = {},
    outstandingTimer,
    outstandingTimeout = 5000,
    listeners = new emp.utilities.Hash(),
    oOutstandingTransaction = null,
    oMapInstanceData = {},
    oMapInstanceIdList = [];

  /**
   * @private
   */
  function outstandingTimerFunc() {
    // If this timeout expires the transaction took to long.
    // We post a warning if there is still an outstanding transaction.

    if (oOutstandingTransaction) {
      emp.typeLibrary.Error({
        level: emp.typeLibrary.Error.level.MINOR,
        message: "A " + oOutstandingTransaction.intent + " transaction with " +
        (oOutstandingTransaction.items.length + oOutstandingTransaction.failures.length) +
        " items has timed out. (timeout: " + (outstandingTimeout / 1000) + " sec)"
      });
      oOutstandingTransaction = null;
      outstandingTimer = null;
    }
  }

  /**
   *
   */
  function runQueue() {
    var transaction;
    var oInstanceData;
    //var bNotDone = true;
    //var iNextIndex = oMapInstanceListIndex;
    var iListSize = oMapInstanceIdList.length;
    var nextQueue;

    if ((iListSize > 0) && (oOutstandingTransaction === null)) {


      nextQueue = findQueueWithOldestTransaction();

      while (nextQueue) {

        oInstanceData = oMapInstanceData[nextQueue];

        if (oInstanceData &&
          (oInstanceData.running === true) &&
          (oInstanceData.transQueue.length > 0)) {

          // get the oldest item in the queue
          transaction = oInstanceData.transQueue.shift();
          // clean the id out of the transHash used for quick queue lookups
          delete transHash[transaction.transactionId];

          switch (transaction.intent) {
            case emp.intents.control.DRAW_BEGIN:
            case emp.intents.control.EDIT_BEGIN:
            case emp.intents.control.WMS_ADD:
              // Just let these transactions thru.
              break;
            default:
              oOutstandingTransaction = transaction;
              outstandingTimer = setTimeout(outstandingTimerFunc, outstandingTimeout);
              break;
          }

          if (transaction.intent === emp.intents.control.VIEW_SET) {
            oInstanceData.bViewSetProcessed = true;
          }

          // run the transaction
          transaction.run();
          //bNotDone = false;

        }
        nextQueue = findQueueWithOldestTransaction();
      }
    }

    // repeat with break in between code execution to avoid locking thread
    // with back to back calls in a loop
    setTimeout(runQueue, 10);
  }

  /**
   * Looks at the first item in each transaction queue of each map instance
   * and determines the next transaction to call.  If the queues are empty
   * then, the method will return undefined.
   *
   */
  function findQueueWithOldestTransaction() {
    var mapInstanceId,
      lowestTime,
      queueId,
      transaction,
      instanceData;

    // Get the first item in each map queue.
    // Find the one with the earliest creation time.
    for (mapInstanceId in oMapInstanceData) {

      // Look at this map instance's queue.
      instanceData = oMapInstanceData[mapInstanceId];

      // if the transaction queue is not empty, then pull the first transaction
      if (instanceData &&
        instanceData.running &&
        instanceData.transQueue.length > 0) {

        transaction = instanceData.transQueue[0];

        // check to make sure that transaction was pulled,
        // if the lowestTime has not been set yet, just pull that
        if (transaction && (!lowestTime || transaction.creationTime < lowestTime)) {

          lowestTime = transaction.creationTime;
          queueId = mapInstanceId;
        }
      }
    }


    return queueId;
  }

  /**
   *
   * @param transactionId
   * @returns {boolean}
   */
  function cancelTransaction(transactionId) {
    var transaction = transHash[transactionId],
      oInstanceData,
      success = false,
      i,
      len;

    // Look to see if the transaction is still sitting in the queue
    if (transaction) {
      oInstanceData = oMapInstanceData[transaction.mapInstanceId];
      len = oInstanceData.transQueue.length;

      for (i = 0; i < len; i++) {
        if (oInstanceData.transQueue[i].transactionId === transactionId) {
          // Remove the transaction for the queue
          oInstanceData.transQueue.splice(i, 1);
          // Remove the transaction from the hash
          delete transHash[transactionId];
          break;
        }
      }
    } else {
      // If transaction was not found in queue, look to see if it is in process
      // and a type that is cancelable
      transaction = publicInterface.processHash[transactionId];
      if (transaction) {
        var o;
        if (transaction.intent === emp.intents.control.DRAW_BEGIN) {
          o = new emp.typeLibrary.Transaction({
            transactionId: emp.helpers.id.newGUID(),
            mapInstanceId: transaction.mapInstanceId,
            intent: emp.intents.control.DRAW_CANCEL,
            source: transaction.source,
            originChannel: transaction.originChannel,
            items: [transaction.items[0]]
          });
          o.run();
          success = true;
        } else if (transaction.intent === emp.intents.control.EDIT_BEGIN) {
          o = new emp.typeLibrary.Transaction({
            transactionId: emp.helpers.id.newGUID(),
            intent: emp.intents.control.EDIT_CANCEL,
            mapInstanceId: transaction.mapInstanceId,
            source: transaction.source,
            originChannel: transaction.originChannel,
            items: [transaction.items[0]]
          });
          o.run();
          success = true;
        } else {
          emp.typeLibrary.Error({
            message: "The " + transaction.intent + " transaction with the id '" + transactionId + "' was found, and could not be cancelled."
          });
        }
      } else {
        emp.typeLibrary.Error({
          message: "No transaction with the id '" + transactionId + "' could be found.  The transaction could not be cancelled."
        });
      }
    }
    return success;
  }

  /**
   *
   * @param transactionId
   * @returns {boolean}
   */
  function endTransaction(transactionId) {
    var transaction = transHash[transactionId],
      oInstanceData,
      success = false,
      len;

    if (transaction) {
      oInstanceData = oMapInstanceData[transaction.mapInstanceId];
      len = oInstanceData.transQueue.length;

      for (var i = 0; i < len; i++) {
        if (oInstanceData.transQueue[i].transactionId === transactionId) {
          // Remove the transaction for the queue
          oInstanceData.transQueue.splice(i, 1);
          // Remove the transaction from the hash
          delete transHash[transactionId];
          break;
        }
      }
    } else {
      // If transaction was not found in queue, look to see if it is in process
      // and a type that is cancelable
      transaction = publicInterface.processHash[transactionId];
      if (transaction) {
        var o;
        if (transaction.intent === emp.intents.control.DRAW_BEGIN) {
          o = new emp.typeLibrary.Transaction({
            transactionId: emp.helpers.id.newGUID(),
            intent: emp.intents.control.DRAW_END,
            mapInstanceId: transaction.mapInstanceId,
            source: transaction.source,
            originChannel: transaction.originChannel,
            items: [transaction.items[0]]
          });
          o.run();
          success = true;
        } else if (transaction.intent === emp.intents.control.EDIT_BEGIN) {
          o = new emp.typeLibrary.Transaction({
            transactionId: emp.helpers.id.newGUID(),
            intent: emp.intents.control.EDIT_END,
            mapInstanceId: transaction.mapInstanceId,
            source: transaction.source,
            originChannel: transaction.originChannel,
            items: [transaction.items[0]]
          });
          o.run();
          success = true;
        } else {
          emp.typeLibrary.Error({
            message: "The " + transaction.intent + " transaction with the id '" + transactionId + "' was found, but can not be completed."
          });
        }
      } else {
        emp.typeLibrary.Error({
          message: "No transaction with the id '" + transactionId + "' could not be found.  The transaction could not be completed."
        });
      }
    }
    return success;
  }

  /**
   * @method
   * @private
   * @memberOf emp.transactionQueue
   * @param {object} event
   *
   */
  function dispatch(event) {
    // retrieve the array of callback functions registered for this event type.
    var instanceId = event.transaction.mapInstanceId;
    var callbacks = listeners.getItem(event.type + instanceId),
      len,
      i,
      success = {
        success: false,
        message: "An unanticipated error has occurred in emp.transactionQueue.dispatch"
      };

    try {
      if (callbacks !== null && callbacks !== undefined) {
        // We use a copy in case a callback unregisters itself.
        callbacks = callbacks.concat([]);

        len = callbacks.length;
        for (i = 0; i < len; i += 1) {
          if (callbacks[i] !== null) {
            try {
              callbacks[i](event.transaction);
            } catch (err) {
              emp.errorHandler.log(emp.typeLibrary.Error({
                level: emp.typeLibrary.Error.level.INFO,
                jsError: err,
                message: "An error occurred in emp.transactionQueue.dispatch while attempting to invoke a callback function"
              }));
            }
          }
        }
      }
    } catch (err2) {
      success = {
        success: false,
        message: err2.toString()
      };
    }
    return success;
  } // end dispatch

  /**
   * @private
   */
  var publicInterface = {
    /**
     * @memberof emp.transactionQueue
     * @method
     * @description This function return true if there is a transaction outstanding.
     * @param {String} mapInstanceId The map instance Id.
     * False otherwise.
     */
    isTransactionOutStanding: function(mapInstanceId) {
      var sTransID;

      for (sTransID in publicInterface.processHash) {
        if (publicInterface.processHash.hasOwnProperty(sTransID)) {
          if (publicInterface.processHash[sTransID].mapInstanceId === mapInstanceId) {
            return true;
          }
        }
      }

      return false;
    },
    /**
     * Add a transaction to the
     * @method
     * @memberof emp.transactionQueue
     */
    add: function(transaction) {
      var oInstanceData = oMapInstanceData[transaction.mapInstanceId];

      transaction.state = "queued";
      oInstanceData.transQueue.push(transaction);
      transHash[transaction.transactionId] = transaction;
    },

    /* eslint-disable no-console */
    /**
     * Prints the transaction queue to the console
     */
    print: function() {

      var mapInstanceId,
        oInstanceData,
        transactionQueueString,
        i;

      for (mapInstanceId in oMapInstanceData) {

        oInstanceData = oMapInstanceData[mapInstanceId];

        console.log("================ Map Instance: " + mapInstanceId + " ==================");
        transactionQueueString = "";

        for (i = 0; i < oInstanceData.transQueue.length; i += 1) {
          console.log("%s : %s - %s\n" , i, oInstanceData.transQueue[i].intent, oInstanceData.transQueue[i].transactionId);
        }

        console.log(transactionQueueString);
      }

    },
    /* eslint-enable no-console */

    /**
     * End or complete a transaction that is already in process
     * @method
     * @memberof emp.transactionQueue
     */
    end: function(transactionId) {
      return endTransaction(transactionId);
    },
    /**
     * Attempt to cancel a transaction.  If the transaction is in the queue it will be removed.
     * If the transaction is in process it will only be cancled if its a draw or an edit.
     * @method
     * @memberof emp.transactionQueue
     */
    cancel: function(transactionId) {
      return cancelTransaction(transactionId);
    },
    /**
     * function invoked at the end of each transaction intent to make the Transaction available to API and UI via emp.transactionQueue.listener
     * @private
     */
    _complete: function(transaction) {

      transaction.returnDuplicatesToItems();

      // Do not let pointer / mouse move events get dispatched over the TRANSACTION_COMPLETE
      // as they fire too rapidly and should only be subscribed to directly
      // Below is the catch all way to get transactions without having to subscribe to individual types
      if ((transaction.intent !== emp.intents.control.POINTER) &&
        transaction.intent !== emp.intents.control.STATIC_CONTENT) {
        dispatch({
          type: emp.intents.control.TRANSACTION_COMPLETE,
          transaction: transaction
        });
      }
      // This will only invoke callbacks for the specific intent
      dispatch({
        type: transaction.intent,
        transaction: transaction
      });
      // Moved this to the transaction runner after all the exits..
      // Remove the transaction for ht ein process hash
      //delete publicInterface.processHash[transaction.transactionId];

      if ((oOutstandingTransaction !== null) &&
        (transaction.transactionId === oOutstandingTransaction.transactionId)) {
        if (outstandingTimer) {
          clearTimeout(outstandingTimer);
          outstandingTimer = null;
        }
        // If this is the transaction we are waiting for set it to null so the queue run the next one.
        oOutstandingTransaction = null;
      }
    },
    /**
     * function invoked during the processing of a long running transaction intent (such as draw or edit) to make the Transaction available to API and UI via emp.transactionQueue.listener
     * @private
     */
    _progress: function(transaction) {
      // Do not let pointer / mouse move events get dispatched over the TRANSACTION_PROGRESS
      // as they fire too rapidly and should only be subscribed to directly and SHOULD NOT go over API handlers (too much traffic)
      // Below is the catch all way to get transactions without having to subscribe to individual types
      if (transaction.intent !== emp.intents.control.POINTER) {
        dispatch({
          type: emp.intents.control.TRANSACTION_PROGRESS,
          transaction: transaction
        });
      }
      // This will only invoke callbacks for the specific intent
      dispatch({
        type: transaction.intent,
        transaction: transaction
      });
    },
    /**
     * function invoked for transactions with unknown intents.  This can be used for UI components to pass around events without impacting core
     * @private
     */
    _custom: function(transaction) {

      transaction.returnDuplicatesToItems();
      // This will only invoke callbacks for the specific intent
      dispatch({
        type: transaction.intent,
        transaction: transaction
      });

      // Moved this to the transaction runner after all the exits..
      // Remove the transaction for ht ein process hash
      // delete publicInterface.processHash[transaction.transactionId];
      if ((oOutstandingTransaction !== null) &&
        (transaction.transactionId === oOutstandingTransaction.transactionId)) {
        // If this is the transaction we are waiting for set it to null so the queue run the next one.
        oOutstandingTransaction = null;
        if (outstandingTimer) {
          clearTimeout(outstandingTimer);
          outstandingTimer = null;
        }
      }
    },
    /**
     * Used to pause the queue for operations such as a map engine swap
     * @private
     */
    pause: function(mapInstanceId) {
      var oInstanceData = oMapInstanceData[mapInstanceId];

      if (oInstanceData) {
        oInstanceData.running = false;
        oInstanceData.pauseCnt++;
      }
    },
    /**
     * Used to run the queue once the map is ready for transactions after a pause
     * @private
     */
    run: function(mapInstanceId) {
      var oInstanceData = oMapInstanceData[mapInstanceId];

      if (oInstanceData) {
        // We must receive that same number of runs as we do pauses.
        oInstanceData.pauseCnt--;
        if (oInstanceData.pauseCnt <= 0) {
          oInstanceData.running = true;
          oInstanceData.pauseCnt = 0;
        }
      }
    },
    /**
     * hash of transactions that are running but not complete
     * @private
     */
    processHash: {},
    listener: {
      /**
       * @method
       * @public
       * @memberOf emp.transactionQueue.listener
       * @see emp.intents.control enumeration for a list of the intents types you can register for
       * @param {object} listenerInfo
       */
      add: function(listenerInfo) {
        var listener;
        if (!listenerInfo.mapInstanceId) {
          listenerInfo.mapInstanceId = "";
        }
        listener = listeners.getItem(listenerInfo.type + listenerInfo.mapInstanceId);
        if (listener !== null && listener !== undefined) {
          listener.push(listenerInfo.callback);
        } else {
          var callbacks = [];
          callbacks.push(listenerInfo.callback);
          listeners.setItem(listenerInfo.type + listenerInfo.mapInstanceId, callbacks);
        }
      },
      /**
       * @method
       * @public
       * @memberOf emp.transactionQueue.listener
       * @param  {object} listenerInfo
       * @return {boolean}
       */
      remove: function(listenerInfo) {
        var callbackArray,
          len,
          i,
          listener;

        if (!listenerInfo.mapInstanceId) {
          listenerInfo.mapInstanceId = "";
        }
        listener = listeners.getItem(listenerInfo.type + listenerInfo.mapInstanceId);
        if (listener !== null && listener !== undefined) {
          callbackArray = listeners.getItem(listenerInfo.type + listenerInfo.mapInstanceId);
          len = callbackArray.length;

          for (i = 0; i < len; i += 1) {
            if (callbackArray[i] === listenerInfo.callback) {
              callbackArray.splice(i, 1);
              return true;
            }
          }
        }
        return false;
      }
    },
    /**
     *
     * @param args
     */
    newMapInstance: function(args) {
      if (oMapInstanceData[args.mapInstanceId] === undefined) {
        oMapInstanceData[args.mapInstanceId] = mapInstanceData(args);
        oMapInstanceIdList.push(args.mapInstanceId);
      }
    },
    /**
     *
     * @param mapInstanceId
     */
    removeMapInstance: function(mapInstanceId) {
      var iIndex;
      var oTrans;
      var oInstanceData = oMapInstanceData[mapInstanceId];

      if (oInstanceData !== undefined) {
        if (outstandingTimer && oOutstandingTransaction) {
          if (oOutstandingTransaction.mapInstanceId === mapInstanceId) {
            clearTimeout(outstandingTimer);
            if (this.processHash.hasOwnProperty(oOutstandingTransaction.transactionId)) {
              delete this.processHash[oOutstandingTransaction.transactionId];
            }
            oOutstandingTransaction = null;
          }
        }
        while (oInstanceData.transQueue.length > 0) {
          oTrans = oInstanceData.transQueue[0];
          oInstanceData.transQueue.splice(0, 1);

          if (transHash.hasOwnProperty(oTrans.transactionId)) {
            delete transHash[oTrans.transactionId];
          }
        }
        delete oMapInstanceData[mapInstanceId];

        iIndex = oMapInstanceIdList.indexOf(mapInstanceId);
        if (iIndex !== -1) {
          oMapInstanceIdList.splice(iIndex, 1);
        }

        //oMapInstanceListIndex = 0;
      }
    },
    purgeMapQueue: function(sMapInstanceId) {
      var oTrans;
      var oInstanceData = oMapInstanceData[sMapInstanceId];

      if (oInstanceData !== undefined) {
        // Check to see if there is a transaction running.
        if (outstandingTimer && oOutstandingTransaction) {
          // Check if the transaction is for this map instance.
          if (oOutstandingTransaction.mapInstanceId === sMapInstanceId) {
            // Clear it out. When its done it will just die.
            clearTimeout(outstandingTimer);
            if (this.processHash.hasOwnProperty(oOutstandingTransaction.transactionId)) {
              delete this.processHash[oOutstandingTransaction.transactionId];
            }
            oOutstandingTransaction = null;
          }
        }

        // Go thru the instance's transaction queue.
        while (oInstanceData.transQueue.length > 0) {
          oTrans = oInstanceData.transQueue.splice(0, 1)[0];

          oTrans.run();
          if (transHash.hasOwnProperty(oTrans.transactionId)) {
            delete transHash[oTrans.transactionId];
          }
        }
      }
    },
    /**
     *
     * @param sMapInstanceId
     */
    dumpMapQueue: function(sMapInstanceId) {
      var oTrans;
      var oInstanceData = oMapInstanceData[sMapInstanceId];

      if (oInstanceData !== undefined) {
        // Check to see if there is a transaction running.
        if (outstandingTimer && oOutstandingTransaction) {
          // Check if the transaction is for this map instance.
          if (oOutstandingTransaction.mapInstanceId === sMapInstanceId) {
            // Clear it out. When its done it will just die.
            clearTimeout(outstandingTimer);
            if (this.processHash.hasOwnProperty(oOutstandingTransaction.transactionId)) {
              delete this.processHash[oOutstandingTransaction.transactionId];
            }
            oOutstandingTransaction = null;
          }
        }

        // Go thru the instance's transaction queue.
        while (oInstanceData.transQueue.length > 0) {
          oTrans = oInstanceData.transQueue.splice(0, 1)[0];

          if (transHash.hasOwnProperty(oTrans.transactionId)) {
            delete transHash[oTrans.transactionId];
          }
        }
      }
    },
    /**
     * @description This function retrieves the number of transaction in a specific queue.
     * @param {String} sMapInstanceId The map instance Id of the map or undefined for the main transaction queue.
     * @returns {Number} This function returns the number of transaction in the queue.
     */
    getMapQueueSize: function(sMapInstanceId) {
      var oInstanceData = oMapInstanceData[sMapInstanceId];

      if (oInstanceData !== undefined) {
        return oInstanceData.transQueue.length;
      }
      return emp.helpers.associativeArray.size(transHash);
    }
  };
  runQueue();

  return publicInterface;
}());
