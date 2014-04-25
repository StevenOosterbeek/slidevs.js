var slidevs = require('./slidevs');

var firstSlidevs = slidevs({
        name: 'Steven Slidevs',
        layout: 'main-layout', // default
        slidesFolder: '/slides', // default
        styling: 'styling.css', // default
        scriptsFolder: '/scripts', // default
        controls: {
            on: true, // default
            password: false // default is false
        },
        progressBar: true, // default
        port: 5000 // default
    });

firstSlidevs.start();