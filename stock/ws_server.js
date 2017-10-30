var WebSocketServer = require('ws').Server;

var stocks = {
    "AAPL": 95.0,
    "MSFT": 50.0,
    "AMZN": 300.0,
    "GOOG": 550.0,
    "YHOO": 35.0
};
function randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
var stockUpdater;
var randomStockUpdater = function() {
    for (var symbol in stocks) {
        if(stocks.hasOwnProperty(symbol)) {
            var randomizedChange = randomInterval(-150, 150);
            var floatChange = randomizedChange / 100;
            stocks[symbol] += floatChange;
        }
    }
    var randomMSTime = randomInterval(500, 2500);
    stockUpdater = setTimeout(function() {
        randomStockUpdater();
    }, randomMSTime);
}
randomStockUpdater();
var clientStocks = [];
wsServer = new WebSocketServer({ port: 8181 });
wsServer.on('connection', function (server) {
    var sendStockUpdates = function (server) {
        if (server.readyState == 1) {
            var stocksObj = {};
            for (var i = 0; i < clientStocks.length; i++) {
              var symbol = clientStocks[i];
                stocksObj[symbol] = stocks[symbol];
            }
            if (stocksObj.length !== 0) {
                server.send(JSON.stringify(stocksObj));
                console.log("Update: ", JSON.stringify(stocksObj));
            }

        }
    }

    var clientStockUpdater = setInterval(function () {
        sendStockUpdates(server);
    }, 1000);

    server.on('message', function (message) {
        var stockRequest = JSON.parse(message);
        console.log("Receive Message: ", stockRequest);
        clientStocks = stockRequest['stocks'];
        sendStockUpdates(server);
    });

    server.on('close', function () {
        if (typeof clientStockUpdater !== 'undefined') {
            clearInterval(clientStockUpdater);
        }
    });
});
