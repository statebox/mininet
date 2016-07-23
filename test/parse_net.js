var R = require('ramda')
var test = require('tape').test
var Mininet = require('../mininet.js')
var unique = require('ramda').uniq

test('gap function', function (t) {
    t.false(Mininet.gaps([0,1,2]), '0,1,2 has no gaps')
    // duplicates are handled by ensuring only uniques are passed
    t.false(Mininet.gaps(unique([0,1,1,2])), '0,1,1,2 has no gaps')
    t.false(Mininet.gaps([1,2,0]), '1,2,0 has no gaps')
    t.false(Mininet.gaps([]), 'empty set has no gaps')
    t.false(Mininet.gaps([0]), 'singleton 0 set has no gaps')
    t.true(Mininet.gaps([1]), '1 has a gap (no zero)')
    t.true(Mininet.gaps([1,2,3]), '1 2 3 has a gap (no zero)')
    t.true(Mininet.gaps([0,2,3]), '0 to 3 without 1 has a gap')
    t.end()
})

test('base parser open', function (t) {
    var net = [
        [[0], [1,2]],
        [[1,2], [3]]
    ]

    var p = new Mininet({Net: net})
    t.pass('succesfully created a process instance')

    t.equal(p.placeCount(), 4, 'should be four places')
    t.equal(p.transitionCount(), 2, 'should be two transitions')
    t.end()
})

test('initial/final transitions', function (t) {
    var net = [
        [[], [0]],
        [[0], [1,2]],
        [[1,2], [3]],
        [[3], []]
    ]

    var p = new Mininet({Net: net})
    t.pass('succesfully created a process instance')

    t.equal(p.placeCount(), 4, 'should be four places')
    t.equal(p.transitionCount(), 4, 'should be four transitions')

    var c = p.creators()
    var a = p.annihilators()

    t.equal(R.length(c), 1, 'one creators transition')
    t.equal(R.length(a), 1, 'one annihilators transition')

    t.deepEqual(c[0], [[],[0]], 'the correct creator')
    t.deepEqual(a[0], [[3],[]], 'the correct annihilator')

    t.end()
})

test('place function', function (t) {
    "use strict";
    var net = [
        [[], [0]],
        [[0], [1,2]],
        [[1,2], [3]],
        [[3], []]
    ]
    var p = new Mininet({Net: net})

    R.forEach(function (i) {
        t.deepEqual(p.place(i), {id: i, kind: 'place'}, "returns correct place")
    }, R.range(0, p.placeCount()))

    R.forEach(function (i) {
        t.deepEqual(p.transition(i), {
            id: i, kind: 'transition',
            pre: R.map(p.place.bind(p), R.head(net[i])),
            post: R.map(p.place.bind(p), R.last(net[i])),
        }, "returns correct transition")
    }, R.range(0, p.transitionCount()))

    t.end()
})

test('dual function', function (t) {
    "use strict";

    var net = [ [[0],[1]], [[1],[2]], [[2],[3,4]] ]
    var placeDual = Mininet.dual(net)
    t.end()
})


test('signals in/out', function (t) {
    var net = [
        [[], [0, 7]],
        [[0,4], [1,2,8]],
        [[1,2,5], [3,9]],
        [[3,6], []]
    ]

    var p = new Mininet({Net: net})
    t.pass('succesfully created a process instance')

    t.equal(p.placeCount(), 10, 'should be ten places')
    t.equal(p.transitionCount(), 4, 'should be four transitions')

    var r = p.receivers()
    var e = p.annihilators()

    t.equal(R.length(r), 3, 'three receiver places')
    t.equal(R.length(e), 3, 'three emitter places')

    t.equal(r, [4, 5, 6], 'the correct receiver')
    t.equal(e, [7, 8, 9], 'the correct emitter')

    t.end()
})