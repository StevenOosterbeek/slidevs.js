var express = require('express'),
    socketio = require('socket.io');

exports = module.exports = function(uris, slidevs) {

    var slidevServer = express(),
        controlServer = express();

    var servers = [
        { name: 'slides', server: slidevServer, socket: null },
        { name: 'controls', server: controlServer, socket: null }
    ];

    servers.forEach(function(serverObject) {
        serverObject.server.use(express.static(slidevs.slidevsFolder));
    });

    servers.forEach(function(serverObject) {
        serverObject.server.get(uris[serverObject.name], function(req, res) {
            var name = serverObject.name === 'slides' ? 'slidevs' : serverObject.name;
            res.sendfile(slidevs.slidevsFolder + '/' + name + '.html');
        });
    });

    var controlsIO = require('socket.io').listen(controlServer.listen(slidevs.socketPort)).set('log level', 0),
        slidevsIO = require('socket.io').listen(slidevServer.listen(slidevs.port)).set('log level', 0);

    // Controls > slidevs
    controlsIO.sockets.on('connection', function(socket) {
        var controlSocket = servers[1].socket = socket,
            slidevSocket = servers[0].socket;
        socket.on('slide', function(direction) {
            if(slidevSocket !== null) slidevSocket.emit('executeSlide', direction);
        });
    });

    // Slidevs > controls
    slidevsIO.sockets.on('connection', function(socket) {
        servers[0].socket = socket;
    });

};