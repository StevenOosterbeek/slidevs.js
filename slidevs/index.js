var async = require('async'),
    colors = require('colors');

module.exports = slidevs;

// Create slidev
function slidevs(inputSettings) {

    // Settings
    settings = {
        name: inputSettings.name.toLowerCase().replace(' ', '-') || 'slidevs-presentation',
        layout: inputSettings.layout.toLowerCase().replace('.html', '') + '.html' || 'layout.html',
        slidesFolder: inputSettings.slidesFolder.toLowerCase().replace(' ', '') || '/slides',
    };

    return {

        // Starter
        start: function() {
            startSlidevs(this);
        }

    };

}

// Start slidevs
function startSlidevs(slidevs) {

    async.waterfall([
        function(callback) {
            buildPresentation(slidevs, callback);
        },
        function(slidevs, built, buildError, callback) {
            createPresentationServer(slidevs, built, buildError, callback);
        }
    ], function(err, links, startError) {
        console.log('\n\n################## SLIDEVS ##################\n'.grey);
        if(err) {
            console.log('Something went wrong during the start:'.red);
            console.log('There was an async error:', err);
        }

        // IF ELSE ERROR

        else if(startError) {
            console.log('Something went wrong during the start:'.red);
            console.log(startError);
        } else {
            console.log('Building your slidev is done!\n'.green);
            console.log('Presentation:'.bold , links.slides.cyan);
            console.log('Controls:'.bold , links.controls.cyan);
        }
        console.log('\n#############################################\n\n'.grey);
    });

}

// Build slidevs
function buildPresentation(slidevs, callback) {

    // Build slidevs here

    callback(null, slidevs, true, null);

    // If something went wrong:
    // callback(null, null, false, 'Build error');

}

// Create server
function createPresentationServer(slidevs, built, startError, callback) {

    if(!built) callback(null, false, startError);
    else {

        var presentationURIs = {
                slides: '/' + slidevs.name,
                controls: '/' + slidevs.name + '/controls'
            };

        var presentationLinks = {
            slides: 'http://localhost:3000/name',
            controls: 'http://localhost:3000/controls'
        };

        callback(null, presentationLinks, null);

        // If something went wrong:
        // callback(null, null, 'Server error');

    }

}