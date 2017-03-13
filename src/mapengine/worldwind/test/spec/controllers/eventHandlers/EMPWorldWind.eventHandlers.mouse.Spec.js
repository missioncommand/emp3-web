describe("EMPWorldWind.eventHandlers.mouse", function () {
  let event, sandbox, context;
  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    // Mouse event
    event = {
      target: {}, // TODO
      type: "", // TODO
      bubbles: true,
      cancelable: true,
      view: {}, // TODO
      detail: 0, // TODO
      currentTarget: {}, // TODO
      relatedTarget: {}, // TODO
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      button: 0, // no buttons
      buttons: 0, // no buttons
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('click', function () {
    it('sends an update to the EMP eventing controller with the coordinates', function () {
      const viewChangeSpy = sandbox.spy();
      const pointerStub = sandbox.stub();
      context = {
        worldWindow: worldWind,
        empMapInstance: {
          eventing: {
            ViewChange: viewChangeSpy,
            Pointer: pointerStub
          }
        }
      };

      EMPWorldWind.eventHandlers.mouse.click.call(context, event);
      pointerStub.should.have.been.calledWithMatch({
        type: emp.typeLibrary.Pointer.EventType.SINGLE_CLICK
      });
    });
  });

  describe('dblclick', function () {
    it('sends a dblclick event to the EMP eventing controller', function () {
      const pointerStub = sandbox.stub();
      context = {
        worldWindow: worldWind,
        empMapInstance: {
          eventing: {
            Pointer: pointerStub
          }
        }
      };

      EMPWorldWind.eventHandlers.mouse.dblclick.call(context, event);
      pointerStub.should.have.been.calledWithMatch({
        type: emp.typeLibrary.Pointer.EventType.DBL_CLICK
      });
    });
  });

  describe('mouseup', function () {
    it('sends a mouseup event to the EMP eventing controller', function () {
      const pointerStub = sandbox.stub();
      context = {
        worldWindow: worldWind,
        empMapInstance: {
          eventing: {
            Pointer: pointerStub
          }
        }
      };

      sandbox.stub(EMPWorldWind.utils, 'getEventCoordinates').returns({
        lat: 0,
        lon: 0
      });

      EMPWorldWind.eventHandlers.mouse.mouseup.call(context, event);
      pointerStub.should.have.been.calledWithMatch({
        type: emp.typeLibrary.Pointer.EventType.MOUSEUP
      });
    });
  });

  describe('mousedown', function () {
    it('sends a mousedown event to the EMP eventing controller', function () {
      const pointerStub = sandbox.stub();
      context = {
        worldWindow: worldWind,
        empMapInstance: {
          eventing: {
            Pointer: pointerStub
          }
        }
      };

      sandbox.stub(EMPWorldWind.utils, 'getEventCoordinates').returns({
        lat: 0,
        lon: 0
      });

      EMPWorldWind.eventHandlers.mouse.mousedown.call(context, event);
      pointerStub.should.have.been.calledWithMatch({
        type: emp.typeLibrary.Pointer.EventType.MOUSEDOWN
      });
    });
  });

  describe("move", function () {
    it('sends an update to the EMP eventing controller that the mouse has moved', function () {
      const pointerStub = sandbox.stub();
      context = {
        worldWindow: worldWind,
        empMapInstance: {
          eventing: {
            Pointer: pointerStub
          }
        }
      };

      sandbox.stub(EMPWorldWind.utils, 'getEventCoordinates').returns({
        lat: 0,
        lon: 0
      });

      EMPWorldWind.eventHandlers.mouse.mousemove.call(context, event);
      pointerStub.should.have.been.calledWithMatch({
        type: emp.typeLibrary.Pointer.EventType.MOVE
      });
    });

    it('sends an update to the EMP eventing controller that the view has moved if the left button was also held', function () {
      const viewChangeSpy = sandbox.spy();
      const pointerStub = sandbox.stub();
      context = {
        worldWindow: worldWind,
        empMapInstance: {
          eventing: {
            ViewChange: viewChangeSpy,
            Pointer: pointerStub
          }
        }
      };

      sandbox.stub(EMPWorldWind.utils, 'getEventCoordinates').returns({
        lat: 0,
        lon: 0
      });

      event.button = 1; // Left button
      event.buttons = 1;
      EMPWorldWind.eventHandlers.mouse.mousemove.call(context, event);
      pointerStub.should.have.been.calledWithMatch({
        type: emp.typeLibrary.Pointer.EventType.MOVE
      });
      viewChangeSpy.should.have.been.called;
    });

    it('sends an update to the EMP eventing controller that the view has moved if the right button was also held', function () {
      const viewChangeSpy = sandbox.spy();
      const pointerStub = sandbox.stub();
      context = {
        worldWindow: worldWind,
        empMapInstance: {
          eventing: {
            ViewChange: viewChangeSpy,
            Pointer: pointerStub
          }
        }
      };

      sandbox.stub(EMPWorldWind.utils, 'getEventCoordinates').returns({
        lat: 0,
        lon: 0
      });

      event.button = 2; // Right button
      event.buttons = 2;
      EMPWorldWind.eventHandlers.mouse.mousemove.call(context, event);
      pointerStub.should.have.been.calledWithMatch({
        type: emp.typeLibrary.Pointer.EventType.MOVE
      });
      viewChangeSpy.should.have.been.called;
    });
  });
});
