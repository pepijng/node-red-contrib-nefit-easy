//
// Nefit Easy Node for Node-RED
// -------------------------------------------------------------------------------------------------------------------
//

module.exports = function(RED) {
    "use strict";

    var EasyClient = require('nefit-easy-commands');
    
    
    function NefitEasyConfigNode(n) {
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
        this.connecting = false;
        
        this.log('Starting Nefit Easy Node for Node-RED.');

        // Start connection to Bosch backend servers.
        const client = EasyClient(
        {
                        serialNumber : this.serialNumber,
                        accessKey    : this.accessKey,
                        password     : this.password,
                        requestTimeout : 30000,
        });
        
        this.connecting = false;
        
        // connect
        client.connect().then(() => {
            this.connecting = true;
            this.log('Nefit Easy '+this.serialNumber+' connected to Bosch backend.');
            
            // Connected to Nefit thermostat and get firmware version. 
            return client.get('/gateway/versionFirmware');
        }).then((get) => {
            //this.log(JSON.stringify(get))
            this.connected = true;
            this.log('Nefit Easy software firmware version: '+ get.value)
        }).catch((err) => {
            this.error('Nefit initialization : '+err);
        });
        
        this.on("close", function() {
            // Close connection to Bosch backend
            client.end()
            this.connected = false;
            this.log('Nefit Easy Client disconnected from the Bosch backend.');
        });
        
        
        //
        // Command Functions
        //
        this.command = function(command,uri,value) {
            this.log('Nefit command '+command+' (param '+ uri + ' value '+value+')');
            var promise = null;

            switch (command) {
                case 'display-code':
                    command = 'displayCode';
                // fall-through
                case 'status'   :
                case 'pressure' :
                case 'location' :
                case 'program'  :
                    promise = client[command]();
                    break;

                case 'set-temperature':
                    promise = client.setTemperature(Number(value));
                    break;

                case 'flow-temperature':
                      promise = client.get('/heatingCircuits/hc1/actualSupplyTemperature').then((r) => {
                        return { temperature : r.value, unit : r.unitOfMeasure }
                       });
                    //promise = client.get('/heatingCircuits/hc1/actualSupplyTemperature');
                    break;

                default:
                    return;
                }

                return promise;
        }

    }
    RED.nodes.registerType("nefit-easy-config",NefitEasyConfigNode);
// ------------------------------------------------------------------------------------------
    function NefitEasyNode(n) {
    //
    // Nefit Easy Input Node
    //
        
        // Create a RED node
        RED.nodes.createNode(this,n);
        
        this.topic = n.topic;
        this.command = n.command;
        this.easyconfig = n.easyconfig;
        
        // Get configuration data an initialize Netfit Easy Client from Configuration Node
        this.easy = RED.nodes.getNode(this.easyconfig);

        var node = this;
        var msg = {};
  
        // This will be executed on every input message
        this.on('input', function (msg) {
        
        node.uri = null;
        node.value = null;
            
        // Set-Temperature needs additional variables
        if (node.command == 'set-temperature') {
            node.value = msg.payload;
        }
                
        // Execute command and generate MQTT message
        this.easy.command(node.command, node.uri, node.value).then((data) => {
            msg.topic   = this.topic;
            msg.payload = data;
            this.send(msg);
        }).catch((e) => {
            
            switch (e) {
                case 'REQUEST_TIMEOUT':
                    node.warn('Nefit Command '+node.command+' : '+e);
                    break;
                    
                default:
                    node.error(e);
                    return;
            }
        });
            
        });
        this.on("close", function() {
        });
    }
    RED.nodes.registerType("nefit-easy",NefitEasyNode);
}
