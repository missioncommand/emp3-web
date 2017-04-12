describe('map.overlay.style', function() {
  describe('styleMultiPoints', function() {
    it('handles styleMultiPoints', function() {
      var message = {
        cmd: emp3.api.enums.channel.styleOverlay,
        multiPointStyle: {
          mark: {
            fill: {
              color: '#FF00FF'
            },
            stroke: {
              color: '#FFFF00',
              width: 1
            },
            wellKnownName: 'red',
            graphicHeight: 50,
            graphicWidth: 75
          }
        },
        overlayId: emp3.api.createGUID()
      };

      var callInfo = {
        method: 'styleMultiPoints'
      };

      var transactionId = emp3.api.createGUID();
      var styleOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      styleOverlay.channel.should.equal(emp3.api.enums.channel.styleOverlay);
      styleOverlay.payload.properties.should.have.property('fillColor');
      styleOverlay.payload.properties.should.have.property('lineColor');
      styleOverlay.payload.properties.should.have.property('lineWidth');
      styleOverlay.payload.properties.should.have.property('iconUrl');
      styleOverlay.payload.properties.should.have.property('graphicHeight');
      styleOverlay.payload.properties.should.have.property('graphicWidth');
      styleOverlay.payload.should.have.property('overlayId', message.overlayId);
    });
  });

  describe('stylePolygons', function() {
    it('handles stylePolygons', function() {
      var message = {
        cmd: emp3.api.enums.channel.styleOverlay,
        polygonStyle: {
          mark: {
            fill: {
              color: '#FF00FF'
            },
            stroke: {
              color: '#FFFF00',
              width: 1
            },
            wellKnownName: 'red'
          }
        },
        overlayId: emp3.api.createGUID()
      };

      var callInfo = {
        method: 'stylePolygons'
      };

      var transactionId = emp3.api.createGUID();
      var styleOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      styleOverlay.channel.should.equal(emp3.api.enums.channel.styleOverlay);
      styleOverlay.payload.properties.should.have.property('fillColor');
      styleOverlay.payload.properties.should.have.property('lineColor');
      styleOverlay.payload.properties.should.have.property('lineWidth');
      styleOverlay.payload.properties.should.have.property('iconUrl');
      styleOverlay.payload.should.have.property('overlayId', message.overlayId);
    });
  });

  describe('styleLines', function() {
    it('handles styleLines', function() {
      var message = {
        cmd: emp3.api.enums.channel.styleOverlay,
        lineStyle: {
          mark: {
            fill: {
              color: '#FF00FF'
            },
            stroke: {
              color: '#FFFF00',
              width: 1
            },
            wellKnownName: 'red'
          }
        },
        overlayId: emp3.api.createGUID()
      };

      var callInfo = {
        method: 'styleLines'
      };

      var transactionId = emp3.api.createGUID();
      var styleOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      styleOverlay.channel.should.equal(emp3.api.enums.channel.styleOverlay);
      styleOverlay.payload.properties.should.have.property('fillColor');
      styleOverlay.payload.properties.should.have.property('lineColor');
      styleOverlay.payload.properties.should.have.property('lineWidth');
      styleOverlay.payload.properties.should.have.property('iconUrl');
      styleOverlay.payload.should.have.property('overlayId', message.overlayId);
    });
  });

  describe('stylePoints', function() {
    it('handles stylePoints', function() {
      var message = {
        cmd: emp3.api.enums.channel.styleOverlay,
        pointStyle: {
          mark: {
            fill: {
              color: '#FF00FF'
            },
            stroke: {
              color: '#FFFF00',
              width: 1
            },
            wellKnownName: 'red',
            graphicHeight: 100,
            graphicWidth: 200
          }
        },
        overlayId: emp3.api.createGUID()
      };

      var callInfo = {
        method: 'stylePoints'
      };

      var transactionId = emp3.api.createGUID();
      var styleOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      styleOverlay.channel.should.equal(emp3.api.enums.channel.styleOverlay);
      styleOverlay.payload.properties.should.have.property('fillColor');
      styleOverlay.payload.properties.should.have.property('lineColor');
      styleOverlay.payload.properties.should.have.property('lineWidth');
      styleOverlay.payload.properties.should.have.property('iconUrl');
      styleOverlay.payload.properties.should.have.property('graphicHeight');
      styleOverlay.payload.properties.should.have.property('graphicWidth');
      styleOverlay.payload.should.have.property('overlayId', message.overlayId);
    });
  });

  describe('styleOverlay', function() {
    it('handles styleOverlay', function() {
      var message = {
        cmd: emp3.api.enums.channel.styleOverlay,
        multiPointStyle: {
          mark: {
            fill: {
              color: '#FF00FF'
            },
            stroke: {
              color: '#FFFF00',
              width: 1
            },
            wellKnownName: 'red',
            graphicHeight: 50,
            graphicWidth: 75
          }
        },
        pointStyle: {
          mark: {
            fill: {
              color: '#FF00FF'
            },
            stroke: {
              color: '#FFFF00',
              width: 1
            },
            wellKnownName: 'red',
            graphicHeight: 50,
            graphicWidth: 75
          }
        },
        polygonStyle: {
          mark: {
            fill: {
              color: '#FF00FF'
            },
            stroke: {
              color: '#FFFF00',
              width: 1
            },
            wellKnownName: 'red',
            graphicHeight: 50,
            graphicWidth: 75
          }
        },
        lineStyle: {
          mark: {
            fill: {
              color: '#FF00FF'
            },
            stroke: {
              color: '#FFFF00',
              width: 1
            },
            wellKnownName: 'red'
          }
        },
        overlayId: emp3.api.createGUID()
      };

      var callInfo = {
        method: 'styleOverlay'
      };

      var transactionId = emp3.api.createGUID();
      var styleOverlay = emp3.api.MessageFactory.constructPayload(message, callInfo, transactionId);

      styleOverlay.channel.should.equal(emp3.api.enums.channel.styleOverlay);
      styleOverlay.payload.should.have.length(4);
      styleOverlay.payload[0].properties.should.have.property('fillColor');
      styleOverlay.payload[0].properties.should.have.property('lineColor');
      styleOverlay.payload[0].properties.should.have.property('lineWidth');
      styleOverlay.payload[0].properties.should.have.property('iconUrl');
      styleOverlay.payload[0].properties.should.have.property('graphicHeight');
      styleOverlay.payload[0].properties.should.have.property('graphicWidth');
      styleOverlay.payload[0].should.have.property('overlayId', message.overlayId);

    });
  });
});
