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

  });

  describe('insert', function () {

  });

  describe('append', function() {

  });

  describe('find', function() {

  });

  describe('findFeature', function() {

  });
});
