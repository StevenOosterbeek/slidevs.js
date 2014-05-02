/* Slidevs controls front-end functionality, included during the build */

$(document).ready(function() {

    if ($('input.socket-connection').length !== 0) {

        var socket = io.connect($('input.socket-connection').val()),
            left = $('.left'),
            right = $('.right'),
            connection = $('.connection'),
            tapToNote = $('.note-tap'),
            saveSucces = $('.saved-message'),
            noteControls = {
                save: $('.save'),
                erase: $('.erase'),
                close: $('.close'),
            },
            slides = {
                total: 0,
                current: 1,
                currentSelectors: [ $('.current-note'), $('.current-controls') ],
                update: function(first, last) {
                    this.currentSelectors.forEach(function(selector) {
                        $(selector).empty().append(slides.current + '/' + slides.total);
                    });
                    first ? left.css({ 'opacity' : '.6' }) : left.css({ 'opacity' : '1' });
                    last ? right.css({ 'opacity' : '.6' }) : right.css({ 'opacity' : '1' });
                }
            };

        // Auth
        var cookieManager = {
            name: document.title.split('-')[0].toLowerCase().replace(' ', '').trim(),
            userAuthenticated: false,
            set: function() {
                var now = new Date(), expires;
                    now.setTime(now.getTime() + ( 24 * 60 * 60 * 1000 ));
                    expires = '; expires=' + now.toGMTString() + ';';
                document.cookie = 'sc-auth' + '=' + this.name + expires;
            },
            check: function() {
                var defer = $.Deferred(),
                    cookies = document.cookie.split('; ');
                if(cookies.length > 0) {
                    cookies.forEach(function(c, index) {
                        var cookie = c.split('=');
                        if(cookie[0] === 'sc-auth' && cookie[1] === cookieManager.name) {
                            cookieManager.userAuthenticated = true;
                            defer.resolve();
                        }
                        else if((index + 1) === cookies.length) {
                            cookieManager.userAuthenticated = false;
                            defer.resolve();
                        }
                    });
                } else defer.resolve();
                return defer.promise;
            }
        };

        var passCheck = $('.pass-check'),
            passInput = $('.pass-input'),
            passButton = $('.pass-button'),
            controlWrapper = $('.control-wrapper');

        function showControls() {
            passCheck.remove();
            controlWrapper.css({ 'display': 'block', 'opacity': '1' });
            setTimeout(function() {
                controlWrapper.css({ 'opacity' : '1' });
            }, 300);
        };

        if (passCheck.length === 0) showControls();
        $.when(cookieManager.check()).done(function() {
            if (cookieManager.userAuthenticated) showControls();
        });

        passButton.bind('click', function() {
            passButton.css({ 'opacity' : '.5' });
            socket.emit('checkPass', passInput.val());
        });

        socket.on('passChecked', function(isCorrect) {
            if(isCorrect) {
                showControls();
                cookieManager.set();
            } else {
                passInput.val('');
                passInput.css({ 'border-color' : '#D83B3B' });
                passButton.css({ 'opacity' : '1' });
            }
        });

        socket.on('totalSlides', function(ts) {
            slides.total = ts;
            slides.update(true, false);
            connection.css({ 'background-color' : '#1DC64F', 'border-color' : '#19A743' });
            connection.text('Connected!');
            setTimeout(function() {
                $('.slide-number').css({ 'opacity' : '1', 'z-index' : '1000' });
                connection.css({ 'opacity' : '0', 'z-index' : '-1000' });
            }, 1000);
        });

        socket.on('updateSlideNumber', function(slide) {
            slides.current = slide.number;
            slides.update(slide.first, slide.last);
        });

        connection.bind('click', function() {
            location.reload(true);
        });

        left.click(function() { socket.emit('slide', 'left'); });
        right.click(function() { socket.emit('slide', 'right'); });

        var notes = [], createdCanvas, createdContext;

        tapToNote.click(function() {

            if($('.orientation-warning').css('display') === 'none') {

                socket.emit('openNote');
                $('.note-canvas').css({ 'height' : '100%' });
                $('.save, .erase, .close').css({ 'opacity' : '1' });

                setTimeout(function() {

                    document.body.addEventListener('touchmove',function(event) {
                        event.preventDefault();
                    }, false);

                    if(!createdCanvas) {

                        var canvas = document.createElement('canvas');
                            canvas.setAttribute('class', 'note');
                            canvas.setAttribute('width', $('.note-canvas').width());
                            canvas.setAttribute('height', $('.note-canvas').height());
                            $('.note-canvas').append(canvas);
                            if (typeof(G_vmlCanvasManager) !== 'undefined') canvas = G_vmlCanvasManager.initElement(canvas);
                            createdCanvas = canvas;

                        var context = canvas.getContext('2d');
                            context.strokeStyle = '#4F4F4F';
                            context.lineJoin = 'round';
                            context.lineWidth = 4;
                            createdContext = context;

                    }

                    var note = {
                            draw: {
                                isDrawing: false,
                                start: function(x, y) {
                                    notes[slides.current].add(x, y);
                                    createdContext.beginPath();
                                    createdContext.moveTo(x, y);
                                    this.isDrawing = true;
                                },
                                move: function(x, y) {
                                    if (this.isDrawing) {
                                        notes[slides.current].add(x, y);
                                        createdContext.lineTo(x, y);
                                        createdContext.stroke();
                                    }
                                },
                                end: function() {
                                    notes[slides.current].add(null, null); // End of line
                                    this.isDrawing = false;
                                }
                            },
                            save: function() {

                                var createdNote = createdContext.getImageData(0, 0, $('.note-canvas').width(), $('.note-canvas').height()),
                                    compositeOperation = createdContext.globalCompositeOperation;

                                // Color background before exporting
                                createdContext.globalCompositeOperation = "destination-over";
                                createdContext.fillStyle = '#FCFCFC';
                                createdContext.fillRect(0, 0, $('.note-canvas').width(), $('.note-canvas').height());

                                socket.emit('savedNote', createdCanvas.toDataURL('image/png;base64;'));
                                noteControls.save.css({ 'opacity' : '.2' });

                            },
                            erase: function() {
                                socket.emit('erase');
                                notes[slides.current].reset();
                            },
                            close: function() {
                                $('.note-canvas').css({ 'height': '0' });
                                $('.save, .erase, .close').css({ 'opacity' : '0' });
                                createdContext.clearRect(0, 0, createdContext.canvas.width, createdContext.canvas.height);
                                noteControls.save.unbind('click');
                                socket.emit('closeNote');
                                document.body.removeEventListener('touchmove', function(event) {
                                    event.preventDefault();
                                }, false);
                            }

                        };

                    // Binding save/erase/close
                    function bindClick(which) {
                        noteControls[which].bind('click', function() {
                            if (which === 'save') noteControls[which].unbind('click');
                            var execute = note[which];
                            execute();
                        });
                    };

                    ['save', 'erase', 'close'].forEach(function(option) {
                        bindClick(option);
                    });

                    // Create or redraw note
                    if(!notes[slides.current]) {

                        notes[slides.current] = {
                            x: [], y: [],
                            add: function(x, y) {
                                this.x.push(x);
                                this.y.push(y);
                            },
                            reset: function() {
                                this.x.length = 0;
                                this.y.length = 0;
                                createdContext.clearRect(0, 0, createdContext.canvas.width, createdContext.canvas.height);
                            }
                        };

                    } else {

                        var existingNote = notes[slides.current];
                        for (var i = 0; i < existingNote.x.length; i++) {
                            createdContext.beginPath();
                            if (existingNote.x[i-1] !== null && existingNote.y[i-1] !== null) createdContext.moveTo(existingNote.x[i-1], existingNote.y[i-1]);
                            if (existingNote.x[i] - 1 !== null && existingNote.y[i] !== null) createdContext.lineTo(existingNote.x[i] - 1, existingNote.y[i]);
                            createdContext.closePath();
                            createdContext.stroke();
                        }

                    }

                    // Touch
                    createdCanvas.addEventListener('touchstart', function(event) {

                        var x = event.targetTouches[0].pageX,
                            y = event.targetTouches[0].pageY;

                        socket.emit('draw', { action: 'start', x: x, y: y });
                        note.draw.start(x, y);

                    }, false);

                    createdCanvas.addEventListener('touchmove', function(event) {

                        var x = event.targetTouches[0].pageX,
                            y = event.targetTouches[0].pageY;

                        socket.emit('draw', { action: 'move', x: x, y: y });
                        note.draw.move(x, y);

                    }, false);

                    createdCanvas.addEventListener('touchend', note.draw.end, false);

                    // Note recieved confirm
                    socket.on('noteRecieved', function() {
                        note.close();
                        saveSucces.css({ 'opacity' : '1' });
                        setTimeout(function() {
                            saveSucces.css({ 'opacity' : '0' });
                        }, 2000);
                    });

                }, 500);

            }

        });

        socket.on('refresh', function() {
            location.reload(true);
        });

    } else console.warn('No socket connection found!');

});