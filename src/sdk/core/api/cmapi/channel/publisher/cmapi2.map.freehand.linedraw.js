// Register a channel publisher for the feature add event
cmapi.channel.publisher[cmapi.channel.names.CMAPI2_FREEHAND_LINE_DRAW] = {

  process: function(transaction) {
    try {

      var item = transaction.items[0];
      var message = {
        feature: item.data
      };

      var strokeStyle;
      if (item.properties && item.properties.lineColor) {
        if (!strokeStyle) {
          strokeStyle = {};
        }
        strokeStyle.strokeColor = emp.util.convertHexToColor(item.properties.lineColor);
      }

      if (item.properties && item.properties.lineWidth) {
        if (!strokeStyle) {
          strokeStyle = {};
        }
        strokeStyle.strokeWidth = item.properties.lineWidth;
      }

      message.strokeStyle = strokeStyle;

      if (transaction.intent === emp.intents.control.FREEHAND_LINE_DRAW_START) {
        message.type = emp3.api.enums.MapFreehandEventEnum.MAP_FREEHAND_LINE_DRAW_START;
      } else if (transaction.intent === emp.intents.control.FREEHAND_LINE_DRAW_END) {
        message.type = emp3.api.enums.MapFreehandEventEnum.MAP_FREEHAND_LINE_DRAW_END;
      } else if (transaction.intent === emp.intents.control.FREEHAND_LINE_DRAW_UPDATE) {
        message.type = emp3.api.enums.MapFreehandEventEnum.MAP_FREEHAND_LINE_DRAW_UPDATE;
      }
      emp.environment.get().pubSub.publish({
        message: message,
        sender: {
          id: transaction.mapInstanceId
        },
        channel: cmapi.channel.names.CMAPI2_FREEHAND_LINE_DRAW
      });

    } catch (e) {
      emp.typeLibrary.Error({
        message: "Publishing " + transaction.intent + " on channel " + cmapi.channel.names.CMAPI2_FREEHAND_LINE_DRAW + " failed due to an error.",
        jsError: e
      });
    }
  }
};
