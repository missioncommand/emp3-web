describe('emp.editors.Vertices', function () {


  describe('constructor', function () {
    it('creates Vertices', function() {

      var vertices = new emp.editors.Vertices();


      expect(vertices.head).to.be.null;
      expect(vertices.tail).to.be.null;
      vertices.length.should.equal(0);
      expect(vertices.list).to.eql([]);

    });
  });

  describe('push', function () {
    it('adds vertices correctly and in the right order', function() {

      var vertices = new emp.editors.Vertices();
      var feature1 = {
        featureId: "feature1"
      };
      var feature2 = {
        featureId: "feature2"
      };
      var feature3 = {
        featureId: "feature3"
      };
      var feature4 = {
        featureId: "feature4"
      };

      var vertex1 = new emp.editors.Vertex(feature1, "vertex");
      var vertex2 = new emp.editors.Vertex(feature2, "vertex");
      var vertex3 = new emp.editors.Vertex(feature3, "vertex");
      var vertex4 = new emp.editors.Vertex(feature4, "vertex");

      vertices.push(vertex1);
      vertices.push(vertex2);
      vertices.push(vertex3);
      vertices.push(vertex4);

      expect(vertices.head.feature.featureId).to.be.equal("feature1");
      expect(vertex3.before.feature.featureId).to.be.equal("feature2");
      expect(vertex3.next.feature.featureId).to.be.equal("feature4");
      expect(vertex2.next.feature.featureId).to.be.equal("feature3");
      expect(vertex2.before.feature.featureId).to.be.equal("feature1");
      expect(vertices.tail.feature.featureId).to.be.equal("feature4");

    });
  });

  describe('insert', function () {
    it('puts vertices in correct order', function() {
      var vertices = new emp.editors.Vertices();
      var feature1 = {
        featureId: "feature1"
      };
      var feature2 = {
        featureId: "feature2"
      };
      var feature3 = {
        featureId: "feature3"
      };
      var feature4 = {
        featureId: "feature4"
      };
      var feature2point5 = {
        featureId: "feature2.5"
      };

      var vertex1 = new emp.editors.Vertex(feature1, "vertex");
      var vertex2 = new emp.editors.Vertex(feature2, "vertex");
      var vertex3 = new emp.editors.Vertex(feature3, "vertex");
      var vertex4 = new emp.editors.Vertex(feature4, "vertex");
      var vertex2point5 = new emp.editors.Vertex(feature2point5, "vertex");


      vertices.push(vertex1);
      vertices.push(vertex2);
      vertices.push(vertex3);
      vertices.push(vertex4);

      vertices.insert(vertex3.feature.featureId, vertex2point5);

      expect(vertices.head.feature.featureId).to.be.equal("feature1");
      expect(vertex3.before.feature.featureId).to.be.equal("feature2.5");
      expect(vertex3.next.feature.featureId).to.be.equal("feature4");
      expect(vertex2.next.feature.featureId).to.be.equal("feature2.5");
      expect(vertex2.before.feature.featureId).to.be.equal("feature1");
      expect(vertices.tail.feature.featureId).to.be.equal("feature4");

    });

  });

  describe('append', function() {

    it('puts vertices in correct order', function() {
      var vertices = new emp.editors.Vertices();
      var feature1 = {
        featureId: "feature1"
      };
      var feature2 = {
        featureId: "feature2"
      };
      var feature3 = {
        featureId: "feature3"
      };
      var feature4 = {
        featureId: "feature4"
      };
      var feature2point5 = {
        featureId: "feature2.5"
      };

      var vertex1 = new emp.editors.Vertex(feature1, "vertex");
      var vertex2 = new emp.editors.Vertex(feature2, "vertex");
      var vertex3 = new emp.editors.Vertex(feature3, "vertex");
      var vertex4 = new emp.editors.Vertex(feature4, "vertex");
      var vertex2point5 = new emp.editors.Vertex(feature2point5, "vertex");


      vertices.push(vertex1);
      vertices.push(vertex2);
      vertices.push(vertex3);
      vertices.push(vertex4);

      vertices.append(vertex2.feature.featureId, vertex2point5);

      expect(vertices.head.feature.featureId).to.be.equal("feature1");
      expect(vertex3.before.feature.featureId).to.be.equal("feature2.5");
      expect(vertex3.next.feature.featureId).to.be.equal("feature4");
      expect(vertex2.next.feature.featureId).to.be.equal("feature2.5");
      expect(vertex2.before.feature.featureId).to.be.equal("feature1");
      expect(vertices.tail.feature.featureId).to.be.equal("feature4");

    });

  });

  describe('find', function() {

  });

  describe('findFeature', function() {

  });
});
