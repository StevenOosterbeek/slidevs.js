var slidevs = require('./slidevs');

var firstSlidevs = slidevs({
        name: 'Steven Slidevs',
        layout: 'main-layout',
        slidesFolder: '/slides',
        styling: 'styling.css',
        scriptsFolder: '/scripts',
        imagesFolder: '/images',
        controls: {
            on: false,
            password: false
        },
        progressBar: true,
        port: 5000
    });

firstSlidevs.start();