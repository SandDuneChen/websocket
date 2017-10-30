let WebSocketServer = require('ws').Server;
wsServer = new WebSocketServer({ port: 8181 });
wsServer.on('connection', (server)  => {
    console.log('client connected');
    server.on('message', (message) => {
        console.log(message);
    });
});
