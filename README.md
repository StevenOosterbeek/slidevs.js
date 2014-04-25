# slidevs.js

Slidevs.js is an open source presentation framework. Create a nice HTML5 browser presentation which can be controlled from your mobile phone or tablet by simply writing a main layout and each slide as a individual .html file. Further documentation will follow.

```javascript
var slidevs = require('./slidevs');

// All options are also default, except the name of course
var firstSlidevs = slidevs({
        name: 'Stevens Slidevs',
        layout: 'main-layout', // Main layout, where every slide is being concatenated in
        slidesFolder: '/slides', // Folder where all your slides are located
        styling: 'styling.css', // CSS file for styling your slides
        scriptsFolder: '/scripts', // Folder where all your scripts are located
        imagesFolder: '/images', // Folder where all your images are located
        controls: {
            on: true, // Enable controls from any mobile device
            password: 'slidevs' // Secure your Slidevs with a password
        },
        progressBar: true, // Show a progress bar at the top of the screen
        port: 5000 // Port on which Slidevs starts the server
    });

firstSlidevs.start();
```

#### Future fixes
- White bottom stroke on phone in landscape mode..
- Download notes to mobile devices?