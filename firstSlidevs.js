/*
    This file is being used for developing and testing slidevs
*/

var slidevs = require('slidevs');

// Create a new slidev
var myFirstSlidev = slidevs({
        name: 'Stevens Slidev',
        layout: 'layout',
        slidesFolder: '/slides',
        notes: true
    });

// Start the slidev
myFirstSlidev.start();