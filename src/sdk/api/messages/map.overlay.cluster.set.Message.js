(function() {
  "use strict";

  /**
   * @extends emp3.api.Message
   *
   * @ignore
   * @class
   * @param {object} message Unused for this call
   * @param {object} callInfo
   * @param {string} transactionId
   */
  function MapOverlayClusterSetMessage(message, callInfo, transactionId) {
    emp3.api.Message.call(this, emp3.api.enums.channel.overlayClusterSet, transactionId);

    this.payload = {
      overlayId: callInfo.args.overlay.id,
      threshold: callInfo.args.cluster.threshold,
      distance: callInfo.args.cluster.distance,
      clusterStyle: callInfo.args.cluster.clusterStyle,
      messageId: transactionId
    };
  }

  // Extend emp3.api.Message
  MapOverlayClusterSetMessage.prototype = Object.create(emp3.api.Message.prototype);

  //====================================================================================================================
  var channels = [
    emp3.api.enums.channel.overlayClusterSet
  ];

  // Register with the MessageFactory
  emp3.api.MessageFactory.registerMessage(channels, MapOverlayClusterSetMessage);
}());
