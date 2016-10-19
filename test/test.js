var R = require('ramda')
var test = require('tape').test
var Mininet = require('../mininet.js')

test('base parser open', function (t) {
    var net = [
        [[0], [1,2]],
        [[1,2], [3]]
    ]

    var p = new Mininet(net)
    t.pass('succesfully created a process instance')

    t.equal(p.places(), 4, 'should be four places')
    t.equal(p.transitions(), 2, 'should be two transitions')
    t.end()
})

test('initial/final transitions', function (t) {1
    var net = [
        [[], [0]],
        [[0], [1,2]],
        [[1,2], [3]],
        [[3], []]
    ]

    var p = new Mininet(net)
    t.pass('succesfully created a process instance')

    t.equal(p.places(), 4, 'should be four places')
    t.equal(p.transitions(), 4, 'should be four transitions')

    var c = p.creators()
    var a = p.annihilators()

    t.equal(R.length(c), 1, 'one creators transition')
    t.equal(R.length(a), 1, 'one annihilators transition')

    t.end()
})

test('dual function', function (t) {
  var net = [
    [[0], [1]],
    [[1], [2]],
    [[2], [3,4]]
  ]

  var n = new Mininet(net)
  t.deepEqual(n.place(0), [[], [0]], 'place-dual returns the right data')
  t.deepEqual(n.place(1), [[0], [1]], 'place-dual returns the right data')
  t.deepEqual(n.place(2), [[1], [2]], 'place-dual returns the right data')
  t.deepEqual(n.place(3), [[2], []], 'place-dual returns the right data')
  t.deepEqual(n.place(4), [[2], []], 'place-dual returns the right data')

  t.end()
})

test('signals in/out', function (t) {
    var net = [
        [[], [0, 7]],
        [[0,4], [1,2,8]],
        [[1,2,5], [3,9]],
        [[3,6], []]
    ]

    var n = new Mininet(net)
    t.pass('succesfully created a process instance')
    t.equal(n.places(), 10, 'should be ten places')
    t.equal(n.transitions(), 4, 'should be four transitions')

    t.deepEqual(n.creators(), [ 0 ], 'correct set of creators')
    t.deepEqual(n.annihilators(), [ 3 ], 'correct set of annihilators')
    t.deepEqual(n.emitters(), [ 7, 8, 9 ], 'correct set of emitters')
    t.deepEqual(n.receivers(), [ 4, 5, 6 ], 'correct set of receivers')

    t.end()
})
