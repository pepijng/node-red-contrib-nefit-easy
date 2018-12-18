var should = require("should");
var helper = require("node-red-node-test-helper");

var sutNode = require("../nefit-easy.js");
var configNode = require("./fake-nefit-config.js");

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

  // [{"id":"f3635f65.b4beb","type":"nefit-easy","z":"e455af83.8e81c",
  // "easyconfig":"31304d70.bddaf2",
  // "name":"",
  // "topic":"nefit-easy",
  // "command":"set-temperature",
  // "value":"","x":420,"y":120,"wires":[["fadbf29d.4048e"]]},
  // {"id":"31304d70.bddaf2",
  //"type":"nefit-easy-config","z":"",
  //"serialNumber":"757921601","accessKey":"ExG3ZEZwmat3fBvv","password":"hc2riCVW","timeout":"30"}]

  it('should pass the configured value if defined', function (done) {
    var flow = [
        { id:"f1", type:"tab", label:"Test flow"},
        { id: "c1", z:"", type:"nefit-easy-config",
          serialNumber:"123456789",
          accessKey:"secretAccessKey",
          password:"secretPassword",
          timeout:"30"},
        { id: "n1", z:"f1", type: "nefit-easy",
          command : "set-temperature",
          value : "18", 
          name: "nefit-easy",
          easyconfig: "c1",
          wires:[["n2"]] },
        { id: "n2", z:"f1", type: "helper" }
      ];

    
    helper.load([sutNode, configNode], flow, function () {
      try
      {          
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      var c1 = helper.getNode("c1");

      n2.on("input", function (msg) {
        try
        {
          msg.should.have.propertyByPath('payload', 'value').eql("18");
          done();
        }
        catch(err)
        {
          done(err);
        }
      });

      n1.receive({ payload: "xyz" });
      }
      catch(err)
      {
        done(err);
      }  
    });
  });
  
  it('should pass the payload if value not defined', function (done) {
    var flow = [
        { id:"f1", type:"tab", label:"Test flow"},
        { id: "c1", z:"", type:"nefit-easy-config",
          serialNumber:"123456789",
          accessKey:"secretAccessKey",
          password:"secretPassword",
          timeout:"30"},
        { id: "n1", z:"f1", type: "nefit-easy",
          command : "set-temperature",
          value : "", 
          name: "nefit-easy",
          easyconfig: "c1",
          wires:[["n2"]] },
        { id: "n2", z:"f1", type: "helper" }
      ];

    
    helper.load([sutNode, configNode], flow, function () {
      try
      {          
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");

      n2.on("input", function (msg) {
        try
        {
          msg.should.have.propertyByPath('payload', 'value').eql("xyz");
          done();
        }
        catch(err)
        {
          done(err);
        }
      });

      n1.receive({ payload: "xyz" });
      }
      catch(err)
      {
        done(err);
      }  
    });
  });

  it('should pass the latest payload on each receive if value not defined', function (done) {
    var flow = [
        { id:"f1", type:"tab", label:"Test flow"},
        { id: "c1", z:"", type:"nefit-easy-config",
          serialNumber:"123456789",
          accessKey:"secretAccessKey",
          password:"secretPassword",
          timeout:"30"},
        { id: "n1", z:"f1", type: "nefit-easy",
          command : "set-temperature",
          value : "", 
          name: "nefit-easy",
          easyconfig: "c1",
          wires:[["n2"]] },
        { id: "n2", z:"f1", type: "helper" }
      ];

    
    helper.load([sutNode, configNode], flow, function () {
      try
      {          
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");

      var msgCount = 0;
      n2.on("input", function (msg) {
        try
        {
          msgCount++;
          if(msgCount==1)
          {
            msg.should.have.propertyByPath('payload', 'value').eql("xyz");
          }
          if(msgCount==2)
          {
            msg.should.have.propertyByPath('payload', 'value').eql("abc");
            done();
          }
        }
        catch(err)
        {
          done(err);
        }
      });

      n1.receive({ payload: "xyz" });
      n1.receive({ payload: "abc" });
      }
      catch(err)
      {
        done(err);
      }  
    });
  });

});