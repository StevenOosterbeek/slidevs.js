/*
    Slidevs.js front-end, included during the build.
*/

$(document).ready(function() {

    var slidevs = {
        strip: $('.slidevs-strip'),
        slides: $('.slidev'),
        totalSlides: $('.slidev').length,
        currentSlide: 0,
        isSliding: false,
        getFrameWidth: function() {
            return $('.slidevs-frame').width();
        },
        resize: function() {
            this.strip.css({ 'width' : (this.totalSlides * this.getFrameWidth()) });
            this.slides.each(function(slide) {
                $(slidevs.slides[slide]).css({ 'width' : slidevs.getFrameWidth() });
            });
            this.strip.css({ 'left' : '-' + (this.currentSlide * this.getFrameWidth()) + 'px' });
        },
        slide: function(direction) {
            if(!this.isSliding) {
                this.isSliding = true;
                var distance;
                switch(direction) {
                    case 'right':
                        if((this.currentSlide + 1) < this.totalSlides) {
                            distance = parseInt(this.strip.css('left').replace('px', ''), 10) - this.getFrameWidth();
                            this.currentSlide = this.currentSlide + 1;
                            console.log('CURRENT SLIDE:', this.currentSlide);
                        }
                        break;
                    case 'left':
                        if(this.currentSlide > 0) {
                            distance = parseInt(this.strip.css('left').replace('px', ''), 10) + this.getFrameWidth();
                            this.currentSlide = this.currentSlide - 1;
                            console.log('CURRENT SLIDE:', this.currentSlide);
                        }
                        break;
                    default:
                        distance = 0;
                        console.warn('Slidevs does not know in which direction to slide!');
                }
                this.strip.css({ 'left' : distance });
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

});