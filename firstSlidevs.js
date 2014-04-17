var slidevs = require('./slidevs');

var firstSlidevs = slidevs({
        name: 'Stevens Slidev',
        layout: 'main-layout', // default
        slidesFolder: '/slides', // default
        styling: 'styling.css', // default
        scriptsFolder: '/scripts', // default
        port: 5000 // default
    });

firstSlidevs.start();