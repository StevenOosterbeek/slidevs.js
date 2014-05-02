var slidevs = require('../');

var exampleSlidevs = slidevs({
        name: 'Example Slidevs',
        layout: 'main-layout', // What is the filename of your main layout?
        slidesFolder: '/slides', // Where are your slides located?
        styling: 'styling.css', // What is the filename of your css file?
        scriptsFolder: '/scripts', // Where are your scripts located?
        imagesFolder: '/images', // Where are your images located?
        controls: {
            on: true, // Do you want to enable controls for your Slidevs?
            password: 'slidevs' // Put a string here to secure your controls with a password and false to disable password
        },
        progressBar: true, // Do you want Slidevs to show a progress bar at the top?
        port: 5000 // On which port should your Slidevs start?
    });

exampleSlidevs.start();