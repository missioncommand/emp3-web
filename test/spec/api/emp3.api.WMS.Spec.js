describe('emp3.api.WMS', function() {
  describe('constructor', function() {
    it('handles no parameters', function() {
      var wms = new emp3.api.WMS();

      wms.should.have.property('format', 'wms');
      wms.should.have.property('tileFormat', 'image/png');
      wms.layers.should.have.length(0);
      wms.should.have.property('url');
      wms.should.have.property('name');
      wms.should.have.property('geoId');
    });
  });
});
