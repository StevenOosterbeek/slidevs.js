var express = require('express'),
    socketio = require('socket.io');

exports = module.exports = function(uris, slidevs) {

    var slidevServer = express(),
        controlServer = express();

    var servers = [
        { name: 'slides', server: slidevServer },
        { name: 'controls', server: controlServer }
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

    var controlSocket = socketio.listen(controlServer.listen(slidevs.socketPort)).set('log level', 0),
        slidevSocket = socketio.listen(slidevServer.listen(slidevs.port)).set('log level', 0);

    slidevSocket.sockets.on('connection', function(ssocket) {

        controlSocket.sockets.on('connection', function(csocket) {

            csocket.on('slide', function(direction) {
                ssocket.emit('executeSlide', direction);
            });

            ssocket.on('updateSlideNumber', function(slideUpdate) {
                csocket.emit('updateSlideNumber', slideUpdate);
            });

            // Disconnecting
            csocket.on('disconnect', function() {
                ssocket.emit('refresh');
            });

            ssocket.on('disconnect', function() {
                csocket.emit('refresh');
            });

        });

        slidevs.isNowRunning();

    });

};