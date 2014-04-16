var slidevs = require('./slidevs');

var firstSlidevs = slidevs({
        name: 'Stevens Slidev',
        layout: 'main-layout', // also default
        slidesFolder: '/slides', // also default
        styling: 'styling.css', // also default
        port: 5000 // also default
    });

firstSlidevs.start();