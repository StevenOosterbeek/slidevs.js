var slidevs = require('./slidevs');

var firstSlidevs = slidevs({
        name: 'Stevens Slidevs',
        layout: 'main-layout', // default
        slidesFolder: '/slides', // default
        styling: 'styling.css', // default
        scriptsFolder: '/scripts', // default
        progressBar: true, // default
        port: 5000 // default
    });

firstSlidevs.start();