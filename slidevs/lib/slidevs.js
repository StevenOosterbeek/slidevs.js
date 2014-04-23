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

    if ($('input.socket-connection').length !== 0) {

        var socket = io.connect($('input.socket-connection').val());

        socket.on('executeSlide', function(direction) {
            slidevs.slide(direction);
            socket.emit('updateSlideNumber', {
                number: (slidevs.currentSlide + 1),
                first: slidevs.isFirstSlide(),
                last: slidevs.isLastSlide()
            });
        });

        socket.on('refresh', function() {
            location.reload(true);
        });

    }

});