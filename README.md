# slidevs.js

*This module is currently under construction and is being developed within a two week school project!*

Slidevs.js is an open source presentation framework, based on Node. Create a nice HTML5 browser presentation which can be controlled from your mobile phone or tablet by simply writing a main layout and each slide as a individual .html file.

```javascript
var slidevs = require('./slidevs');

var firstSlidevs = slidevs({
        name: 'Stevens Slidev',
        layout: 'main-layout', // default
        slidesFolder: '/slides', // default
        styling: 'styling.css', // default
        scriptsFolder: '/scripts', // default
        port: 5000 // default
    });

firstSlidevs.start();
```

#### Future fixes
- Compressing styling and scripts
- Possibility for multiple styling files
- Adding images within the slides
