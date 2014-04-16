var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    es = require('event-stream'),
    rimraf = require('rimraf'),
    async = require('async'),
    colors = require('colors');

module.exports = slidevs;

// Create slidev
function slidevs(inputSettings) {

    settings = {
        name: inputSettings.name || 'Slidevs Presentation',
        layout: inputSettings.layout.toLowerCase().replace('.html', '').replace('/', '') + '.html' || 'main-layout.html',
        slidesFolder: inputSettings.slidesFolder.toLowerCase().replace(' ', '') || '/slides',
        notes: inputSettings.notes || false,
        port: inputSettings.port || 5000,
        thisFolder: path.dirname(module.parent.filename),
        slidevsFolder: path.join(path.dirname(module.parent.filename), '.slidevs')
    };

    return {
        name: function() {
            return settings.name;
        }(),
        trimmedName: function() {
            return settings.name.toLowerCase().replace(' ', '-');
        }(),
        layout: function() {
            return settings.layout;
        }(),
        slidesFolder: function() {
            return settings.slidesFolder;
        }(),
        notes: function() {
            return settings.notes;
        }(),
        port: function() {
            return settings.port;
        }(),
        thisFolder: function() {
            return settings.thisFolder;
        }(),
        slidevsFolder: function() {
            return settings.slidevsFolder;
        }(),
        start: function() {
            startSlidevs(this);
        }
    };

}

// Start slidevs
function startSlidevs(slidevs) {

    console.log('\n# Starting slidevs'.yellow);

    async.waterfall([
        function(startCallback) {
            buildSlidevs(slidevs, startCallback);
        },
        function(slidevs, startCallback) {
            createSlidevsServer(slidevs, startCallback);
        }
    ], function(err, finalSlidev) {
        if(err) showError('start async', err);
        console.log('\n\nSLIDEVS'.yellow + ' ######################################################\n'.grey);
        console.log('Your slidev \''.green + finalSlidev.name.green  + '\' has been created!'.green);
        console.log('Slides:'.bold , finalSlidev.slides.cyan);
        console.log('Controls:'.bold , finalSlidev.controls.cyan);
        console.log('\n#########################################################\n\n'.grey);
    });

}

// Build slidevs
function buildSlidevs(slidevs, startCallback) {

    console.log('\n=> Starting build'.grey);

    async.waterfall([
        function(buildCallback) {
            checkSlidevsFolder(slidevs, buildCallback);
        },
        function(slidevs, buildCallback) {
            prepareSlides(slidevs, buildCallback);
        },
        function(slidevs, buildCallback) {
            concatSlidevs(slidevs, buildCallback);
        }
    ], function(err, slidevs) {
        if(err) showError('build async', err);
        else {
            console.log('\nDone building');
            startCallback(null, slidevs);
        }
    });

}

// Manage hidden slidevs folder
function checkSlidevsFolder(slidevs, buildCallback) {

    console.log('\nChecking folder');

    function createSlidevsFolder() {
        fs.mkdir(slidevs.slidevsFolder, [], function(err) {
            if(err) showError('creating a hidden slidevs folder' + err);
            else buildCallback(null, slidevs);
        });
    }

    fs.exists(slidevs.slidevsFolder, function(exists) {
        if(exists) {
            rimraf(slidevs.slidevsFolder, function(err) {
                if(err) showError('deleting the hidden slidevs folder', err);
                createSlidevsFolder();
            });
        } else createSlidevsFolder();
    });

}

