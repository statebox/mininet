var R = require('ramda')

var uniqPlaces = R.compose(R.uniq,R.unnest,R.unnest)
var hasNegative= R.compose(R.not, R.equals(0), R.reduce(R.min, 0))

function gaps (uniquePlaces) {
    if (hasNegative(uniquePlaces)) {
        throw Error('Calling `gaps(xs)` with negatie numbers in xs is undefined')
    }
    var n = R.length(uniquePlaces) - 1

    // empty set has no gaps
    if (n == -1) { return false }

    var s = R.sum(uniquePlaces)
    var t = n * (n + 1) / 2 // if consequtive, this is what it should be
    return Math.abs(s - t) >= 0.1
}

var mapIndexed = R.addIndex(R.map)
var onlyIds = function (predicate) {
    return R.compose(R.unnest, mapIndexed(function (transition, id) {
        return predicate(transition) ? [id] : []
    }))
}

// TODO speed up at some point (SQLite / Lovefield style?)
// pick the place dual in a transition centric net
// ()->[]->()   <==>   []->()->[]
var dual = R.curry(function (net, placeId) {
    "use strict";
    // Transition -> nodelist
    var is_adjacent = R.contains(placeId)
    var is_pre = R.compose(is_adjacent, R.head)
    var pre = onlyIds(is_pre)
    var is_post = R.compose(is_adjacent, R.last)
    var post = onlyIds(is_post)
    return [pre(net), post(net)]
})

function Mininet  (netSpecification) {
    // check that we get a list of transitions
    var net = netSpecification.Net

    if (R.not(net) || (R.not(R.isArrayLike(net)))) {
        throw Error('Must specify a net, key `Net`')
    } else {
        this._transitions = net
    }

    var places = uniqPlaces(net)
    if (gaps(places)) {
        throw Error('specification has gaps')
    } else {
        this._places = R.map(dual(net), R.range(0, R.length(places)))
    }
}

Mininet.prototype.placeCount = function () {
    return R.length(this._places)
}
Mininet.prototype.transitionCount = function () {
    return R.length(this._transitions)
}

Mininet.prototype.creators = function () {
    "use strict";
    return R.filter(function (t) {
        return R.length(t[0]) === 0
    }, this._transitions)
}

Mininet.prototype.annihilators = function () {
    "use strict";
    return R.filter(function (t) {
        return R.length(t[1]) === 0
    }, this._transitions)
}

function ensureRange(a, x, b, msg) {
    "use strict";
    if((a > x) || (x >= b)) {
        throw Error(msg)
    }
}

Mininet.prototype.place = function (placeId) {
    ensureRange(0, placeId, this.placeCount(), 'place id out of range')
    "use strict";
    return {
        id: placeId,
        kind: "place"
    }
}

Mininet.prototype.transition = function (transitionId) {
    "use strict";
    ensureRange(0, transitionId, this.transitionCount(), 'transition id out of range')
    var t = this._transitions[transitionId]
    return {
        id: transitionId,
        kind: 'transition',
        pre: R.map(this.place.bind(this), t[0]),
        post: R.map(this.place.bind(this), t[1])
    }
}

Mininet.prototype.transitions = function () {
    "use strict";
    return R.map(this.transition.bind(this), R.range(0, this.transitionCount()))
}

Mininet.prototype.places = function () {
    "use strict";
    return R.map(this.place.bind(this), R.range(0, this.placeCount()))
}



Mininet.prototype.receivers = function () {
    "use strict";
    return R.filter(function (t) {
        return R.length(t[0]) === 0
    }, this._places)
}

Mininet.prototype.emitters = function () {
    "use strict";
    return R.filter(function (t) {
        return R.length(t[1]) === 0
    }, this._places)
}

module.exports = Mininet

// for testing
Mininet.gaps = gaps
Mininet.dual = dual