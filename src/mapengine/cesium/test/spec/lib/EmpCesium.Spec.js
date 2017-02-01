describe('EmpCesium', function() {
  var empCesium, viewer;
  beforeEach(function() {
    empCesium = new EmpCesium();
    viewer = new Cesium.Viewer('testContainer');

    empCesium.initialize(viewer);
  });


  describe('getLonLatFromPixel', function() {
    it('converts screen coordinates to valid latitude and longitude', function() {
      var pos = {
        x: viewer._lastWidth / 2,
        y: viewer._lastHeight / 2
      };

      empCesium.getLonLatFromPixel(pos).latitude.should.be.within(0.60, 0.61, 'Acceptable Latitudes');
      empCesium.getLonLatFromPixel(pos).longitude.should.be.within(-1.44, -1.43, 'Acceptable Longitudes');
    });

    it('returns -1000 for positions off of the globe', function() {
      var pos = {
        x: -999999,
        y: -999999
      };

      empCesium.getLonLatFromPixel(pos).latitude.should.equal(-1000);
      empCesium.getLonLatFromPixel(pos).longitude.should.equal(-1000);
    });
  });
});
