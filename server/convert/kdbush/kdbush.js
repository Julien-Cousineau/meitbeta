'use strict';

var sort = require('./sort');
var range = require('./range');
var within = require('./within');

module.exports = kdbush;

function kdbush(x,y, nodeSize) {
    return new KDBush(x,y, nodeSize);
}

function KDBush(x,y, nodeSize) {

    this.nodeSize = nodeSize || 64;
    this.ids = new Uint32Array(x.length);
    this.coords = new Float32Array(x.length * 2);

    for (var i = 0; i < x.length; i++) {
        this.ids[i] = i;
        this.coords[2 * i] = x[i];
        this.coords[2 * i + 1] = y[i];
    }

    sort(this.ids, this.coords, this.nodeSize, 0, this.ids.length - 1, 0);
}

KDBush.prototype = {
    range: function (minX, minY, maxX, maxY) {
        return range(this.ids, this.coords, minX, minY, maxX, maxY, this.nodeSize);
    },

    within: function (x, y, r) {
        return within(this.ids, this.coords, x, y, r, this.nodeSize);
    }
};

function defaultGetX(p) { return p[0]; }
function defaultGetY(p) { return p[1]; }
