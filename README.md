# slidevs.js

Slidevs.js is an open source presentation framework. Create a nice HTML5 browser presentation which can be controlled from your mobile phone or tablet by simply writing a main layout and each slide as a individual .html file. Further documentation will follow.

```javascript
var slidevs = require('./slidevs');

var firstSlidevs = slidevs({
        name: 'Stevens Slidevs',
        layout: 'main-layout', // default
        slidesFolder: '/slides', // default
        styling: 'styling.css', // default
        scriptsFolder: '/scripts', // default
        imagesFolder: '/images', // default
        controls: {
            on: true, // default
            password: 'slidevs' // default is false - no auth required
        },
        progressBar: true, // default
        port: 5000 // default
    });

firstSlidevs.start();
```

#### Future fixes
- White bottom stroke on phone in landscape mode..
- Download notes to mobile devices?