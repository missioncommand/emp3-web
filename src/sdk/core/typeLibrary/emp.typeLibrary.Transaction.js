var emp = window.emp || {};
emp.typeLibrary = emp.typeLibrary || {};

/**
 * @memberOf emp.typeLibrary
 * @class
 * @description This class represent a transaction in the EMP system. All operations
 * are conveyed with an instance of this class. A map implementation should
 * never create an instance of this class.
 */
emp.typeLibrary.Transaction = function(args) {

  /**
   * Contains the creation time of the transaction so
   * queue can execute in correct order.
   * @type {number}
   */
  this.creationTime = Date.now();

  /**
   * @private
   */
  this.coreId = emp.helpers.id.newGUID();

  /**
   * @private
   * @description This field indicates if the core is to generate a transaction
   * complete at the end of the transaction execution.
   */
  this.sendTransactionComplete = (function(args) {
    if (args.sendTransactionComplete === true) {
      return true;
    }
    if (args.sendTransactionComplete === false) {
      return false;
    }
    if (args.transactionId) {
      return true;
    }

    return false;
  }(args));

  /**
   * @field
   * @type {string}
   * @description This field contains the unique transaction identifier.
   */
  this.transactionId = args.transactionId || emp.helpers.id.newGUID();

  /**
   * @field
   * @type {string}
   * @description This field contains the unique message identifier.
   */
  this.messageId = args.messageId;

  /**
   * @field
   * @type {string}
   * @description This field contains the unique id of the map instance this transaction wil interact with.
   */
  this.mapInstanceId = args.mapInstanceId || "";

  /**
   *
   * @private
   */
  this.globalType = emp.typeLibrary.types.TRANSACTION;

  /**
   * @private
   */
  this.sender = args.sender;

  /**
   * @private
   */
  this.originChannel = args.originChannel;
  /**
   * DEPRECATED
   * @private
   * @type {string}
   * @deprecated replaced by source
   */
  this.originination = args.origination;
  /**
   * Creation source
   * @type {string}
   * @private
   */
  this.source = args.source || emp.core.sources.CORE;

  /**
   * Intent of transaction
   * @see  emp.intents.control
   * @type {string}
   * @private
   */
  this.intent = args.intent;
  /**
   * Additional params for intent, ie: true/false for visible
   * @type {string}
   * @private
   */
  this.intentParams = args.intentParams;

  /**
   * @private
   */
  this.options = args.options;

  /**
   * @private
   */
  this.type = "transaction"; // redundant?

  /**
   * @private
   */
  this.throttled = false; // used for queuing.
  // when queued and broke up will set flag so CMAPI will send only one complete (success/fail) message
  // when complete.
  // @todo Implement on CMAPI side.
  /**
   * Used by QM to determine whether or not transaction completed
   * @todo Implement in CMAPI
   * @type {Boolean}
   * @private
   */
  this.complete = true;
  /**
   * This was originally set to expect a function, but using arrays
   * is more reliable.  Allowing both until all uses of function are removed from code base
   * @field items
   * @type {Array}
   * @description All of the items associated with the transaction, instantiated from
   * other typeLibrary objects.
   */
  if (typeof args.items === "function") {
    this.items = args.items();
  } else {
    this.items = args.items;
  }

  /**
   * Array of successful items once the transaction is finished
   * @type {Array}
   * @private
   */
  this.successes = [];

  /**
   * This method must be called by the map implementation to fail any individual item if the requested operation
   * on the items fails.
   * @param  {emp.typeLibrary.Error | emp.typeLibrary.Error[]} args An object with, among all other properties, the coreId of the item that failed.
   */
  this.fail = function(args) {
    var i,
      x,
      removedItem;

    if (!Array.isArray(args)) {
      args = [args];
    }

    if (!this.hasOwnProperty("failures")) {
      this.failures = [];
    }
    for (i = 0; i < args.length; i = i + 1) {
      for (x = 0; x < this.items.length; x = x + 1) {
        if (this.items[x].coreId === args[i].coreId) {
          removedItem = this.items.splice(x, 1);
          switch (this.intent) {
            case emp.intents.control.WMS_ADD:
              args[i].id = removedItem[0].id;
              args[i].overlayId = removedItem[0].overlayId;
              break;
            case emp.intents.control.MENU_CONTEXT_CREATE:
              args[i].menuId = removedItem[0].menuId;
              break;
            case emp.intents.control.VISIBILITY_GET:
              args[i].targetId = removedItem[0].coreId;
              args[i].parentId = removedItem[0].parentId;
              break;
            default:
              args[i].overlayId = removedItem[0].overlayId;
              args[i].featureId = removedItem[0].featureId;
              args[i].parentId = removedItem[0].parentId;
              break;
          }
          this.failures.push(args[i]);
          break;
        }
      }
    }
  };


  // /**
  //  * @private
  //  */
  /*
   this.breakCoreId = function(args) {
   var returnVar = [],
   i,
   coreId;

   for (i = 0; i < args.length; i = i + 1) {

   coreId = args[i].coreId;
   coreId = coreId.split(".");
   if (coreId.length === 1) {
   returnVar.push({
   overlayId: coreId[0]
   });
   } else if (coreId.length === 2) {
   returnVar.push({
   overlayId: coreId[0],
   featureId: coreId[1]
   });
   } else if (coreId.length === 3) {
   returnVar.push({
   overlayId: coreId[0],
   parentId: coreId[1],
   featureId: coreId[2]
   });
   }
   }
   return returnVar;
   };
   */
  /**
   * Used by CMAPI to finalize transaction prior to publishing.
   * @return {void}
   */

  /**
   * @private
   */
  /*
   this.close = function() {

   var r = [],
   i;
   for (i = 0; i < this.items.length; i = i + 1) {
   r.push({
   coreId: this.items[i].coreId
   });
   }

   if (this.items.length > 0) {
   if ((this.items[0].bounds !== undefined &&
   this.items[0].bounds !== null) ||
   (this.items[0].location !== undefined &&
   this.items[0].location !== null) ||
   (this.items[0].range !== undefined &&
   this.items[0].range !== null)) {
   this.successes = [{
   bounds: this.items[0].bounds,
   center: this.items[0].location,
   range: this.items[0].range
   }];
   } else if (this.intent === "map.get") {
   this.successes = {
   overlay: this.items[0].overlay,
   feature: this.items[0].feature

   };
   } else {
   this.successes = this.breakCoreId(r);
   }
   }

   this.state = "closed";
   };
   */
  /*
   this is our setup for -INITIAL- validation errors.
   This will not work twice.
   */
  /**
   * List of failed items in the transaction.
   * @type {Array}
   * @private
   */
  this.failures = [];

  /**
   * @private
   */

  this.failInvalidItems = function() {
    var i,
      type = "undefined",
      coreId = "undefined",
      message = "";

    if (this.items !== undefined && this.items !== null) {
      for (i = 0; i < this.items.length; i++) {
        if (this.items[i]) {
          if (this.items[i].valid === false) {
            if (this.items[i].hasOwnProperty('coreId')) {
              coreId = this.items[i].coreId;
            }
            if (this.items[i].hasOwnProperty('globalType')) {
              type = this.items[i].globalType;
            }
            message = "The item with a core ID of " + coreId + " of type " + type + " is not valid and has been moved to the failure list on the transaction with an id of " + this.transactionId;
            this.fail([emp.typeLibrary.Error({
              coreId: this.items[i].coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: message
            })]);
          }
        }
      }
    }
  };

  /**
   * Used by the transaction to Queue it's self.
   * @return {void}
   */
  this.queue = function() {
    this.state = "queued";
    emp.transactionQueue.add(this);
  };

  /**
   * Used in intent control. Where are we.
   * @type {Number}
   * @private
   */
  this.sequenceNumber = 0;
  /**
   * Used to ensure we are not out of order.
   * @type {Number}
   * @private
   */
  this.lastNumber = 1;
  /**
   * Used to control close sequence
   * @type {Number}
   * @private
   */
  this.closeNumber = 0;
  /**
   * Control transaction state
   * @type {String}
   * @private
   */
  this.state = "init";
  /**
   * Used to describe if transaction is mid-stroke
   * @type {Boolean}
   * @private
   */
  this.inTask = false;
  /**
   * The primary method in which the transaction makes it through the intent workflow
   * @method
   * @return {void}
   * @private
   */
  this.runner = function() {

    var control = emp.intents.getSequence(this),
      i,
      e;

    this.inTask = true;
    //console.log(this.intent + "  TransID:" + this.transactionId + " In runner.");


    if (this.state === "paused") {
      this.inTask = false;
      return false;
    } else {
      do {
        for (i = this.sequenceNumber; i < control.forward.length; i = i + 1) {
          if (this.items.length < 1) {
            this.state = "run";
            continue;
          }
          if (this.lastNumber === i) {
            continue;
          }

          // set as we are running current task.
          // (in case of async)
          this.lastNumber = i;
          //                this.inTask = true;

          try {
            control.forward[i](this);
          } catch (err) {
            // If the map engine generates an exception we must fail all items.
            emp.typeLibrary.Error({
              coreId: this.items[0].coreId,
              level: emp.typeLibrary.Error.level.MAJOR,
              message: "Intent " + this.intent + " function " + i + " generated an exception. All items are placed on the fail list.",
              jsError: err
            });
            while (this.items.length > 0) {
              this.fail({
                coreId: this.items[0].coreId
              });
            }
            // In case it was paused we must set it to run.
            this.state = "running";
            //rValue = true;
          }

          this.sequenceNumber = i;

          if (this.state === "paused") {
            //bail.
            // need to increment...
            this.sequenceNumber = this.sequenceNumber + 1;
            //console.log(this.intent + "  TransID:" + this.transactionId + " Runner exit. Paused by action.");
            this.inTask = false;
            return false;
          }
        }
      } while (this.getNextItemSet());
    }
    // make sure we don't exit even if only one action.
    if (this.state === "paused") {
      this.sequenceNumber++;
      //console.log(this.intent + "  TransID:" + this.transactionId + " Runner exit. Paused after forward loop.");
      this.inTask = false;
      return false;
    } else {
      for (e = this.closeNumber; e < control.exit.length; e = e + 1) {
        try {
          control.exit[e](this);
        } catch (err) {
          emp.typeLibrary.Error({
            level: emp.typeLibrary.Error.level.MAJOR,
            message: "Intent " + this.intent + " exit function " + i + " generated an exception. All items are placed on the fail list.",
            jsError: err
          });
          while (this.items.length > 0) {
            this.fail({
              coreId: this.items[0].coreId
            });
          }
        }
      }

      if (emp.transactionQueue.processHash.hasOwnProperty(this.transactionId)) {
        delete emp.transactionQueue.processHash[this.transactionId];
      }
    }

    //console.log(this.intent + "  TransID:" + this.transactionId + " Runner clean exit.");
    this.inTask = false;
  };

  /**
   * @method
   * @description This method must be called by the map implementation if the operations
   * requested by the transaction are not completed by the end of the request call.
   */
  this.pause = function() {
    this.state = "paused";
  };

  /**
   * @method
   * @description This method must be called by the map implementation if it pauses the transaction at any point.
   * Not running a paused transaction can cause unexpected behavior.
   * @return {void}
   */
  this.run = function() {
    if (!emp.transactionQueue.processHash.hasOwnProperty(this.transactionId)) {
      emp.transactionQueue.processHash[this.transactionId] = this;
      this.prepItemsForExecution();
      this.failInvalidItems();
      this.checkTransactionSplicing();
    }
    if (this.inTask === true) {
      this.state = "running";
    } else if (this.inTask === false) {
      this.state = "running";
      this.runner();
    }

  };

  /**
   *
   */
  this.checkTransactionSplicing = function() {
    switch (this.intent) {
      // We will only splice the transaction for the following intents.
      case emp.intents.control.FEATURE_ADD:
      case emp.intents.control.FEATURE_REMOVE:
      case emp.intents.control.VISIBILITY_SET:
      case emp.intents.control.SELECTION_SET:
      case emp.intents.control.WMS_ADD:
      case emp.intents.control.WMS_REMOVE:
      case emp.intents.control.OVERLAY_ADD:
      case emp.intents.control.OVERLAY_REMOVE:
      case emp.intents.control.OVERLAY_UPDATE:
        if (this.items && (this.items.length > 1)) {
          var sTempStr = JSON.stringify(this);

          if (sTempStr.length > 2000000) {
            //console.log("Splicing transaction " + this.intent + " with " + this.items.length + " items.");
            this.pendingItems = this.items;
            this.items = [];
            this.getNextItemSet();
          }
        }
        break;
    }
  };

  /**
   *
   * @returns {boolean}
   */
  this.getNextItemSet = function() {
    if (this.pendingItems && (this.pendingItems.length > 0)) {
      var iCumSize = 0;
      var sTempStr;
      while (this.items.length > 0) {
        this.duplicate(this.items[0].coreId);
      }

      var iNextChunkSize;
      var iItemCnt = 0;
      var oItem;

      while ((this.pendingItems.length > 0) && (iItemCnt < 500)) {
        oItem = this.pendingItems[0];
        sTempStr = JSON.stringify(oItem);
        iNextChunkSize = sTempStr.length;

        if (((iCumSize + iNextChunkSize) > 2000000) && this.items.length > 0) {
          // There are items in the items list but adding this one will
          // put it over the limit. So break out and process the ones that are there first.
          break;
        }

        iCumSize += iNextChunkSize;
        this.items.push(oItem);
        this.pendingItems.splice(0, 1);
        iItemCnt++;
      }
      //console.log("     Processing next " + iItemCnt + " items. " + iCumSize + " Bytes");

      this.sequenceNumber = 0;
      this.lastNumber = 1;

      return true;
    }

    return false;
  };

  /**
   * @description This parameter stores the original payload of cmapi messages.
   * It is stored here for error processing.
   * @private
   */
  this.originalMessage = args.originalMessage;
  /**
   * @private
   */
  this.messageOriginator = args.messageOriginator;
  /**
   * @private
   */
  this.originalMessageType = args.originalMessageType;

  /**
   * @private
   * @description This field is populated with duplicate items that do not get sent to the map engines.
   * However the transaction complete must add them back to the items list before
   * publishing the message.
   */
  this.duplicateItems = [];

  /**
   *
   * @param sCoreId
   */
  this.duplicate = function(sCoreId) {
    var iIndex;
    var removedItem;

    for (iIndex = 0; iIndex < this.items.length; iIndex++) {
      if (this.items[iIndex].coreId === sCoreId) {
        // We found the item, so remove it from items and add it to duplicateItems.
        removedItem = this.items.splice(iIndex, 1);
        this.duplicateItems.push(removedItem[0]);
        return;
      }
    }
  };

  /**
   *
   */
  this.returnDuplicatesToItems = function() {
    var iIndex;

    for (iIndex = 0; iIndex < this.duplicateItems.length; iIndex++) {
      this.items.push(this.duplicateItems[iIndex]);
    }

    this.duplicateItems = [];
  };

  /**
   *
   */
  this.prepItemsForExecution = function() {
    var iIndex,
      len = this.items.length,
      item;
    for (iIndex = 0; iIndex < len; iIndex++) {
      item = this.items[iIndex];
      if ((item !== undefined) && (item !== null)
        && item.hasOwnProperty('prepForExecution')
        && (typeof item.prepForExecution === 'function')) {
        item.prepForExecution();
      }
    }
  };

  /**
   *
   * @param oItem
   * @returns {boolean}
   */
  this.isOnItemsList = function(oItem) {
    var iIndex;
    for (iIndex = 0; iIndex < this.items.length; iIndex++) {
      if (this.items[iIndex].coreId === oItem.coreId) {
        // Its already on the list.
        return true;
      }
    }
    for (iIndex = 0; iIndex < this.duplicateItems.length; iIndex++) {
      if (this.duplicateItems[iIndex].coreId === oItem.coreId) {
        // Its already on the list.
        return true;
      }
    }
    return false;
  };

  /**
   *
   * @param oItem
   */
  this.pushToItemsList = function(oItem) {
    if (!this.isOnItemsList(oItem)) {
      this.items.push(oItem);
    }
  };
};
