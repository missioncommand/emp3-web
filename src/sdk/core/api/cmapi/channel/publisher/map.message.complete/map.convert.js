/* global cmapi */

// Register a message completion builder for GET_LATLON_FROM_XY
cmapi.map.message.complete.builder[emp.intents.control.GET_LATLON_FROM_XY] = {

  // oTransaction will have a transaction property
  build: function (oTransaction) {
    var convert;
    var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);

    if (oMsgCompletion.failures.length > 0) {
      return oMsgCompletion;
    }

    convert = oTransaction.items[0];
    oMsgCompletion.details.x = convert.lon;
    oMsgCompletion.details.y = convert.lat;
    oMsgCompletion.details.invalid = convert.invalid;

    return oMsgCompletion;
  }
};


// Register a message completion builder for GET_XY_FROM_LATLON
cmapi.map.message.complete.builder[emp.intents.control.GET_XY_FROM_LATLON] = {

  // oTransaction will have a transaction property
  build: function (oTransaction) {
    var convert;
    var oMsgCompletion = new cmapi.typeLibrary.MessageComplete(oTransaction);

    if (oMsgCompletion.failures.length > 0) {
      return oMsgCompletion;
    }

    convert = oTransaction.items[0];
    oMsgCompletion.details.x = convert.x;
    oMsgCompletion.details.y = convert.y;
    oMsgCompletion.details.invalid = convert.invalid;

    return oMsgCompletion;
  }
};
