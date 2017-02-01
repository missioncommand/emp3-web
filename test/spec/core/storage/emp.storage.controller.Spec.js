describe('emp.storage.controller', function() {
  var sandbox;
  beforeEach(function() {
    emp.storage.init();
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    emp.storage.init();
    sandbox.restore();
  });

  describe('methods defined under emp.storage.mapservice', function() {
    describe('validateAdd', function() {
      it ('checks there are no duplicates already in the store and validates the parent overlay', function() {
        var sender = {
          id: 'sender'
        };

        var wmsTransaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.WMS_ADD,
          mapInstanceId: '1234-5678-9ABC-DEF0',
          transactionId: '0FED-CBA9-8765-4321',
          sender: sender.id,
          originChannel: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
          source: emp.api.cmapi.SOURCE,
          originalMessage: {},
          messageOriginator: sender.id,
          originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
          items: [
            new emp3.api.WMS()
          ]
        });

        emp.storage.mapservice.validateAdd(wmsTransaction);
        wmsTransaction.items[0].overlayId.should.equal(emp.constant.parentIds.MAP_LAYER_PARENT);
      });

      it ('fails the transaction if a duplicate non-WMS entry is found in the store', function() {

        var sender = {
          id: 'sender'
        };

        var wmsItem = new emp3.api.WMS();
        // mock a core id
        wmsItem.coreId = wmsItem.geoId;

        var wmsTransaction = new emp.typeLibrary.Transaction({
          intent: emp.intents.control.WMS_ADD,
          mapInstanceId: '1234-5678-9ABC-DEF0',
          transactionId: '0FED-CBA9-8765-4321',
          sender: sender.id,
          originChannel: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
          source: emp.api.cmapi.SOURCE,
          originalMessage: {},
          messageOriginator: sender.id,
          originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT_URL,
          items: [wmsItem]
        });

        sandbox.stub(emp.storage.get, 'id').returns({
          coreId: wmsItem.geoId,
          getCoreObjectType: function() { return 'not wms'; }
        });

        var failSpy = sinon.spy(wmsTransaction, 'fail');

        emp.storage.mapservice.validateAdd(wmsTransaction);
        failSpy.should.have.been.calledWithMatch({
          coreId: wmsItem.coreId,
          level: emp.typeLibrary.Error.level.MAJOR,
          message: 'MapService feature id is duplicate.'
        });
      });
    });
  });

  describe('methods defined under emp.storage.overlay', function() {
    var clearTransaction;
    var sender = {id: '9ABC-DEF0-1234-5678'};

    beforeEach(function() {
      clearTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.OVERLAY_CLEAR,
        mapInstanceId: '1234-5678-9ABC-DEF0',
        transactionId: '0FED-CBA9-8765-4321',
        sender: sender.id,
        originChannel: cmapi.channel.names.MAP_OVERLAY_CLEAR,
        source: emp.api.cmapi.SOURCE,
        originalMessage: {},
        messageOriginator: sender.id,
        originalMessageType: cmapi.channel.names.MAP_OVERLAY_CLEAR,
        items: [new emp.typeLibrary.Overlay({overlayId: '4321-0FED-CBA9-8765'})]
      });
    });

    describe('clear', function() {
      it('creates a list of transactions to run', function() {
        var executeTransactionsStub = sandbox.stub(emp.storage, 'executeTransactions');
        emp.storage.overlay.clear(clearTransaction);
        executeTransactionsStub.should.have.been.calledWithMatch({
          oObjectUpdatedTransaction: sinon.match.object,
          oObjectRemoveTransaction: sinon.match.object,
          oFeatureRemoveFromMapTransactions: sinon.match.object,
          oWMSRemoveFromMapTransactions: sinon.match.object
        });
      });

      it('looks up the stored overlayIds to be used in constructing the clear transactions', function() {
        var findOverlayStub = sandbox.stub(emp.storage, 'findOverlay');
        emp.storage.overlay.clear(clearTransaction);
        findOverlayStub.should.have.been.calledOnce;
      });

      it('constructs child transactions to be executed', function() {
        // Stub finding an overlay core object
        sandbox.stub(emp.storage, 'findOverlay').returns({
          getChildrenCoreIds: function() { return [{id:'childId'}]; },
          removeChild: sandbox.spy()
        });
        // Stub finding a feature core object
        sandbox.stub(emp.storage, 'findObject').returns({
          getParentMapInstanceList: function() { return [{id:'1234-5678-9ABC-DEF0'}]; },
          parentCount: sandbox.stub().returns(0)
        });

        sandbox.stub(emp.storage, 'processChildrenRemoves');
        sandbox.stub(emp.storage, 'deleteObject');
        var addToRemoveTransactionStub = sandbox.stub(emp.storage, 'addToRemoveTransaction');

        emp.storage.overlay.clear(clearTransaction);
        addToRemoveTransactionStub.should.have.been.calledOnce;
      });

      it('attempts to delete objects if they have no parents', function() {
        // Stub finding an overlay core object
        sandbox.stub(emp.storage, 'findOverlay').returns({
          getChildrenCoreIds: function() { return [{id:'childId'}]; },
          removeChild: sandbox.spy()
        });
        // Stub finding a feature core object
        sandbox.stub(emp.storage, 'findObject').returns({
          getParentMapInstanceList: function() { return [{id:'1234-5678-9ABC-DEF0'}]; },
          parentCount: sandbox.stub().returns(0)
        });

        sandbox.stub(emp.storage, 'processChildrenRemoves');
        sandbox.stub(emp.storage, 'addToRemoveTransaction');
        var deleteObjectStub = sandbox.stub(emp.storage, 'deleteObject');

        emp.storage.overlay.clear(clearTransaction);
        deleteObjectStub.should.have.been.calledOnce;
      });

      it('will not delete objects if they still have parents', function() {
        // Stub finding an overlay core object
        sandbox.stub(emp.storage, 'findOverlay').returns({
          getChildrenCoreIds: function() { return [{id:'childId'}]; },
          removeChild: sandbox.spy()
        });
        // Stub finding a feature core object
        sandbox.stub(emp.storage, 'findObject').returns({
          getParentMapInstanceList: function() { return [{id:'1234-5678-9ABC-DEF0'}]; },
          parentCount: sandbox.stub().returns(1)
        });

        sandbox.stub(emp.storage, 'processChildrenRemoves');
        sandbox.stub(emp.storage, 'addToRemoveTransaction');
        var deleteObjectStub = sandbox.stub(emp.storage, 'deleteObject');

        emp.storage.overlay.clear(clearTransaction);
        deleteObjectStub.should.not.have.been.called;
      });
    });

    describe('validateParent', function() {
      it('fails returns false if the child is also the parent', function() {
        var coreId = '1234-5678-9ABC-DEF0';

        sandbox.stub(emp.storage, 'findObject');
        emp.storage.overlay.validateParent(coreId, coreId).should.eql({
          success: false,
          errorMsg: 'An overlay cannot be its own ancestor.'
        });
      });

      it('fails and returns false if the child is an ancestor of the parent', function() {
        var coreId = '1234-5678-9ABC-DEF0';
        var coreParentId = '0FED-CBA9-8765-4321';

        sandbox.stub(emp.storage, 'findObject').returns({
          getParent: function() {
            return coreId;
          }
        });
        emp.storage.overlay.validateParent(coreId, coreParentId).should.eql({
          success: false,
          errorMsg: 'An overlay cannot be its own ancestor.'
        });
      });

      it('fails and returns false if the child is an ancestor at any depth of parents', function() {
        var coreObject = {
          id: 'coreId',
          getParentCoreIds: function() { return []; }
        };
        var coreParentId = 'coreParentId';

        var parent1 = {
          id: 'parent1',
          getParent: sandbox.stub(),
          getParentCoreIds: function() {
            return [coreObject.id];
          }
        };
        var parent2 = {
          id: 'parent2',
          getParent: sandbox.stub(),
          getParentCoreIds: function() {
            return [parent1.id];
          }
        };
        var parent3 = {
          id: 'parent3',
          getParent: sandbox.stub(),
          getParentCoreIds: function() {
            return [parent2.id];
          }
        };

        sandbox.stub(emp.storage, 'findObject')
          .withArgs(coreParentId).returns(parent3)
          .withArgs(parent3.id).returns(parent2)
          .withArgs(parent2.id).returns(parent1)
          .withArgs(parent1.id).returns(coreObject);

        emp.storage.overlay.validateParent(coreObject.id, coreParentId).should.eql({
          success: false,
          errorMsg: 'An overlay cannot be its own ancestor.'
        });
      });

      it('returns true if the overlay is not an ancestor of itself', function() {
        var coreId = '1234-5678-9ABC-DEF0';
        var coreParentId = '0FED-CBA9-8765-4321';
        sandbox.stub(emp.storage, 'findObject').returns({
          getParent: sandbox.stub(),
          getParentCoreIds: sandbox.stub().returns([])
        });
        emp.storage.overlay.validateParent(coreId, coreParentId).should.equal(true);
      });

    });
  });

  describe('methods defined under emp.storage.feature', function() {
    var addTransaction;
    var overlayId;
    var feature1, feature2;

    beforeEach(function() {
      overlayId = '1234-5678-9ABC-DEF0';
      feature1 = new emp.typeLibrary.Feature({featureId: '1', overlayId: overlayId});
      feature2 = new emp.typeLibrary.Feature({featureId: '2', overlayId: overlayId});
      addTransaction = new emp.typeLibrary.Transaction({
        intent: emp.intents.control.FEATURE_ADD,
        mapInstanceId: '1234-5678-9ABC-DEF0',
        transactionId: '0FED-CBA9-8765-4321',
        sender: 'sender',
        originChannel: cmapi.channel.names.MAP_FEATURE_PLOT_BATCH,
        source: emp.api.cmapi.SOURCE,
        originalMessage: {},
        messageOriginator: 'sender',
        originalMessageType: cmapi.channel.names.MAP_FEATURE_PLOT_BATCH,
        items: [feature1, feature2]
      });
    });

    describe('add', function() {
      it('it processes the original transaction and tries to execute a prepared transaction', function() {
        var executeTransactionsStub = sandbox.stub(emp.storage, 'executeTransactions');
        emp.storage.feature.add(addTransaction);
        executeTransactionsStub.should.have.been.called;
      });

      it('will attempt to store new features', function() {
        var storeObjectStub = sandbox.stub(emp.storage, 'storeObject');
        emp.storage.feature.add(addTransaction);
        storeObjectStub.should.have.been.calledTwice;
      });
    });
  });

  describe('methods defined under emp.storage.visibility', function() {
    describe('getState', function() {

      beforeEach(function() {
        // create a fake emp store.
        // X overlay1
        //   X overlay2
        //     - feature2
        //       - feature3
        //   X feature1
        var store = {
          overlay2 : {
            options: {
              visibleOnMap: {
                map1: true
              },
              parentObjects: {
                overlay1: {
                  options: {
                    visibilitySetting: {
                      map1: true
                    }
                  }
                }
              }
            }
          },
          overlay1: {
            options: {
              visibleOnMap: {
                map1: true
              },
              parentObjects: {
                map1: {
                  options: {
                    visibilitySetting: {
                      map1: true
                    }
                  }
                }
              }
            }
          },
          feature1: {
            options: {
              visibleOnMap: {
                map1: true
              },
              parentObjects: {
                overlay1: {
                  options: {
                    visibilitySetting: {
                      map1: true
                    }
                  }
                }
              }
            }
          },
          feature2: {
            options: {
              visibleOnMap: {
                map1: false
              },
              parentObjects: {
                overlay2: {
                  options: {
                    visibilitySetting: {
                      map1: false
                    }
                  }
                }
              }
            }
          },
          feature3: {
            options: {
              visibleOnMap: {
                map1: false
              },
              parentObjects: {
                feature2: {
                  options: {
                    visibilitySetting: {
                      map1: true
                    }
                  }
                }
              }
            }
          }
        };

        // override the existing storage.
        emp.storage._storage.store = store;
      });

      it('it gets the visibility of an item where the user specifies the parentId and the parent is visible, but the child is hidden', function() {

        // prepare the transaction for the call.
        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: "map1",
          items: [
            {
              coreId: "feature2",
              parentId: "overlay2",
              visible: undefined
            }
          ]
        });

        emp.storage.visibility.getState(transaction);

        transaction.items[0].visible.should.equal(0);
      });

      it('it gets the visibility of an item where the user specifies the parentId and the parent is visible, and the child is visible', function() {

        // prepare the transaction for the call.
        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: "map1",
          items: [
            {
              coreId: "feature1",
              parentId: "overlay1",
              visible: undefined
            }
          ]
        });

        emp.storage.visibility.getState(transaction);

        transaction.items[0].visible.should.equal(1);
      });

      it('it gets the visibility of an item where the user specifies the parentId and the parent is not visible, and the child was not set to be hidden', function() {

        // prepare the transaction for the call.
        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: "map1",
          items: [
            {
              coreId: "feature3",
              parentId: "feature2",
              visible: undefined
            }
          ]
        });

        emp.storage.visibility.getState(transaction);

        transaction.items[0].visible.should.equal(2);
      });

      it('it gets the visibility of an item where the user specifies the parentId but parent id is not found', function() {

        // prepare the transaction for the call.
        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: "map1",
          items: [
            {
              coreId: "feature1",
              parentId: "overlay3",
              visible: undefined
            }
          ]
        });

        emp.storage.visibility.getState(transaction);

        transaction.failures.should.be.lengthOf(1);
      });

      it('it gets the visibility of an item where the target is hidden', function() {

        // prepare the transaction for the call.
        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: "map1",
          items: [
            {
              coreId: "feature2",
              visible: undefined
            }
          ]
        });

        emp.storage.visibility.getState(transaction);

        transaction.items[0].visible.should.equal(0);
      });

      it('it gets the visibility of an item where the target is visible', function() {

        // prepare the transaction for the call.
        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: "map1",
          items: [
            {
              coreId: "feature1",
              visible: undefined
            }
          ]
        });

        emp.storage.visibility.getState(transaction);

        transaction.items[0].visible.should.equal(1);
      });

      it('it gets the visibility of an item where but the target is not found', function() {

        // prepare the transaction for the call.
        var transaction = new emp.typeLibrary.Transaction({
          mapInstanceId: "map1",
          items: [
            {
              coreId: "feature4",
              visible: undefined
            }
          ]
        });

        emp.storage.visibility.getState(transaction);

        transaction.failures.should.be.lengthOf(1);
      });
    });
  });
});
