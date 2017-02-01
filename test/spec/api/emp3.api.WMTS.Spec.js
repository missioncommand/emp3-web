describe('emp3.api.WMTS', function() {
  describe('constructor', function() {
    it('handles no parameters', function() {
      var wmts = new emp3.api.WMTS();

      wmts.should.have.property('format', 'wmts');
      wmts.should.have.property('tileFormat', 'image/png');
      wmts.should.have.property('layer');
      wmts.should.have.property('style', 'default');
      wmts.should.have.property('url');
      wmts.should.have.property('name');
      wmts.should.have.property('geoId');
      wmts.should.have.property('description');
      wmts.should.have.property('version', '1.0.0');
    });
  });
});
