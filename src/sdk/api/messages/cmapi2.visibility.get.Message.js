(function() {
  "use strict";
  /**
   * @ignore
   * @classdesc Retrieves the visibility state of a container or container instance
   * @extends emp3.api.Message
   *
   * @class
   * @param {object} message Unused for this message.
   * @param {object} callInfo Unused for this message
   * @param {string} transactionId
   */
  function CMAPI2VisibilityGetMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.getVisibility, transactionId);

    // this is a very simple message.  It just indicates to map to start
    // drawing.  Only parameter is stroke style.
    this.payload = {
      targetId: message.target.geoId,
      parentId: (message.parent) ? message.parent.geoId : undefined,
      messageId: transactionId
    };
  }

  // Extend emp3.api.Message
  CMAPI2VisibilityGetMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.getVisibility
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, CMAPI2VisibilityGetMessage);
}());
