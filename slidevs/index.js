var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    es = require('event-stream'),
    rimraf = require('rimraf'),
    async = require('async'),
    watch = require('node-watch'),
    express = require('express'),
    colors = require('colors');

module.exports = slidevs;

function slidevs(inputSettings) {

    settings = {

        name: inputSettings.name || 'Slidevs Presentation',
        layout: inputSettings.layout.toLowerCase().replace('.html', '').replace('/', '') + '.html' || 'main-layout.html',
        slidesFolder: inputSettings.slidesFolder.toLowerCase().replace(' ', '') || '/slides',
        styling: inputSettings.styling ? inputSettings.styling.toLowerCase().replace('.css', '').replace('/', '') + '.css' : 'styling.css',
        scriptsFolder: inputSettings.scriptsFolder.toLowerCase().replace(' ', '') || '/scripts',
        port: inputSettings.port || 5000,
        thisFolder: path.dirname(module.parent.filename),
        slidevsFolder: path.join(path.dirname(module.parent.filename), '.slidevs'),
        running: false

    };

    return {

        // Server
        start: function(self) {
            if (self) startSlidevs(self); else startSlidevs(this);
        },
        isRunning: function() {
            return settings.running;
        },
        isNowRunning: function() {
            settings.running = true;
        },

        // Settings
        name: settings.name,
        trimmedName: settings.name.toLowerCase().replace(' ', '-'),
        layout: settings.layout,
        slidesFolder: settings.slidesFolder,
        styling: settings.styling,
        scriptsFolder: settings.scriptsFolder,
        notes: settings.notes,
        port: settings.port,

        // Folders
        thisFolder: settings.thisFolder,
        slidevsFolder: settings.slidevsFolder

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
            if(slidevs.isRunning()) startCallback(null, slidevs, null, true);
            else createSlidevServer(slidevs, startCallback);
        },
        function(slidevs, slidevsInfo, alreadyRunning, startCallback) {

            watch([
                path.join(slidevs.thisFolder, slidevs.layout),
                path.join(slidevs.thisFolder, slidevs.slidesFolder),
                path.join(slidevs.thisFolder, slidevs.styling),
                path.join(slidevs.thisFolder, slidevs.scriptsFolder)],
                function() {
                    slidevs.start(slidevs);
                });

            console.log('+ Started watching');
            startCallback(null, slidevsInfo, alreadyRunning);

        }
    ], function(err, slidevLinks, alreadyRunning) {
        if (err) showMessage('start async', err);
        else {
            console.log('\n\nSLIDEVS.JS'.yellow + ' --------------------------------------------------------------------\n'.grey);
            if (alreadyRunning) console.log('Your slidev \'' + slidevs.name.bold + '\' has been updated with your changes!');
            else {
                console.log('Your slidev \'' + slidevs.name.bold + '\' has been created!\n');
                console.log('Slides:', slidevLinks.slides.yellow);
                console.log('Controls:', slidevLinks.controls.yellow);
            }
            console.log('\n-------------------------------------------------------------------------------\n\n'.grey);
        }

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
            prepareStyling(slidevs, buildCallback);
        },
        function(slidevs, buildCallback) {
            prepareScripts(slidevs, buildCallback);
        },
        function(slidevs, buildCallback) {
            concatSlidevs(slidevs, buildCallback);
        }
    ], function(err, slidevs) {
        if (err) showMessage('build async', err);
        else {
            console.log('\n== Done building ==');
            startCallback(null, slidevs);
        }
    });

}

// Manage hidden slidevs folder
function checkSlidevsFolder(slidevs, buildCallback) {

    console.log('\nChecking folder');

    function createSlidevsFolder() {
        fs.mkdir(slidevs.slidevsFolder, [], function(err) {
            if (err) showMessage('creating a hidden slidevs folder' + err);
            else {
                console.log('+ Checking folder done');
                buildCallback(null, slidevs);
            }
        });
    }

    fs.exists(slidevs.slidevsFolder, function(exists) {
        if (exists) {
            rimraf(slidevs.slidevsFolder, function(err) {
                if (err) showMessage('deleting the hidden slidevs folder', err);
                createSlidevsFolder();
            });
        } else createSlidevsFolder();
    });

}

