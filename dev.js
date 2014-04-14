/*
    This file is being used for developing and testing slidevs
*/

var slidevs = require('./slidevs');

// Create a new slidev
var mySlidevs = slidevs({
        name: 'Stevens Slidev',
        layout: 'layout', // default is layout.html
        slidesFolder: '/slides', // default is /slides
    });

// Start the slidev
mySlidevs.start();