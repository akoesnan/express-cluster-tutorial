var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {
    // Count the machine's CPUs, and create a worker for each CPU
    var cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
    // Listen for dying workers, recreate new one if it dies!
    cluster.on('exit', function (worker) {
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });
// if we are int the child process, bind to the port
} else {
    var express = require('express');
    var app = express();

    app.get('/', function (req, res) {
        console.log('Worker ' + cluster.worker.id + " is partying");
        res.send('Hello from Worker ' + cluster.worker.id);
    });

    // Bind to a port
    app.listen(3000);
    console.log('Worker ' + cluster.worker.id + ' running!');
}
