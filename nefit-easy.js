/*

Nefit Easy Node for Node-RED
-------------------------------------------------------------------------------------------------------------------
Copyright (c) 2016 Pepijn Goossens
Copyright (c) 2018 Raimond Brookman (forked from Pepijn's repository to make it work again)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

module.exports = function(RED) {
    function NefitEasyNode(n) {
    //
    // Nefit Easy Input Node
    //
        this.RED = RED;
        // Create a RED node
        this.RED.nodes.createNode(this,n);
        
        this.topic = n.topic;
        this.command = n.command;
        this.configuredValue = n.value;
        this.easyconfig = n.easyconfig;
        

        // Get configuration data an initialize Netfit Easy Client from Configuration Node
        this.easy = this.RED.nodes.getNode(this.easyconfig);

        var node = this;
        var msg = {};
  
        // This will be executed on every input message
        this.on('input', function (msg) {
        
        node.uri = null;
        
        if (this.easy.connected) {
            this.status({fill:"green",shape:"ring",text:"connected"});
            
        // Set-commands needs additional variables coming from static config or the payload
        if (node.command.startsWith('set-') || node.command.startsWith('getval-')) {
            //Only use payload if value has not been configured
            if(node.configuredValue)
            {
                node.value = node.configuredValue;    
            }
            else if (msg.payload)
            {
                node.value = msg.payload;
            }
            else
            {
                node.value = undefined;
            }            
        }
                
        // Execute command and generate message
        this.status({fill:"yellow",shape:"ring",text:"communicating"});
        this.easy.command(node.command, node.uri, node.value).then((data) => {
            msg.topic   = this.topic;
            msg.payload = data;
            this.send(msg);
            this.status({fill:"green",shape:"ring",text:"connected"});
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

        } else {
            this.status({fill:"red",shape:"ring",text:"disconnected"});
        }
            
        });
        this.on("close", function() {
        });
    }
    RED.nodes.registerType("nefit-easy",NefitEasyNode);
}