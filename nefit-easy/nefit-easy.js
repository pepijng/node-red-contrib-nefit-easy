/*
 * Nefit Easy Node for Node-RED
 *
*/

module.exports = function(RED) {
    "use strict";

    const Promise         = require('bluebird');
    const NefitEasyClient = require('nefit-easy-commands');
    
    function NefitEasyConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.serialNumber = n.serialNumber; 
        this.accessKey = n.accessKey;
        this.password = n.password;
    }
    RED.nodes.registerType("nefit-easy-config",NefitEasyConfigNode);
    
    function NefitEasyNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);
        
        this.topic = n.topic;
        this.command = n.command;
        this.easy = n.easy;
        
        var node = this;
        var msg = {};
    
        // Get global Nefit Easy Config (Serial, Accesskey and Passord)
        this.easyconfig = RED.nodes.getNode(this.easy);
         if (this.easyconfig) {
            node.serialNumber = this.easyconfig.serialNumber;
            node.accessKey = this.easyconfig.accessKey;
            node.password = this.easyconfig.password;
         } else {  }
        
    
        // Create Nefit Easy Client
        const client = NefitEasyClient({
                        serialNumber : node.serialNumber,
                        accessKey    : node.accessKey,
                        password     : node.password,
                        requestTimeout : 30,
                        });            
        
        
        // This will be executed on every input message
        this.on('input', function (msg) {
        
        if (node.command == 'status') {
            client.connect().then( () => {
                return Promise.all([ client.status() ]);
                }).spread((status) => {
                    msg.topic = this.topic;
                    msg.payload = {};
                    msg.payload = status;
                    this.send(msg);
                }).catch((e) => {
                    node.error(e)
                }).finally(() => {
                    //client.end();
                });

        } else if (node.command == 'pressure') {
            client.connect().then( () => {
                return Promise.all([ client.pressure() ]);
                }).spread((pressure) => {
                    msg.topic = this.topic;
                    msg.payload = {};
                    msg.payload = pressure;
                    this.send(msg);
                }).catch((e) => {
                    node.error(e)
                }).finally(() => {
                    //client.end();
                });
        } else if (node.command == 'location') {
            client.connect().then( () => {
                return Promise.all([ client.location() ]);
                }).spread((location) => {
                    msg.topic = this.topic;
                    msg.payload = {};
                    msg.payload = location;
                    this.send(msg);
                }).catch((e) => {
                    node.error(e)
                }).finally(() => {
                    //client.end();
                });
        } else if (node.command == 'program') {
            client.connect().then( () => {
                return Promise.all([ client.program() ]);
                }).spread((program) => {
                    msg.topic = this.topic;
                    msg.payload = {};
                    msg.payload = program;
                    this.send(msg);
                }).catch((e) => {
                    node.error(e)
                }).finally(() => {
                    //client.end();
                });
        } else if (node.command == 'display-code') {
            client.connect().then( () => {
                return Promise.all([ client.displayCode() ]);
                }).spread((displayCode) => {
                    msg.topic = this.topic;
                    msg.payload = {};
                    msg.payload = displayCode;
                    this.send(msg);
                }).catch((e) => {
                    node.error(e)
                }).finally(() => {
                    //client.end();
                });
        } else if (node.command == 'set-temperature') {
            client.connect().then( () => {
                return Promise.all([ client.setTemperature(Number(msg.payload)) ]);
                }).spread((setTemperature) => {
                    msg.topic = this.topic;
                    msg.payload = {};
                    msg.payload = setTemperature;
                    this.send(msg);
                }).catch((e) => {
                    node.error(e)
                }).finally(() => {
                    //client.end();
                })            
        } else if (node.command == 'flow-temperature') {
            // Read the actual flow temperature
            client.connect().then( () => {
                return client.get('/heatingCircuits/hc1/actualSupplyTemperature');
                }).then((get) => {
                    msg.topic = this.topic;
                    msg.payload = {};
                    msg.payload = get;
                    this.send(msg);
                }).catch((e) => {
                    node.error(e)
                }).finally(() => {
                    //client.end();
                });
        }
            
        });

        this.on("close", function() {
            client.end();
        });
    }
    RED.nodes.registerType("nefit-easy",NefitEasyNode);
    


}
