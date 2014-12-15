var express = require('express');
var app = express();

var childProcess = require("child_process"),
    _finalizedData = null,
    _data = [
        "satu",
        "dua",
        "tiga",
        "empat"];

var data = {
    "start":true,
    "interval": 1000,
    "content": _data
}

var init = function(){
    console.log("index.js: initialization starting");
    this._retrieveChild = childProcess.fork("./worker");

    this._retrieveChild.on('message', function(msg){
        console.log("index.js: recv'd message from background process.");
        _finalizedData = " " + msg.content.join(",");
    }.bind(this))

    this._retrieveChild.send(data);
}()

app.get('/', function(req, res){
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(_finalizedData);
    res.end();
});

app.listen(3000);
console.log("Listening on port 3000");