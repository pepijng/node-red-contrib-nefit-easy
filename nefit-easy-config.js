/*
Nefit Easy Node for Node-RED
-------------------------------------------------------------------------------------------------------------------
Copyright (c) 2018 Raimond Brookman

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

module.exports = function(RED) {
    "use strict";
    //
    // Use Robert Klep's Nefit Easy Library (https://github.com/robertklep/nefit-easy-commands)
    //
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
            this.log('Nefit Easy '+this.serialNumber+' connected to Bosch backend.');
            // Connected to Nefit thermostat and get firmware version. 
            return client.get('/gateway/versionFirmware');
        }).then((get) => {
            //this.log(JSON.stringify(get))
            // Your Easy returned it's firmware, change status to connected.
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
                
                case 'get-usermode':
                    promise = client.userMode();
                    break;

                case 'set-usermode':
                    promise = client.setUserMode(value);
                    break;

                case 'set-temperature':
                    promise = client.setTemperature(value);
                    break;

                case 'set-fireplacemode':
                    promise = client.setFireplaceMode(value);
                    break;

                case 'flow-temperature':
                      promise = client.get('/heatingCircuits/hc1/actualSupplyTemperature').then((r) => {
                        return { temperature : r.value, unit : r.unitOfMeasure }
                       });
                    break;

                case 'getval-gasusage':
                    promise = client.gasUsage(value);
                    break;

                case 'gasusagepage' :
                    promise = client.gasUsagePage();
                    break;
  
                default:
                    return;
                }

                return promise;
        }

    }
    RED.nodes.registerType("nefit-easy-config",NefitEasyConfigNode);
}