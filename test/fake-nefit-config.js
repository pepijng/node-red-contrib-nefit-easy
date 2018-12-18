module.exports = function(RED) {
  "use strict";
  
  function FakeNefitEasyConfigNode(n) {
      // 
      // The configuration node stores the Nefit configuration and initiates the connection to Bosch backend servers.
      //
      RED.nodes.createNode(this,n);
      
      // Get configuration parameters
      this.serialNumber = n.serialNumber; 
      this.accessKey = n.accessKey;
      this.password = n.password;
      this.timeout = n.timeout;
      
      this.connected = false;
      
      this.log('Starting Nefit Easy Node for Node-RED.');
      
      this.connecting = false;
      
      // connect
      this.log('Nefit Easy '+this.serialNumber+' connected to Bosch backend.');
      this.connected = true;
      this.log('Nefit Easy software firmware version:1.2.3.4');
      
      this.on("close", function() {
          this.connected = false;
          this.log('Nefit Easy Client disconnected from the Bosch backend.');
      });
      
      
      //
      // Command Functions
      //
      this.command = function(command,uri,value) {
          this.log('Nefit command '+command+' (param '+ uri + ' value '+value+')');
          
          //Reflect back inputs for validation
          var promise = Promise.resolve({command: command, uri: uri, value:value});

          return promise;
      }

  }
  RED.nodes.registerType("nefit-easy-config",FakeNefitEasyConfigNode);
}