## Nefit Easy™ Node-RED Node

This Node-RED Node is based on the <a href="https://github.com/robertklep/nefit-easy-client">Nefit Easy™ client library build by Robert Klep</a>

## Please be considerate!

Use this library in moderation: don't flood the backend with new connections made every X seconds. Instead, if you want to poll the backend for data, create a connection once and reuse it for each command. In the end, it's your own responsibility to not get blocked because of excessive (ab)use.

## Installation

```
$ npm -g i node-red-contrib-nefit-easy
```
