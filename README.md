# slidevs.js

*This module is currently under construction and is being developed within a two week school project, and is therefor far from done*

Slidev.js is an open source presentation framework, based on Node. Create a nice HTML5 presentation which can be controlled from your mobile phone by only writing maximum 10 lines of code, without the layout and slides included.

To use slidevs:

```javascript
var slidevs = require('slidevs');

var firstSlidevs = slidevs({
        name: 'Stevens Slidev',
        layout: 'main-layout',
        slidesFolder: '/slides'
    });

firstSlidevs.start();
```

### Future bugfixes
- Order of slides within slides folder