var should = require("should");
var helper = require("node-red-node-test-helper");

var sutNode = require("../nefit-easy.js");

helper.init(require.resolve('node-red'));

describe('nefit-easy Node', function () {

  beforeEach(function (done) {
      helper.startServer(done);
  });

  afterEach(function (done) {
      helper.unload();
      helper.stopServer(done);
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "nefit-easy", name: "nefit-easy" }];
    helper.load(sutNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'nefit-easy');
      done();
    });
  });
  
});