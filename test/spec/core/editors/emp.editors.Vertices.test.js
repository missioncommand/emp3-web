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

  describe('toString', function() {
    it ('creates the correct string', function() {
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

      expect(vertices.toString()).to.be.equal("[feature1 => feature2 => feature3 => feature4]");
    });

  });

  describe('insert', function() {

    var vertices;
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

    beforeEach( function() {
      vertices = new emp.editors.Vertices();
      vertices.push(vertex1);
      vertices.push(vertex2);
      vertices.push(vertex3);
      vertices.push(vertex4);
    });

    it('inserts a feature before the first item', function() {
      var feature05 = {
        featureId: "feature0.5"
      };
      var vertex0point5 = new emp.editors.Vertex(feature05, "vertex");
      vertices.insert("feature1", vertex0point5);

      expect(vertex1.before).to.eql(vertex0point5);
      expect(vertex1.next).to.eql(vertex2);
      expect(vertex0point5.before).to.be.null;
      expect(vertex0point5.next).to.eql(vertex1);
      expect(vertices.find("feature0.5")).to.eql(vertex0point5);
    });

    it('inserts a feature after last item', function() {
      var feature3point5 = {
        featureId: "feature3.5"
      };
      var vertex3point5 = new emp.editors.Vertex(feature3point5, "vertex");
      vertices.insert("feature4", vertex3point5);

      expect(vertex4.before).to.eql(vertex3point5);
      expect(vertex4.next).to.be.null;
      expect(vertex3point5.before).to.eql(vertex3);
      expect(vertex3point5.next).to.eql(vertex4);
      expect(vertices.find("feature3.5")).to.eql(vertex3point5);
    });

    it('inserts a feature in between middle', function() {
      var feature2point5 = {
        featureId: "feature2.5"
      };
      var vertex2point5 = new emp.editors.Vertex(feature2point5, "vertex");

      vertices.insert("feature3", vertex2point5);

      expect(vertex3.before).to.eql(vertex2point5);
      expect(vertex3.next).to.eql(vertex4);
      expect(vertex2point5.before).to.eql(vertex2);
      expect(vertex2point5.next).to.eql(vertex3);
      expect(vertices.find("feature2.5")).to.eql(vertex2point5);
    });
  });

  describe('append', function() {

    var vertices;
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

    beforeEach( function() {
      vertices = new emp.editors.Vertices();
      vertices.push(vertex1);
      vertices.push(vertex2);
      vertices.push(vertex3);
      vertices.push(vertex4);
    });

    it('appends at head', function() {
      var feature1point5 = {
        featureId: "feature1.5"
      };
      var vertex1point5 = new emp.editors.Vertex(feature1point5, "vertex");
      vertices.append("feature1", vertex1point5);

      expect(vertex1.before).to.be.null;
      expect(vertex1.next).to.eql(vertex1point5);
      expect(vertex1point5.before).to.eql(vertex1);
      expect(vertex1point5.next).to.eql(vertex2);
      expect(vertices.find("feature1.5")).to.eql(vertex1point5);
    });

    it('appends at tail', function() {
      var feature4point5 = {
        featureId: "feature4.5"
      };
      var vertex4point5 = new emp.editors.Vertex(feature4point5, "vertex");
      vertices.append("feature4", vertex4point5);

      expect(vertex4.before).to.eql(vertex3);
      expect(vertex4.next).to.eql(vertex4point5);
      expect(vertex4point5.before).to.eql(vertex4);
      expect(vertex4point5.next).to.be.null;
      expect(vertices.find("feature4.5")).to.eql(vertex4point5);
    });

    it('appends at middle', function() {
      var feature3point5 = {
        featureId: "feature3.5"
      };
      var vertex3point5 = new emp.editors.Vertex(feature3point5, "vertex");

      vertices.append("feature3", vertex3point5);

      expect(vertex3.before).to.eql(vertex2);
      expect(vertex3.next).to.eql(vertex3point5);
      expect(vertex3point5.before).to.eql(vertex3);
      expect(vertex3point5.next).to.eql(vertex4);
      expect(vertices.find("feature3.5")).to.eql(vertex3point5);
    });

  });

  describe('find', function() {
    it ('finds handles something that doesn\'t exist', function() {
        var vertices = new emp.editors.Vertices();
        expect(vertices.find("feature1")).to.be.undefined;
    });

    it ('finds something that exists', function() {
      var vertices;
      var feature1 = {
        featureId: "feature1"
      };
      var feature2 = {
        featureId: "feature2"
      };
      var feature3 = {
        featureId: "feature3"
      };

      var vertex1 = new emp.editors.Vertex(feature1, "vertex");
      var vertex2 = new emp.editors.Vertex(feature2, "vertex");
      var vertex3 = new emp.editors.Vertex(feature3, "vertex");


      vertices = new emp.editors.Vertices();
      vertices.push(vertex1);
      vertices.push(vertex2);
      vertices.push(vertex3);

      expect(vertices.find("feature1")).to.eql(vertex1);
      expect(vertices.find("feature2")).to.eql(vertex2);
      expect(vertices.find("feature3")).to.eql(vertex3);
    });
  });

  describe('findFeature', function() {
    it ('finds handles something that doesn\'t exist', function() {
      var vertices = new emp.editors.Vertices();
      expect(vertices.find("feature1")).to.be.undefined;
    });

    it ('finds something that exists', function() {
      var vertices;
      var feature1 = {
        featureId: "feature1"
      };
      var feature2 = {
        featureId: "feature2"
      };
      var feature3 = {
        featureId: "feature3"
      };

      var vertex1 = new emp.editors.Vertex(feature1, "vertex");
      var vertex2 = new emp.editors.Vertex(feature2, "vertex");
      var vertex3 = new emp.editors.Vertex(feature3, "vertex");


      vertices = new emp.editors.Vertices();
      vertices.push(vertex1);
      vertices.push(vertex2);
      vertices.push(vertex3);

      expect(vertices.findFeature("feature1")).to.eql(feature1);
      expect(vertices.findFeature("feature2")).to.eql(feature2);
      expect(vertices.findFeature("feature3")).to.eql(feature3);
    });
  });

  describe('getFeatures', function() {
    it('handles no features', function() {
      var vertices = new emp.editors.Vertices();
      expect(vertices.getFeatures()).to.eql([]);
    });


    it('handles three features', function() {
      var vertices;
      var feature1 = {
        featureId: "feature1"
      };
      var feature2 = {
        featureId: "feature2"
      };
      var feature3 = {
        featureId: "feature3"
      };

      var vertex1 = new emp.editors.Vertex(feature1, "vertex");
      var vertex2 = new emp.editors.Vertex(feature2, "vertex");
      var vertex3 = new emp.editors.Vertex(feature3, "vertex");

      vertices = new emp.editors.Vertices();
      vertices.push(vertex1);
      vertices.push(vertex2);
      vertices.push(vertex3);

      expect(vertices.getFeatures()).to.eql([feature1,feature2,feature3]);
    });
  });

  describe('getVerticesAsLineString', function() {
    it('handles no features', function() {
      var vertices = new emp.editors.Vertices();
      expect(vertices.getVerticesAsLineString()).to.eql([]);
    });

    it('handles one feature', function() {
      var vertices;
      var feature1 = {
        featureId: "feature1",
        data: {
          coordinates: [40,40]
        }
      };

      var vertex1 = new emp.editors.Vertex(feature1, "vertex");

      vertices = new emp.editors.Vertices();
      vertices.push(vertex1);

      expect(vertices.getVerticesAsLineString()).to.eql([[40,40]]);
    });

    it('handles four features', function() {
      var vertices;
      var feature1 = {
        featureId: "feature1",
        data: {
          coordinates: [40,40]
        }
      };
      var feature2 = {
        featureId: "feature2",
        data: {
          coordinates: [41,41]
        }
      };
      var feature3 = {
        featureId: "feature3",
        data: {
          coordinates: [42,40]
        }
      };

      var vertex1 = new emp.editors.Vertex(feature1, "vertex");
      var vertex2 = new emp.editors.Vertex(feature2, "vertex");
      var vertex3 = new emp.editors.Vertex(feature3, "vertex");

      vertices = new emp.editors.Vertices();
      vertices.push(vertex1);
      vertices.push(vertex2);
      vertices.push(vertex3);

      expect(vertices.getVerticesAsLineString()).to.eql([[40,40],[41,41],[42,40]]);
    });
  });
});