// Concat slides
function prepareSlides(slidevs, buildCallback) {

    console.log('\nPreparing slides');

    var tmpSlidesFolder = path.join(slidevs.slidevsFolder, '.slides-tmp');
    fs.mkdir(tmpSlidesFolder, 0777, function(err) {
        if (err) showError('creating hidden slides folder', err);
        else {
            fs.readdir(path.join(slidevs.thisFolder, slidevs.slidesFolder), function(err, slides) {
                if (err) showError('preparing the slides', err);
                if (slides.length < 2) showError('preparing the slides', 'You need at least two slides!');
                else {

                    concatSlides = function() {
                        slides.forEach(function(slide, index) {
                            fs.readFile(path.join(tmpSlidesFolder, slide), 'utf-8', function(err, data) {
                                if (err) showError('getting a slide for concatting', err);
                                else {
                                    fs.appendFile(path.join(tmpSlidesFolder, 'slides.html'), (data.toString() + '\n'), function(err) {
                                        if (err) showError('adding slide to temporary slides file', err);
                                        else {
                                            fs.unlink(path.join(tmpSlidesFolder, slide), function(err) {
                                                if (err) showError('deleting temporary slide file', err);
                                                else if ((index + 1) === slides.length) buildCallback(null, slidevs);
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    };

                    slides.forEach(function(slide, index) {

                        var slideFile = fs.createReadStream(path.join(slidevs.thisFolder, slidevs.slidesFolder, slide)),
                            tmpSlideFile = fs.createWriteStream(path.join(tmpSlidesFolder, slide));

                        slideFile
                            .pipe(es.through(function(s) {
                                var slide = s.toString();
                                var resultSlide = '\n<div class="slide ' + (index + 1) + '">\n' + slide;
                                this.emit('data', resultSlide);
                            }, function() {
                                this.emit('data', '\n</div>');
                                this.emit('end');
                            }))
                            .pipe(tmpSlideFile)
                            .on('error', function(err) {
                                showError('piping a slide to his temporary file', err);
                            })
                            .on('finish', function() {
                                if ((index + 1) === slides.length) concatSlides();
                            });

                    });

                }
            });
        }
    });
}

// Create slidevs presentation
function concatSlidevs(slidevs, buildCallback) {

    console.log('\nConcating presentation');

    var layout = fs.createReadStream(path.join(slidevs.thisFolder, slidevs.layout)),
        slidevsIndex = fs.createWriteStream(path.join(slidevs.slidevsFolder, 'slidevs.html'));

    fs.readFile(path.join(slidevs.slidevsFolder, '.slides-tmp', 'slides.html'), 'utf-8', function(err, slides) {
        if (err) showError('getting concatenated slides', err);
        else {
            layout.pipe(es.split('\n'))
                .pipe(es.mapSync(function(line) {
                    return line.split('\t');
                }))
                .pipe(es.mapSync(function(line) {
                    line = line[0].trim();
                    if (line.indexOf('-') === 2) line = ''; // Remove the title comment
                    if (line.indexOf('i') === 2) line = '<title>' + slidevs.name + '</title>'; // Replace title
                    if (line.indexOf('[## Slidevs ##]') > -1) line = slides; // Place slides
                    return line;
                }))
                .pipe(es.join('\n'))
                .pipe(es.wait())
                .pipe(slidevsIndex)
                .on('error', function(error) {
                    showError('importing slides', error);
                })
                .on('finish', function() {
                    rimraf(path.join(slidevs.slidevsFolder, '.slides-tmp'), function(err) {
                        if(err) showError('removing temporary slides folder', err);
                        buildCallback(null, slidevs);
                    });
                });
        }
    });

}

// Create server
function createSlidevsServer(slidevs, startCallback) {

    console.log('\n=> Creating slidevs server'.grey);

    var uri = {
            slides: '/' + slidevs.trimmedName,
            controls: '/' + slidevs.trimmedName + '/controls'
        };

    var finalSlidev = {
        name: slidevs.name,
        slides: 'http://localhost:3000' + uri.slides,
        controls: 'http://localhost:3000' + uri.controls
    };

    startCallback(null, finalSlidev);

}

// Global error function
function showError(location, message) {
    console.log('\n\nSLIDEVS'.yellow + ' ######################################################\n'.grey);
    console.log('Something went wrong during '.red + location.red + ':\n'.red + message);
    console.log('\n#########################################################\n\n'.grey);
}