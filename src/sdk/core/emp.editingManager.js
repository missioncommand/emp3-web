emp.editingManager = function (args) {

  var editTransaction,
    mapInstance = args.mapInstance,
    activeEditor;

  var publicInterface = {

    edit: function(transaction) {
      //pause the transaction
      transaction.pause();

      editTransaction = transaction;

      //publish the start event
      mapInstance.eventing.EditStart({
        transaction: editTransaction,
        featureId: editTransaction.items[0].featureId,
        overlayId: editTransaction.items[0].overlayId,
        parentId: editTransaction.items[0].parentId
      });

      // create the editor for the appropriate item being edited.
      activeEditor = new emp.editors.EditorBase({
        featureId: editTransaction.items[0].featureId,
        mapInstanceId: args.mapInstance.mapInstanceId
      });

      activeEditor.addControlPoints();

      // have the editor create any editing features on the map.
    },

    cancel: function() {

      //publish the drawing end event
      var initFailList = [];
      initFailList.push(new emp.typeLibrary.Error({
          coreId: editTransaction.items[0].coreId,
          message: "The editing was cancelled.",
          level: emp.typeLibrary.Error.level.INFO
      }));
      mapInstance.eventing.EditEnd({
          transaction: editTransaction,
          failures: initFailList
      });

      // remove editing control points from the map.
      activeEditor.removeControlPoints();
      // finish running the transaction
      editTransaction.run();

    },

    complete: function() {

      //publish the drawing end event
      var initFailList = [];
      mapInstance.eventing.EditEnd({
          transaction: editTransaction,
          failures: initFailList
      });

      // remove editing control points from the map.
      activeEditor.removeControlPoints();
      // finish running the transaction
      editTransaction.run();
    }

  };

  return publicInterface;

};
