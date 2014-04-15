/*
    This file is being used for developing and testing slidevs
*/

var slidevs = require('slidevs');

var firstSlidevs = slidevs({
        name: 'Stevens Slidev',
        layout: 'layout',
        slidesFolder: '/slides',
        notes: true
    });

firstSlidevs.start();