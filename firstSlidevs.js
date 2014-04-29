var slidevs = require('./slidevs');

var firstSlidevs = slidevs({
        name: 'Stephanie Slidevs',
        layout: 'main-layout',
        slidesFolder: '/slides',
        styling: 'styling.css',
        scriptsFolder: '/scripts',
        imagesFolder: '/images',
        controls: {
            on: true,
            password: 'slidevs'
        },
        progressBar: true,
        port: 5000
    });

firstSlidevs.start();