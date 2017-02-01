describe('emp3.typeLibrary.WMS.Spec.js', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('constructor', function() {
    it('it constructs a basic WMS Service object', function() {
      var args = {
        name: 'test wms',
        id: '1234-5678-9ABC-DEF0'
      };

      sandbox.stub(emp.util.config, 'getUseProxySetting');
      sandbox.stub(emp.util, 'getBooleanValue').returns(false);

      var wms = new emp.typeLibrary.WMS(args);
      wms.should.exist;
      wms.should.have.property('name', args.name);
      wms.should.have.property('id', args.id);
      wms.should.have.property('version');
      wms.should.have.property('format');
    });
  });

  describe('getCapabilities', function() {
    it('uses the WMS Loader to retrieve capabilities from a given WMS Service URL');
  });
});
