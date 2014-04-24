/*
    Slidevs front-end functionality, included during the build
*/

$(document).ready(function() {

    var slidevs = {
        strip: $('.slidevs-strip'),
        slides: $('.slidev'),
        totalSlides: $('.slidev').length,
        currentSlide: 0,
        isSliding: false,
        progress: $('.progress'),
        notes: [],
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
        isLastSlide: function() {
            return ((this.currentSlide + 2) > this.totalSlides);
        },
        isFirstSlide: function() {
            return (this.currentSlide < 1);
        },
        slide: function(direction) {
            if (!this.isSliding) {
                var distance = parseInt(this.strip.css('left').replace('px', ''), 10);
                switch(direction) {
                    case 'right':
                        if(!this.isLastSlide()) {
                            this.isSliding = true;
                            distance -= this.getFrameWidth();
                            this.currentSlide++;
                        }
                        break;
                    case 'left':
                        if(!this.isFirstSlide()) {
                            this.isSliding = true;
                            distance += this.getFrameWidth();
                            this.currentSlide--;
                        }
                        break;
                    default:
                        distance = 0;
                        console.warn('Slidevs does not know in which direction to slide!');
                }
                this.strip.css({ 'left' : distance });
                this.adjustProgress();
                setTimeout(function() { slidevs.isSliding = false; }, 500); // Wait till the CSS animation is over
            }
        },
        openNote: function() {

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
            $(this.slides[this.currentSlide]).find('.note-canvas').css({ 'height' : '0' });
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

        var socket = io.connect($('input.socket-connection').val());

        socket.on('askTotalSlides', function() {
            socket.emit('totalSlides', slidevs.totalSlides);
        });

        socket.on('executeSlide', function(direction) {
            slidevs.slide(direction);
            socket.emit('updateSlideNumber', {
                number: (slidevs.currentSlide + 1),
                first: slidevs.isFirstSlide(),
                last: slidevs.isLastSlide()
            });
        });

        // Notes
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

        socket.on('refresh', function() {
            location.reload(true);
        });

    }

});