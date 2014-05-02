/* Slidevs front-end functionality, included during the build */

$(document).ready(function() {

    var slidevs = {
        strip: $('.slidevs-strip'),
        slides: $('.slidev'),
        totalSlides: $('.slidev').length,
        currentSlide: 0,
        isSliding: false,
        beingControlled: false,
        progress: $('.progress'),
        notes: [],
        noteIsOpen: false,
        socket: null,
        adjustProgress: function() {
            this.progress.css({ 'width' : ((100 / this.totalSlides) * (this.currentSlide + 1)) + '%' });
        },
        getFrameWidth: function() {
            return $('.slidevs-frame').width();
        },
        resize: function() {
            this.strip.css({ 'width' : (this.totalSlides * this.getFrameWidth()) });
            this.slides.each(function(slide) {
                $(slidevs.slides[slide]).css({ 'width' : slidevs.getFrameWidth(), 'max-width' : slidevs.getFrameWidth() });
            });
            this.strip.css({ 'left' : '-' + (this.currentSlide * this.getFrameWidth()) + 'px' });
            this.adjustProgress();
        },
        openNote: function() {

            this.noteIsOpen = true;
            $(this.slides[this.currentSlide]).find('.note-canvas').css({ 'height' : '100%' });

            setTimeout(function() {

                var canvasWrapper = $($('.note-canvas')[slidevs.currentSlide]);

                if(canvasWrapper[0].childElementCount === 0) {

                    var canvas = document.createElement('canvas');
                        canvas.setAttribute('class', 'note');
                        canvas.setAttribute('width', canvasWrapper.width());
                        canvas.setAttribute('height', canvasWrapper.height());
                        canvasWrapper.append(canvas);
                        if (typeof(G_vmlCanvasManager) !== 'undefined') canvas = G_vmlCanvasManager.initElement(canvas);

                    var context = canvas.getContext('2d');
                        context.strokeStyle = '#4F4F4F';
                        context.lineJoin = 'round';
                        context.lineWidth = 4;

                    if (!slidevs.notes[slidevs.currentSlide]) slidevs.notes[slidevs.currentSlide] = context;

                }

            }, 500);

        },
        closeNote: function() {
            this.noteIsOpen = false;
            $(this.slides[this.currentSlide]).find('.note-canvas').css({ 'height' : '0' });
        },
        isLastSlide: function() {
            return ((this.currentSlide + 2) > this.totalSlides);
        },
        isFirstSlide: function() {
            return (this.currentSlide < 1);
        },
        slide: function(direction, controls) {

            if (!this.isSliding && !this.noteIsOpen) {
                if (this.beingControlled) {
                    if (controls) executeSlide();
                } else executeSlide();
            }

            function executeSlide() {

                var distance = parseInt(slidevs.strip.css('left').replace('px', ''), 10);
                switch(direction) {
                    case 'right':
                        if(!slidevs.isLastSlide()) {
                            slidevs.isSliding = true;
                            distance -= slidevs.getFrameWidth();
                            slidevs.currentSlide++;
                        }
                        break;
                    case 'left':
                        if(!slidevs.isFirstSlide()) {
                            slidevs.isSliding = true;
                            distance += slidevs.getFrameWidth();
                            slidevs.currentSlide--;
                        }
                        break;
                    default:
                        distance = 0;
                        console.warn('Slidevs does not know in which direction to slide!');
                }

                if (slidevs.socket !== null) {
                    slidevs.socket.emit('updateSlideNumber', {
                        number: (slidevs.currentSlide + 1),
                        first: slidevs.isFirstSlide(),
                        last: slidevs.isLastSlide()
                    });
                }

                slidevs.strip.css({ 'left' : distance });
                slidevs.adjustProgress();
                setTimeout(function() { slidevs.isSliding = false; }, 500); // Wait till the CSS animation is over

            }

        }
    };

    slidevs.resize();

    $(document).keydown(function(e) {
        if (e.which === 37) slidevs.slide('left');
        if (e.which === 39) slidevs.slide('right');
    });

    $(window).resize(function() {
        slidevs.resize();
    });

    // Socket
    if ($('input.socket-connection').length !== 0) {

        slidevs.beingControlled = true;

        var socket = slidevs.socket = io.connect($('input.socket-connection').val());

        socket.on('askTotalSlides', function() {
            socket.emit('totalSlides', slidevs.totalSlides);
        });

        socket.on('executeSlide', function(direction) {
            slidevs.slide(direction, true);
        });

        socket.on('openNote', function() {
            slidevs.openNote();
        });

        socket.on('closeNote', function() {
            slidevs.closeNote();
        });

        socket.on('draw', function(coors) {

            var context = slidevs.notes[slidevs.currentSlide];
            if (coors.action === 'start') {
                context.moveTo(coors.x, coors.y);
                context.stroke();
            } else if (coors.action === 'move') {
                context.lineTo(coors.x, coors.y);
                context.stroke();
            } else {
                console.warn('Action of drawing is incorrect!');
            }

        });

        socket.on('erase', function() {
            var context = slidevs.notes[slidevs.currentSlide];
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                context.beginPath();
        });

        socket.on('savedNote', function(note) {
            var link = document.createElement('a'), e,
                date = new Date(), minutes = date.getMinutes().toString(), hours = date.getHours().toString(), day = date.getDate().toString(), month = (date.getMonth() + 1).toString(), year = date.getFullYear().toString();
                imageDate = day + '-' + month + '-' + year + '_' + hours + '-' + minutes;
            link.download = document.title.replace(' ', '').toLowerCase().trim() + '-slide-' + (slidevs.currentSlide + 1) + '_' + imageDate + '.png';
            link.href = note;
            if (document.createEvent) {
                e = document.createEvent('MouseEvents');
                e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                link.dispatchEvent(e);
                socket.emit('recievedNote');
            } else if (link.fireEvent) {
                link.fireEvent('onclick');
                socket.emit('recievedNote');
            }
        });

        socket.on('refresh', function() {
            location.reload(true);
        });

    }

// Closing will be added after adding user scripts