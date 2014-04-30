var slidevs = require('./../index'),
    fs = require('fs'),
    expect = require('chai').expect,
    should = require('chai').should(),
    sinon = require('sinon');

require('./test.creation')(slidevs, expect, should);
require('./test.building')(slidevs, fs, expect, should, sinon);