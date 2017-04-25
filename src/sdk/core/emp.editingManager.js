var emp = window.emp || {};

/**
 * Controls the process of editing Features on the map.  Will
 * start the process to make sure all the messages are published
 * to the map.
 */
emp.editingManager = function(args) {

  var editTransaction, // The original edit transaction.
    mapInstance = args.mapInstance, // The map the edit is occurring on
    feature, // the current state of the feature.
    activeEditor, // The editor chosen based on the format and or draw type.
    updateData, // The most recent change to the feature, includes metadata about the vertex move/removal and updates.
    originalFeature,
    drawing = false;

  var getEditor = function(feature) {
    var symbol = false,
      drawCategory;

    // Determine if this is a MIL Symbol.  The mil symbol categories can greatly
    // vary, so we need to know the symbol code and standard for this.
    if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
      symbol = true;

      drawCategory = emp.util.getDrawCategory(feature);
    }

    // Determine the type of editor needed.
    // create the editor for the appropriate item being edited.
    if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_POINT ||
      (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POINT)) {
      // This is a single point item.  Single point items follow the same rules
      // regardless if it is MIL-STD or not.
      activeEditor = new emp.editors.Point({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_PATH ||
      (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_LINE)) {
      // This is a path.  These are items that follow the rules of a multipoint
      // line.  It could be MIL-STD or not.
      activeEditor = new emp.editors.Path({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_POLYGON) {
      // This is a polygon.   MIL-STD polygons are handled slightly different
      // so there is a separate editor for those.
      activeEditor = new emp.editors.Polygon({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_SQUARE) {
      // This is a polygon.   MIL-STD polygons are handled slightly different
      // so there is a separate editor for those.
      activeEditor = new emp.editors.Square({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POLYGON) {
      // This is a MIL-STD polygon.  It uses a GEOJSON linestring to represent
      // itself.  It is stored slightly different than the regular polygon.
      activeEditor = new emp.editors.MilStdPolygon({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (symbol && (drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_AUTOSHAPE ||
        drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_SUPERAUTOSHAPE)) {
      // This is a circle defined by a point and radius.  It uses a GEOJSON point and
      // a distance in meters to represent
      // itself.
      activeEditor = new emp.editors.MilStdAutoshape({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_ARROW) {
      // This is an arrow.  It is a line with the coordinates reversed when drawn.
      activeEditor = new emp.editors.MilStdArrow({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWOPOINTARROW) {
      // This is an arrow.  It is a line with the coordinates reversed when drawn.
      activeEditor = new emp.editors.MilStdTwoPointArrow({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWOPOINTLINE) {
      // This is an arrow.  It is a line with the coordinates reversed when drawn.
      activeEditor = new emp.editors.MilStdTwoPointLine({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_ROUTE) {
      // This is an arrow.  It is a line with the coordinates reversed when drawn.
      activeEditor = new emp.editors.AxisOfAdvance({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE ||
      (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)) {
      // This is an circle.  It is a point with a radius.
      activeEditor = new emp.editors.Circle({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE ||
      (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE)) {
      // This is an rectangle.  It is a point with a wioth and height.
      activeEditor = new emp.editors.Rectangle({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }
    else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE) {
      // This is an ellipse.  It is a point with a semi minor and semi major..
      activeEditor = new emp.editors.Ellipse({
        feature: feature,
        mapInstance: args.mapInstance
      });
    }

    return activeEditor;
  };

  /**
   * A function to use if an update did not occur by one of the editors.
   * This function will create the proper data structure to return to the callbacks.
   * It creates a generic updateData object for all editors.
   */
  var getUpdateData = function() {
    var newCoordinates = [];
    var coordinates;
    var coordinateUpdate;

    var updates = {};

    switch (originalFeature.data.type) {
      case "Point":
        coordinates = [originalFeature.data.coordinates];
        break;
      case "LineString":
        coordinates = originalFeature.data.coordinates;
        break;
      case "Polygon":
        coordinates = originalFeature.data.coordinates[0];
        break;
      default:
        break;
    }
    for (var i = 0; i < coordinates.length; i++) {
      newCoordinates.push({
        lat: coordinates[i][1],
        lon: coordinates[i][0]
      });
    }

    coordinateUpdate = {
      type: emp.typeLibrary.CoordinateUpdateType.UPDATE,
      indices: [],
      coordinates: newCoordinates
    };

    updates.coordinateUpdate = coordinateUpdate;
    updates.properties = originalFeature.properties;

    return updates;
  };

  var publicInterface = {

    /**
     * Called when the map goes into edit mode.
     */
    edit: function(transaction) {

      var symbol = false,
        drawCategory;

      // indicate that this isn't a draw.
      drawing = false;

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

      editTransaction.items[0].update({
        name: editTransaction.items[0].name,
        updates: {},
        properties: editTransaction.items[0].properties,
        updateEventType: emp.typeLibrary.UpdateEventType.START,
        mapInstanceId: mapInstance.mapInstanceId
      });

      // Determine the type of editor to create.
      feature = emp.storage.get.id({
        id: editTransaction.items[0].originFeature.coreId
      });

      // copy the feature.  we do not want to modify the original feature in
      // the transaction.  This feature will track the current state.
      if (feature) {
        feature = feature.getObjectData(mapInstance.mapInstanceId, emp.storage.getRootGuid(mapInstance.mapInstanceId));
        feature = emp.helpers.copyObject(feature);
        // The feature prior to any changes occurring.
        originalFeature = emp.helpers.copyObject(feature);

        // set the coreParent to undefined and overlayId to be ALL_PARENTS.
        // By doing this we indicate
        // that this typeLibrary.Feature is intended to be an update.
        originalFeature.coreParent = undefined;
        originalFeature.overlayId = emp.constant.parentIds.ALL_PARENTS;
        feature.coreParent = undefined;
        feature.overlayId = emp.constant.parentIds.ALL_PARENTS;
      }

      // Determine if this is a MIL Symbol.  The mil symbol categories can greatly
      // vary, so we need to know the symbol code and standard for this.
      if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL) {
        symbol = true;

        drawCategory = emp.util.getDrawCategory(feature);
      }

      // Determine the type of editor needed.
      // create the editor for the appropriate item being edited.
      if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_POINT ||
        (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POINT)) {
        // This is a single point item.  Single point items follow the same rules
        // regardless if it is MIL-STD or not.
        activeEditor = new emp.editors.Point({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }
      else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_PATH ||
        (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_LINE)) {
        // This is a path.  These are items that follow the rules of a multipoint
        // line.  It could be MIL-STD or not.
        activeEditor = new emp.editors.Path({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }
      else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_POLYGON) {
        // This is a polygon.   MIL-STD polygons are handled slightly different
        // so there is a separate editor for those.
        activeEditor = new emp.editors.Polygon({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }
      else if (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POLYGON) {
        // This is a MIL-STD polygon.  It uses a GEOJSON linestring to represent
        // itself.  It is stored slightly different than the regular polygon.
        activeEditor = new emp.editors.MilStdPolygon({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }
      else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE ||
        (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE)) {
        // This is a circle defined by a point and radius.  It uses a GEOJSON point and
        // a distance in meters to represent
        // itself.
        activeEditor = new emp.editors.Circle({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }
      else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE) {
        // This is a ellipse defined by a point and radius.  It uses a GEOJSON point and
        // a distance in meters to represent
        // itself.
        activeEditor = new emp.editors.Ellipse({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }
      else if (feature.format === emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE ||
        (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE)) {
        // This is a rectangle defined by a point, width, height and azimuth.
        activeEditor = new emp.editors.Rectangle({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }
      else if (feature.format == emp3.api.enums.FeatureTypeEnum.GEO_SQUARE) {
        // This is a square.
        // so there is a separate editor for those.
        activeEditor = new emp.editors.Square({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }
      else if (symbol && drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_ROUTE) {
        // This is an axis of advance defined by a line.  The last point of the line in relation to the first point
        // decides the width of the axis of advance.
        activeEditor = new emp.editors.AxisOfAdvance({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }
      else {
        // create the editor for the appropriate item being edited.
        activeEditor = new emp.editors.EditorBase({
          feature: feature,
          mapInstance: args.mapInstance
        });
      }

      // have the editor create any editing features on the map.
      activeEditor.addControlPoints();

    },

    /**
     * Called when the map goes into draw mode.
     */
    draw: function(transaction) {
      var item;

      // let the editor know this is a draw.
      drawing = true;

      //pause the transaction
      transaction.pause();

      editTransaction = transaction;

      //publish the start event
      mapInstance.eventing.DrawStart({
        transaction: editTransaction
      });

      item = transaction.items[0];

      // If this feature already exists,
      // Add the control points for that feature.
      // Remember that we are editing a symbol. We will need to return to this
      // feature prior to completing a draw.  Additionally, We will not call drawStart,
      // instead calling drawClick for each additional click.
      // Determine the type of editor to create.
      feature = emp.storage.get.id({
        id: item.featureId
      });

      // copy the feature.  we do not want to modify the original feature in
      // the transaction.  This feature will track the current state.
      if (feature) {
        feature = feature.getObjectData(mapInstance.mapInstanceId, emp.storage.getRootGuid(mapInstance.mapInstanceId));
        feature = emp.helpers.copyObject(feature);
        // The feature prior to any changes occurring.
        originalFeature = emp.helpers.copyObject(feature);

        // set the coreParent to undefined and overlayId to be ALL_PARENTS.
        // By doing this we indicate
        // that this typeLibrary.Feature is intended to be an update.
        originalFeature.coreParent = undefined;
        originalFeature.overlayId = emp.constant.parentIds.ALL_PARENTS;
        feature.coreParent = undefined;
        feature.overlayId = emp.constant.parentIds.ALL_PARENTS;

      }
      else {

        // The feature does not exist.
        // The draw needs to return a feature.  Prepare this feature.
        // Sometimes an existing feature is passed into the draw.  Make
        // sure to copy the feature's properties and coordinates.
        feature = new emp.typeLibrary.Feature({
          overlayId: "vertices",
          featureId: item.featureId || emp3.api.createGUID(),
          format: item.type,
          data: {
            // type: TODO: get correct type here.  We are going to have to
            // redo CMAPI channel to correct.
            coordinates: item.coordinates,
            symbolCode: item.symbolCode
          },
          properties: item.properties
        });



        // The feature prior to any changes occurring.
        originalFeature = emp.helpers.copyObject(feature);
      }

      activeEditor = getEditor(feature);

      // If we are drawing on an existing feature, add the control
      // points.  We can tell if it is existing, because the overlayId
      // will be set to ALL_PARENTS.
      if (feature.overlayId === emp.constant.parentIds.ALL_PARENTS) {
        activeEditor.addControlPoints();
      }

      // send out the callback to the user that the draw started.
      editTransaction.items[0].update({
        name: editTransaction.items[0].name,
        updates: {},
        properties: editTransaction.items[0].properties,
        updateEventType: emp.typeLibrary.UpdateEventType.START,
        mapInstanceId: mapInstance.mapInstanceId,
        data: feature.data,
        format: feature.format
      });

    },

    /**
     * Called when edit is cancelled.  Editing vertex are removed from
     * map, and feature returns to original state.
     */
    cancel: function() {

      var initFailList = [],
        transaction;

      initFailList.push(new emp.typeLibrary.Error({
        coreId: editTransaction.items[0].coreId,
        message: "The editing was cancelled.",
        level: emp.typeLibrary.Error.level.INFO
      }));

      editTransaction.items[0].originFeature = originalFeature;

      if (drawing) {
        mapInstance.eventing.DrawEnd({
          transaction: editTransaction,
          failures: initFailList
        });
      }
      else {
        mapInstance.eventing.EditEnd({
          transaction: editTransaction,
          failures: initFailList
        });
      }

      // remove editing control points from the map.
      activeEditor.removeControlPoints();

      // if we are drawing, remove the feature from the map.
      // if we are editing, restore the feature to its original state.
      if (drawing) {

        // If we were drawing on an existing feature we do not want to remove the
        // feature from the map, but we need to restore the feature to its original
        // state.
        if (feature.overlayId === emp.constant.parentIds.ALL_PARENTS) {
          transaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.FEATURE_ADD,
            mapInstanceId: mapInstance.mapInstanceId,
            transactionId: null,
            sender: mapInstance.mapInstanceId,
            originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
            source: emp.api.cmapi.SOURCE,
            messageOriginator: mapInstance.mapInstanceId,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
            items: [originalFeature]
          });
        }
        else {
          // If we are drawing a new feature, remove it from the map.
          transaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.FEATURE_REMOVE,
            mapInstanceId: mapInstance.mapInstanceId,
            transactionId: null,
            sender: mapInstance.mapInstanceId,
            originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
            source: emp.api.cmapi.SOURCE,
            messageOriginator: mapInstance.mapInstanceId,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
            items: [activeEditor.featureCopy]
          });
        }


      }
      else {
        // restore the feature to its original state.  Create
        // a FEATURE_ADD transaction that updates the feature
        // to its original state.
        transaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.FEATURE_ADD,
          mapInstanceId: mapInstance.mapInstanceId,
          transactionId: null,
          sender: mapInstance.mapInstanceId,
          originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
          source: emp.api.cmapi.SOURCE,
          messageOriginator: mapInstance.mapInstanceId,
          originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
          items: [originalFeature]
        });
      }

      // finish running the edit transaction
      editTransaction.run();

      // undo any changes that were made during the edit.
      transaction.run();



      // We are done editing. Reset state of editingManager.
      editTransaction = undefined;
      feature = undefined;
      activeEditor = undefined;
      updateData = undefined;
      originalFeature = undefined;
    },

    complete: function() {

      //publish the drawing end event
      var item,
        transaction;

      editTransaction.items[0].updatedFeature = activeEditor.featureCopy;

      // if we are drawing a new item, remove the feature from the map. We do this
      // because the responsibility of the draw is the API developer.   draw
      // does not commit the item to the map.
      // if we are editing, commit the feature .
      if (drawing) {

        // If we were drawing on an existing feature we do not want to remove the
        // feature from the map, but we need to restore the feature to its original
        // state
        if (feature.overlayId === emp.constant.parentIds.ALL_PARENTS) {
          transaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.FEATURE_ADD,
            mapInstanceId: mapInstance.mapInstanceId,
            transactionId: null,
            sender: mapInstance.mapInstanceId,
            originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
            source: emp.api.cmapi.SOURCE,
            messageOriginator: mapInstance.mapInstanceId,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
            items: [originalFeature]
          });
        }
        else {
          // If we are drawing a new feature, remove it from the map.
          transaction = new emp.typeLibrary.Transaction({
            intent: emp.intents.control.FEATURE_REMOVE,
            mapInstanceId: mapInstance.mapInstanceId,
            transactionId: null,
            sender: mapInstance.mapInstanceId,
            originChannel: cmapi.channel.names.MAP_FEATURE_UNPLOT,
            source: emp.api.cmapi.SOURCE,
            messageOriginator: mapInstance.mapInstanceId,
            originalMessageType: cmapi.channel.names.MAP_FEATURE_UNPLOT,
            items: [activeEditor.featureCopy]
          });
        }
      }
      else {
        // update the feature to its new state. Create
        // a FEATURE_ADD transaction that updates the feature
        // to its new state.  We pull that state from the editor.
        item = activeEditor.featureCopy;

        transaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.FEATURE_ADD,
          mapInstanceId: mapInstance.mapInstanceId,
          transactionId: null,
          sender: mapInstance.mapInstanceId,
          originChannel: cmapi.channel.names.MAP_FEATURE_PLOT,
          source: emp.api.cmapi.SOURCE,
          messageOriginator: mapInstance.mapInstanceId,
          originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT,
          items: [item]
        });
      }

      // remove editing control points from the map.
      activeEditor.removeControlPoints();

      if (drawing) {
        mapInstance.eventing.DrawEnd({
          transaction: editTransaction
        });
      }
      else {
        mapInstance.eventing.EditEnd({
          transaction: editTransaction
        });
      }

      // If updateData is not defined the item was not edited.  Return the
      // data of the original feature.
      if (!updateData) {
        updateData = getUpdateData();
      }

      // Send out the message that will trigger the complete callback.
      editTransaction.items[0].update({
        name: feature.name,
        updates: updateData.coordinateUpdate,
        properties: updateData.properties,
        updateEventType: emp.typeLibrary.UpdateEventType.COMPLETE,
        mapInstanceId: mapInstance.mapInstanceId,
        data: feature.data,
        format: feature.format
      });

      // finish running the transaction
      editTransaction.run();

      // Immediately update the feature to the new state.
      transaction.run();

      // We are done editing. Reset state of editingManager.
      editTransaction = undefined;
      feature = undefined;
      activeEditor = undefined;
      updateData = undefined;
      originalFeature = undefined;
    },

    editMouseDown: function(featureId) {

      var mapLock,
        lockMapTransaction;

      // only raise the event if the item we are trying to drag is
      // the item that is being edited.
      if (originalFeature && featureId === originalFeature.featureId ||
        activeEditor.isControlPoint(featureId)) {

        mapLock = new emp.typeLibrary.Lock({
          lock: emp3.api.enums.MapMotionLockEnum.NO_PAN
        });

        // first lock the map in place so the map does not pan.

        lockMapTransaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.VIEW_LOCK,
          mapInstanceId: mapInstance.mapInstanceId,
          source: mapInstance.mapInstanceId,
          messageOriginator: mapInstance.mapInstanceId,
          originalMessageType: cmapi.channel.names.MAP_VIEW_LOCK,
          items: [mapLock]
        });

        lockMapTransaction.run();
      }

    },

    editDragStart: function(featureId, pointer) {

      var transaction;
      var lockMapTransaction;
      var mapLock;
      var updateData;

      // only raise the event if the item we are trying to drag is
      // the item that is being edited.
      if (originalFeature && featureId === originalFeature.featureId && activeEditor.isFeature(featureId)) {

        // If this is the feature we are editing, raise a feature drag
        // event.

        // create a feature drag event.
        transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: mapInstance.mapInstanceId,
          intent: emp.intents.control.POINTER,
          originChannel: "cmapi2.map.view.drag",
          source: emp.core.sources.MAP,
          transactionId: emp.helpers.id.newGUID(),
          items: [pointer]
        });

        // send out the event.
        transaction.run();

      } // If we are dragging a control point, we don't want
      // any events going out, because it is not a feature.
      else if (activeEditor.isControlPoint(featureId)) {
        updateData = activeEditor.startMoveControlPoint(featureId, pointer);

        if (updateData) {
          editTransaction.items[0].update({
            name: feature.name,
            updates: updateData.coordinateUpdate,
            properties: updateData.properties,
            updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
            mapInstanceId: mapInstance.mapInstanceId
          });
        }
      }
      else {
        mapLock = new emp.typeLibrary.Lock({
          lock: emp3.api.enums.MapMotionLockEnum.NO_PAN
        });

        /* first lock the map in place so the map does not pan.*/
        lockMapTransaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.VIEW_LOCK,
          mapInstanceId: mapInstance.mapInstanceId,
          source: mapInstance.mapInstanceId,
          messageOriginator: mapInstance.mapInstanceId,
          originalMessageType: cmapi.channel.names.MAP_VIEW_LOCK,
          items: [mapLock]
        });

        lockMapTransaction.run();
      }
    },

    editDragMove: function(featureId, startX, startY, pointer) {

      if (originalFeature && featureId === originalFeature.featureId && activeEditor.isFeature(featureId)) {

        updateData = activeEditor.moveFeature(startX, startY, pointer);

        if (updateData) {

          editTransaction.items[0].update({
            name: feature.name,
            updates: updateData.coordinateUpdate,
            properties: updateData.properties,
            updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
            mapInstanceId: mapInstance.mapInstanceId
          });
        }
      }
      else if (activeEditor.isControlPoint(featureId)) {
        updateData = activeEditor.moveControlPoint(featureId, pointer);

        if (updateData) {

          editTransaction.items[0].update({
            name: feature.name,
            updates: updateData.coordinateUpdate,
            properties: updateData.properties,
            updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
            mapInstanceId: mapInstance.mapInstanceId
          });
        }
      }
    },

    editDragComplete: function(featureId, startX, startY, pointer) {
      var transaction;

      if (originalFeature && featureId === originalFeature.featureId && activeEditor.isFeature(featureId)) {
        updateData = activeEditor.moveFeature(startX, startY, pointer);
      }
      else if (activeEditor.isControlPoint(featureId)) {
        updateData = activeEditor.endMoveControlPoint(featureId, pointer);
      }

      // send out a feature drag complete event.
      transaction = new emp.typeLibrary.Transaction({
        mapInstanceId: mapInstance.mapInstanceId,
        intent: emp.intents.control.POINTER,
        originChannel: "cmapi2.map.view.dragComplete",
        source: emp.core.sources.MAP,
        transactionId: emp.helpers.id.newGUID(),
        items: [pointer]
      });
      transaction.run();

      if (updateData) {
        editTransaction.items[0].update({
          name: feature.name,
          updates: updateData.coordinateUpdate,
          properties: updateData.properties,
          updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
          mapInstanceId: mapInstance.mapInstanceId
        });
      }
    },

    editMouseUp: function() {
      var lockMapTransaction,
        mapLock;

      mapLock = new emp.typeLibrary.Lock({
        lock: emp3.api.enums.MapMotionLockEnum.UNLOCKED
      });

      lockMapTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.VIEW_LOCK,
        mapInstanceId: mapInstance.mapInstanceId,
        source: mapInstance.mapInstanceId,
        messageOriginator: mapInstance.mapInstanceId,
        originalMessageType: cmapi.channel.names.MAP_VIEW_LOCK,
        items: [mapLock]
      });

      lockMapTransaction.run();
    },

    /**
     * Occurs the first time the user clicks on the map.
     */
    drawStart: function(pointer) {

      // If this is an existing feature, the overlayId will be set to
      // ALL_PARENTS.  In this case we don't want to start the draw, we want to
      // act like if we are adding a new point.
      if (feature.overlayId === emp.constant.parentIds.ALL_PARENTS) {
        updateData = activeEditor.drawClick(pointer);
      }
      else {
        updateData = activeEditor.drawStart(pointer);
      }

      if (updateData) {

        editTransaction.items[0].update({
          name: feature.name,
          updates: updateData.coordinateUpdate,
          properties: updateData.properties,
          updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
          mapInstanceId: mapInstance.mapInstanceId
        });
      }
    },

    /**
     * Occurs when the mouse is moved after the drawing has
     * started.
     */
    drawMove: function(pointer) {
      activeEditor.drawMove(pointer);
    },

    /**
     * Occurs each time the user clicks on the map after the
     * drawing has started.
     */
    drawClick: function(pointer) {
      var updates;
      updates = activeEditor.drawClick(pointer);

      // sometimes a draw click does not do anything.
      // check to make sure something happened before overwriting
      // updateData.
      if (updates) {
        updateData = updates;

        if (updateData) {

          editTransaction.items[0].update({
            name: feature.name,
            updates: updateData.coordinateUpdate,
            properties: updateData.properties,
            updateEventType: emp.typeLibrary.UpdateEventType.UPDATE,
            mapInstanceId: mapInstance.mapInstanceId
          });
        }
      }
    }
  };


  return publicInterface;

};
