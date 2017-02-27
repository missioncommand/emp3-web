describe('emp.editors.Vertex', function () {
  describe('constructor', function () {
    it('handles missing parameters', function() {


      var createVertex = function () {
        var vertex = new emp.editors.Vertex();
      };

      createVertex.should.throw("Missing parameter: feature");

      createVertex = function () {
        var vertex = new emp.editors.Vertex("spunky");
      };

      createVertex.should.throw("Missing parameter: type");

    });

    it ('handles good parameters', function() {


      var point = new emp.typeLibrary.Feature({
        overlayId: "vertices",
        featureId: "blah",
        format: emp3.api.enums.FeatureTypeEnum.GEO_POINT,
        data: {
          coordinates: [0,0],
          type: 'Point'
        }
      });

      var vertex = new emp.editors.Vertex(point, "vertex");

      vertex.feature.should.equal(point);
      vertex.type.should.equal("vertex");
      expect(vertex.next).to.be.null;
      expect(vertex.before).to.be.null;

    });
  });
});
