var slidevs = require('./slidevs');

var firstSlidevs = slidevs({
        name: 'Stevens Slidev',
        layout: 'main-layout',
        slidesFolder: '/slides',
        styling: 'styling.css'
    });

firstSlidevs.start();