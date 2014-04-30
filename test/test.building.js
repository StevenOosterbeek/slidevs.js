module.exports = function(slidevs, fs, expect, should, sinon) {

    describe.skip('Building the Slidevs', function() {

        // Build/remove temporary test environment for each test
        before(function() {

            TestSlidevs = slidevs({
                name: 'Testing Slidevs',
                layout: 'test-layout.html',
                slidesFolder: '/testslides',
                styling: '/teststyling.css',
                scriptsFolder: '/testscripts',
                imagesFolder: '/testimages',
                controls: {
                    on: true,
                    password: 'testingSlidevs'
                },
                progressBar: true,
                port: 6987,
                logging: false
            });

            fs.writeFileSync('test/test-layout.html', '<!doctype html>\n<html>\n<head>\n<title></title>\n[## Assets ##]\n</head>\n<body>\n[## Slidevs ##]\n</body>\n</html>');
            fs.writeFileSync('test/teststyling.css', 'body { color: test; }');
            fs.mkdirSync('test/testslides');
            fs.mkdirSync('test/testscripts');
            fs.mkdirSync('test/testimages');
            fs.writeFileSync('test/testslides/slide-1.html', '<h1>Slide one</h1>');
            fs.writeFileSync('test/testslides/slide-2.html', '<h1>Slide two</h1>');
            fs.writeFileSync('test/testscripts/scriptOne.js', 'var testOne = "testOne";');
            fs.writeFileSync('test/testscripts/scriptTwo.js', 'var testTwo = "testTwo";');

        });

        after(function() {

            TestSlidevs = null;
            if(fs.exists('test/.slidevs')) fs.rmdirSync('test/.slidevs');

            fs.unlinkSync('test/testscripts/scriptTwo.js');
            fs.unlinkSync('test/testscripts/scriptOne.js');
            fs.unlinkSync('test/testslides/slide-2.html');
            fs.unlinkSync('test/testslides/slide-1.html');
            fs.rmdirSync('test/testimages');
            fs.rmdirSync('test/testscripts');
            fs.rmdirSync('test/testslides');
            fs.unlinkSync('test/teststyling.css');
            fs.unlinkSync('test/test-layout.html');

        });

        it('Should execute all necesarry building functions on start', function() {

            // Writing tests in progress!

        });

    });

};