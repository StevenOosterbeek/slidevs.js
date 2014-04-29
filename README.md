# slidevs.js

Slidevs.js is an open source presentation framework. Create a nice HTML5 browser presentation which can be controlled from your mobile phone or tablet by simply writing a main layout and each slide as a individual .html file. Further documentation will follow.

```javascript
var slidevs = require('slidevs');

var exampleSlidevs = slidevs({
        name: 'Example Slidevs',
        layout: 'main-layout', // What is the filename of your main layout?
        slidesFolder: '/slides', // Where are your slides located?
        styling: 'styling.css', // What is the filename of your css file?
        scriptsFolder: '/scripts', // Where are your scripts located?
        imagesFolder: '/images', // Where are your images located?
        controls: {
            on: true, // Do you want to enable controls for your Slidevs?
            password: 'slidevs' // Do you want to secure your Slidevs with a password?
        },
        progressBar: true, // Do you want Slidevs to show a progress bar at the top?
        port: 5000 // On which port should your Slidevs start?
    });

exampleSlidevs.start();
```

#### Future fixes
- Optimizing drawing line
- White bottom stroke on phone in landscape mode..
- Download notes to mobile devices?