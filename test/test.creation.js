module.exports = function(slidevs, expect, should) {

    describe('Creating a new Slidevs', function() {

        it('Should return a Slidevs object', function() {

            var testSlidevs = slidevs();

            testSlidevs.should.be.a('object');
            testSlidevs.start.should.be.a('function');
            testSlidevs.isRunning.should.be.a('function');
            testSlidevs.isNowRunning.should.be.a('function');
            testSlidevs.address.should.be.a('string');
            testSlidevs.thisFolder.should.be.a('string');
            testSlidevs.hiddenFolder.should.be.a('string');

        });

        it('Should create a Slidevs with default values when created without any options', function() {

            var testSlidevs = slidevs();

            testSlidevs.name.should.equal('Slidevs Presentation');
            testSlidevs.trimmedName.should.equal('slidevs-presentation');
            testSlidevs.layout.should.equal('main-layout.html');
            testSlidevs.slidesFolder.should.equal('/slides');
            testSlidevs.styling.should.equal('styling.css');
            testSlidevs.scriptsFolder.should.equal('/scripts');
            testSlidevs.imagesFolder.should.equal('/images');
            testSlidevs.controls.should.equal(true);
            testSlidevs.password.should.equal(false);
            testSlidevs.progressBar.should.equal(true);
            testSlidevs.port.should.equal(5000);
            testSlidevs.socketPort.should.equal(5001);

        });

        it('Should create a Slidevs with the right inserted options', function() {

            // With slashes and extentions
            var testSlidevsWith = slidevs({
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
                port: 6987
            });

            testSlidevsWith.name.should.equal('Testing Slidevs');
            testSlidevsWith.trimmedName.should.equal('testing-slidevs');
            testSlidevsWith.layout.should.equal('test-layout.html');
            testSlidevsWith.slidesFolder.should.equal('/testslides');
            testSlidevsWith.styling.should.equal('teststyling.css');
            testSlidevsWith.scriptsFolder.should.equal('/testscripts');
            testSlidevsWith.imagesFolder.should.equal('/testimages');
            testSlidevsWith.controls.should.equal(true);
            testSlidevsWith.password.should.equal('testingSlidevs');
            testSlidevsWith.progressBar.should.equal(true);
            testSlidevsWith.port.should.equal(6987);
            testSlidevsWith.socketPort.should.equal(6988);

            // Without slashes and extentions
            var testSlidevsWithout = slidevs({
                name: 'Example Slidevs',
                layout: 'test-layout',
                slidesFolder: 'testslides',
                styling: 'teststyling',
                scriptsFolder: 'testscripts',
                imagesFolder: 'testimages',
                controls: {
                    on: false,
                    password: false
                },
                progressBar: false,
                port: 3030
            });

            testSlidevsWithout.name.should.equal('Example Slidevs');
            testSlidevsWithout.trimmedName.should.equal('example-slidevs');
            testSlidevsWithout.layout.should.equal('test-layout.html');
            testSlidevsWithout.slidesFolder.should.equal('/testslides');
            testSlidevsWithout.styling.should.equal('teststyling.css');
            testSlidevsWithout.scriptsFolder.should.equal('/testscripts');
            testSlidevsWithout.imagesFolder.should.equal('/testimages');
            testSlidevsWithout.controls.should.equal(false);
            testSlidevsWithout.password.should.equal(false);
            testSlidevsWithout.progressBar.should.equal(false);
            testSlidevsWithout.port.should.equal(3030);
            testSlidevsWithout.socketPort.should.equal(3031);

        });

        it('Should contain the right (IP) address of the current machine', function() {

            var testSlidevs = slidevs();
                goodAddress = (require('os').networkInterfaces().en1 !== undefined ? require('os').networkInterfaces().en1[1].address : 'http://localhost');

            testSlidevs.address.should.equal(goodAddress);

        });

        it('Should say the Slidevs is not running (yet)', function() {

            var testSlidevs = slidevs();
            expect(testSlidevs.isRunning()).to.equal(false);

        });

        it('Should contain the right paths for the current folder and the hidden Slidevs folder', function() {

            var testSlidevs = slidevs(),
                thisFolder = require('path').dirname(module.parent.filename),
                hiddenFolder = require('path').join(require('path').dirname(module.parent.filename), '.slidevs');

            testSlidevs.thisFolder.should.equal(thisFolder);
            testSlidevs.hiddenFolder.should.equal(hiddenFolder);

        });

    });

};