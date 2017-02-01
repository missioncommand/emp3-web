describe('emp.classLibrary.MapExtent', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('addCoordinate', function() {
    var extent;

    beforeEach(function() {
      extent = new emp.classLibrary.MapExtent();
    });

    it('adds a valid coordinate to the extent', function() {
      var coord1 = new emp.classLibrary.Coordinate(30, 40);
      var coord2 = new emp.classLibrary.Coordinate(20, 10);

      extent.addCoordinate(coord1);

      extent.options.degNorth.should.equal(30);
      extent.options.degSouth.should.equal(30);
      extent.options.degEast.should.equal(40);
      extent.options.degWest.should.equal(40);

      extent.addCoordinate(coord2);

      extent.options.degNorth.should.equal(30);
      extent.options.degSouth.should.equal(20);
      extent.options.degEast.should.equal(40);
      extent.options.degWest.should.equal(10);

    });

    it('adds a valid coordinate with 0,0 to the extent', function() {
      var coord1 = new emp.classLibrary.Coordinate(0, 0);
      var coord2 = new emp.classLibrary.Coordinate(20, 10);
      var coord3 = new emp.classLibrary.Coordinate(-20, -10);

      extent.addCoordinate(coord1);

      extent.options.degNorth.should.equal(0);
      extent.options.degSouth.should.equal(0);
      extent.options.degEast.should.equal(0);
      extent.options.degWest.should.equal(0);

      extent.addCoordinate(coord2);

      extent.options.degNorth.should.equal(20);
      extent.options.degSouth.should.equal(0);
      extent.options.degEast.should.equal(10);
      extent.options.degWest.should.equal(0);

      extent.addCoordinate(coord3);

      extent.options.degNorth.should.equal(20);
      extent.options.degSouth.should.equal(-20);
      extent.options.degEast.should.equal(10);
      extent.options.degWest.should.equal(-10);

    });

    it('adds coordinates to the left and right of IDL');
      /*var coord1 = new emp.classLibrary.Coordinate(10, 170);
      var coord2 = new emp.classLibrary.Coordinate(10, -170);
      var coord3 = new emp.classLibrary.Coordinate(-20, -175);

      extent.addCoordinate(coord1);

      extent.options.degNorth.should.equal(10);
      extent.options.degSouth.should.equal(10);
      extent.options.degEast.should.equal(170);
      extent.options.degWest.should.equal(170);

      extent.addCoordinate(coord2);

      extent.options.degNorth.should.equal(10);
      extent.options.degSouth.should.equal(10);
      extent.options.degEast.should.equal(170);
      extent.options.degWest.should.equal(-170);

      extent.addCoordinate(coord3);

      extent.options.degNorth.should.equal(10);
      extent.options.degSouth.should.equal(-20);
      extent.options.degEast.should.equal(170);
      extent.options.degWest.should.equal(-170);
    });*/
  });
});
