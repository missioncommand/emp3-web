/*global emp, cmapi */
cmapi.channel.handler[cmapi.channel.names.MAP_MESSAGE_CANCEL] = {
	process: function (args) {
		var message = args.message,
			len,
			transactionId,
			i;

		// Put the payload in a consistent format.  
		// Some payloads can be arrays, others can be
		// objects.  By making this an array we can handle
		// it one way.
		if (!Array.isArray(message.payload)) {
			message.payload = [message.payload];
		}

		len = message.payload.length;

		// Loop through each message and attempt to cancel 
		// the transaction with the associated transactionIds.
		// If the transaction already occurred, nothing bad will
		// happen.  
		for (i = 0; i < len; i += 1) {
			if (message.payload[i].messageId) {
				transactionId = message.payload[i].messageId;
				emp.transactionQueue.cancel(transactionId);
			}
		}

	}

};