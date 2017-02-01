cmapi.channel.handler[cmapi.channel.names.MAP_FEATURE_DESELECTED_BATCH] = {
    // args will have a message and sender property
    process: function(args) {
        var featureTransaction,
            i,
            len,
            featureItems = [],
            cmapiBatchMsg = args.message.payload,
            sender = args.sender,
            oaBatchPayload = cmapiBatchMsg.features,
            payload,
            item,
            sOverlayId;


        featureTransaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.SELECTION_SET,
            mapInstanceId: args.mapInstanceId,
            transactionId: cmapiBatchMsg.messageId,
            sender: sender.id,
            originChannel: cmapi.channel.names.MAP_FEATURE_DESELECTED_BATCH,
            source: emp.api.cmapi.SOURCE,
            originalMessage: args.originalMessage,
            messageOriginator: sender.id,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_DESELECTED_BATCH,
            items: featureItems
        });

        // get schema for this channel
        // can use for channel specific validation
        //schema = cmapi.channel.schema[cmapi.channel.names.MAP_FEATURE_SELECTED_BATCH];

        if (cmapiBatchMsg.hasOwnProperty('overlayId'))
        {
            sOverlayId = cmapiBatchMsg.overlayId;
        }
        
        len = oaBatchPayload.length;

        for (i = 0; i < len; i = i + 1) {
            payload = oaBatchPayload[i];
            item = {};
            
            if ((payload.overlayId === undefined) || (payload.overlayId === null))
            {
                if (sOverlayId)
                {
                    payload.overlayId = sOverlayId;
                }
                else
                {
                    payload.overlayId = sender.id;
                }
            }

            item = new emp.typeLibrary.Selection({
                overlayId: payload.overlayId,
                featureId: payload.featureId,
                parentId: payload.parentId,
                selectedId: payload.selectedId,
                selectedName: payload.selectedName,
                select: false,
                transactionId: featureTransaction.transactionId
            });
            
            featureItems.push(item);
        }
        
        featureTransaction.queue();
    }
};
