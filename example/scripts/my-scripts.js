/*
    You can add your own JavaScript files in this folder, in order to add functionality to your slides.
*/

var paragraph = $('p.interactive'),
    done = true;

$('span.interactive').click(function() {
    done = !done;
    switch(done) {
        case false: paragraph.css({ 'margin-top' : '10em' }); break;
        case true: paragraph.css({ 'margin-top' : '2em' }); break;
        default: paragraph.css({ 'margin-top' : '2em' });
    }
});