// Concatenating slides
function prepareSlides(slidevs, buildCallback) {

    console.log('\nPreparing slides');

    var tmpSlidesFolder = path.join(slidevs.slidevsFolder, '.slides-tmp');
    fs.mkdir(tmpSlidesFolder, 0777, function(err) {
        if (err) showMessage('creating hidden slides folder', err);
        else {
            fs.readdir(path.join(slidevs.thisFolder, slidevs.slidesFolder), function(err, slides) {
                if (err) showMessage('preparing the slides', err);
                if (slides.length < 2) showMessage('concatenating the slides', 'You need at least two slides!');
                else {
                    var slidesAreNumbered = true;
                    slides.forEach(function(slide) {
                        var fileName = slide.replace('.html', ''),
                            isNumbered = /^[0-9]/.test(fileName[fileName.length - 1]);
                        if (!isNumbered) slidesAreNumbered = false;
                    });

                    if(!slidesAreNumbered) showMessage('concatenating the slides', 'Could you please number your slides as following? > slide-1.html, slide-2.html');
                    else {

                        concatSlides = function() {

                            var slidesFile = path.join(tmpSlidesFolder, 'slides.html');

                            async.waterfall([

                                // Append first part of slider elements
                                function(slideConcatCallback) {
                                    fs.appendFile(slidesFile, '<div class="slidevs-frame">\n<div class="slidevs-strip">\n', function(err) {
                                        if (err) showMessage('appending the first elements of the slides container', err);
                                        else slideConcatCallback();
                                    });
                                },
                                // Append slides
                                function(slideConcatCallback) {
                                    slides.forEach(function(slide, index) {
                                        fs.readFile(path.join(tmpSlidesFolder, slide), 'utf-8', function(err, data) {
                                            if (err) showMessage('getting a slide for concatenation', err);
                                            else {
                                                fs.appendFile(path.join(tmpSlidesFolder, 'slides.html'), (data.toString() + '\n'), function(err) {
                                                    if (err) showMessage('adding slide to temporary slides file', err);
                                                    else {
                                                        fs.unlink(path.join(tmpSlidesFolder, slide), function(err) {
                                                            if (err) showMessage('deleting temporary slide file', err);
                                                            else if ((index + 1) === slides.length) slideConcatCallback();
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                },
                                // Append last part of slider elements
                                function(slideConcatCallback) {
                                    fs.appendFile(slidesFile, '\n</div>\n</div>', function(err) {
                                        if (err) showMessage('appending the last elements the slides container', err);
                                        else slideConcatCallback(null, slidevs);
                                    });
                                }

                            ], function(err, slidevs) {
                                if (err) showMessage('slides async', err);
                                else {
                                    console.log('+ Preparing slides done');
                                    buildCallback(null, slidevs);
                                }
                            });

                        };

                        slides.forEach(function(slide, index) {

                            var slideFile = fs.createReadStream(path.join(slidevs.thisFolder, slidevs.slidesFolder, slide)),
                                tmpSlideFile = fs.createWriteStream(path.join(tmpSlidesFolder, slide));

                            slideFile
                                .pipe(es.through(function(s) {
                                    var slide = s.toString();
                                    var resultSlide = '\n<div class="slidev">\n' + slide;
                                    this.emit('data', resultSlide);
                                }, function() {
                                    this.emit('data', '\n</div>');
                                    this.emit('end');
                                }))
                                .pipe(tmpSlideFile)
                                .on('error', function(err) {
                                    showMessage('piping a slide to his temporary file', err);
                                })
                                .on('finish', function() {
                                    if ((index + 1) === slides.length) concatSlides();
                                });

                        });

                    }
                }
            });
        }
    });
}

// Concatenating styling
function prepareStyling(slidevs, buildCallback) {

    console.log('\nPreparing styling');

    var styling = path.join(slidevs.slidevsFolder, 'slidevstyling.css');

    async.waterfall([
        function(stylingConcatCallback) {
            var slidevStyling = path.join(path.dirname(module.filename), '/vendor/slidevs.css');
            fs.readFile(slidevStyling, 'utf-8', function(err, data) {
                if (err) showMessage('getting default slidevs styling', err);
                else {
                    fs.appendFile(styling, data, function(err) {
                        if (err) showMessage('creating styling file', err);
                        else stylingConcatCallback(null, slidevs);
                    });
                }
            });
        },
        function(slidevs, stylingConcatCallback) {
            var userStyling = path.join(slidevs.thisFolder, slidevs.styling);
            fs.exists(userStyling, function(exists) {
                if (!exists) {
                    showMessage('creating the styling', 'Did you forget to add styling for the slidev?');
                    stylingConcatCallback(null, slidevs);
                } else {
                    fs.readFile(userStyling, 'utf-8', function(err, data) {
                        if (err) showMessage('getting users slidevs styling', err);
                        else {
                            fs.appendFile(styling, '\n\n' + data, function(err) {
                                if (err) showMessage('adding user styling to styling file', err);
                                else stylingConcatCallback(null, slidevs);
                            });
                        }
                    });
                }
            });
        }
    ], function(err, slidevs) {
        if (err) showMessage('styling async', err);
        else {
            console.log('+ Concatenating styling done');
            buildCallback(null, slidevs);
        }
    });

}

// Concatenating styling
function prepareScripts(slidevs, buildCallback) {

    console.log('\nPreparing scripts');

    var slidevScriptFile = path.join(slidevs.slidevsFolder, 'slidevs.js');

    var addScripts = function(which, slidevs, scriptsConcatCallback) {
        if(which === 'jQuery') {
            fs.readFile(path.join(path.dirname(module.filename) + '/vendor/jquery-v1.11.0.js'), 'utf-8', function(err, data) {
                if (err) showMessage('getting jQuery script for concatenation', err);
                else {
                    fs.appendFile(slidevScriptFile, (data.toString() + '\n'), function(err) {
                        if (err) showMessage('adding jQuery script to temporary slidevs.js file', err);
                        else scriptsConcatCallback(null, slidevs);
                    });
                }
            });
        } else {
            var filesLocation = (which === 'slidevs') ? path.dirname(module.filename) + '/vendor' : path.join(slidevs.thisFolder, slidevs.scriptsFolder);
            fs.readdir(filesLocation, function(err, scripts) {
                if (err) showMessage('reading ' + which + ' scripts folder', err);
                else {
                    scripts.forEach(function(script, index) {
                        if(script !== '.DS_Store' && script.substr(0, 6) !== 'jquery' && script.split('.')[1] === 'js') {
                            fs.readFile(path.join(filesLocation, script), 'utf-8', function(err, data) {
                                if (err) showMessage('getting a ' + which + ' script for concatenation', err);
                                else {
                                    fs.appendFile(slidevScriptFile, (data.toString() + '\n'), function(err) {
                                        if (err) showMessage('adding ' + which + ' script to temporary slidevs.js file', err);
                                        if ((index + 1) === scripts.length) scriptsConcatCallback(null, slidevs);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    };

    async.waterfall([
        function(scriptsConcatCallback) {
            fs.writeFile(slidevScriptFile, '', function(err) {
                if (err) showMessage('creating the slidev.js file', err);
                else scriptsConcatCallback(null, slidevs);
            });
        },
        function(slidevs, scriptsConcatCallback) {
            addScripts('jQuery', slidevs, scriptsConcatCallback); // Adding jQuery quaranteed on top
        },
        function(slidevs, scriptsConcatCallback) {
            addScripts('slidevs', slidevs, scriptsConcatCallback);
        },
        function(slidevs, scriptsConcatCallback) {
            addScripts('user', slidevs, scriptsConcatCallback);
        }
    ], function(err, slidevs) {
        if (err) showMessage('scripts async', err);
        else {
            console.log('+ Concatenating scripts done');
            buildCallback(null, slidevs);
        }
    });

}

// Create slidevs presentation
function concatSlidevs(slidevs, buildCallback) {

    console.log('\nConcatenating presentation');

    var layout = fs.createReadStream(path.join(slidevs.thisFolder, slidevs.layout)),
        slidevsIndex = fs.createWriteStream(path.join(slidevs.slidevsFolder, 'slidevs.html'));

    fs.readFile(path.join(slidevs.slidevsFolder, '.slides-tmp', 'slides.html'), 'utf-8', function(err, slides) {
        if (err) showMessage('getting concatenated slides', err);
        else {
            layout.pipe(es.split('\n'))
                .pipe(es.mapSync(function(line) {
                    return line.split('\t');
                }))
                .pipe(es.mapSync(function(line) {
                    line = line[0].trim();
                    if (line.indexOf('t') === 2) line = '<html class="no-js">';
                    if (line.indexOf('i') === 2) line = '<title>' + slidevs.name + '</title>';
                    if (line.indexOf('[## Assets ##]') > -1) line = '<link rel="stylesheet" type="text/css" href="slidevstyling.css" />\n<script type="text/javascript" src="slidevs.js"></script>';
                    if (line.indexOf('[## Slidevs ##]') > -1) line = slides;
                    return line;
                }))
                .pipe(es.join('\n'))
                .pipe(es.wait())
                .pipe(slidevsIndex)
                .on('error', function(error) {
                    showMessage('importing slides', error);
                })
                .on('finish', function() {
                    rimraf(path.join(slidevs.slidevsFolder, '.slides-tmp'), function(err) {
                        if (err) showMessage('removing temporary slides folder', err);
                        else {
                            console.log('+ Concatenating presentation done');
                            buildCallback(null, slidevs);
                        }
                    });
                });
        }
    });

}

// Create server
function createSlidevServer(slidevs, startCallback) {

    console.log('\n=> Creating slidevs server'.grey);

    var uris = {
            slides: '/' + slidevs.trimmedName,
            controls: '/' + slidevs.trimmedName + '/controls'
        };

    var slidevsLinks = {
        slides: 'http://localhost:' + slidevs.port + uris.slides,
        controls: 'http://localhost:' + slidevs.port + uris.controls
    };

    var app = express(),
        slidevController = require('./controllers/slidev-controller'),
        controlController = require('./controllers/control-controller');

    app.use(express.static(slidevs.slidevsFolder));
    app.set('slidevsFolder', function() {
        return slidevs.slidevsFolder;
    }());

    app.get(uris.slides, slidevController.serve);
    app.get(uris.controls, controlController.serve);

    app.listen(slidevs.port);

    slidevs.isNowRunning();

    console.log('\n+ Done creating server');

    startCallback(null, slidevs, slidevsLinks, false);

}

// Global message
function showMessage(location, message) {
    console.log('\n\nSLIDEVS.JS'.red + ' --------------------------------------------------------------------\n'.grey);
    console.log('Something went wrong during '.grey + location.grey + ':\n'.grey + message);
    console.log('\n-------------------------------------------------------------------------------\n\n'.grey);
}