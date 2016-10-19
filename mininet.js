'use strict'

var R = require('ramda')

const isPermutation = require('is-permutation')

const pre = id => R.compose(R.contains(id), R.head)
const post = id => R.compose(R.contains(id), R.last)

const findAll = R.curry((pred, xs) => R.unnest(R.addIndex(R.map)((x, i) => pred(x) ? [i] : [], xs)))

function Mininet (net) {
  // check that we get a list of transitions
  if (R.not(net) || (R.not(R.isArrayLike(net)))) {
    throw Error('Must specify a net')
  }

  // compute unique place id's and check if it is a permutation of 0..n
  const places = R.compose(R.uniq, R.unnest, R.unnest)(net)
  if (!isPermutation(places)) {
    throw Error(`Net specification invalid,
      place id not permutation of 0..n`)
  }

  // see pre/post transitions to place `i`
  function viewPlace (i) {
    const transitions = predicate => findAll(predicate(i), net)
    return R.map(transitions, [post, pre])
  }

  const sortedPlaceIds = R.range(0, R.length(places))
  this._places = R.map(viewPlace, sortedPlaceIds)
  this._transitions = net
}

function ensureRange (a, x, b, msg) {
  if ((a > x) || (x >= b)) {
    throw Error(msg)
  }
}

Mininet.prototype.places = function () {
  return R.length(this._places)
}

Mininet.prototype.transitions = function () {
  return R.length(this._transitions)
}

Mininet.prototype.transition = function (i) {
  this.ensureValidTransitionId(i)
  return this._transitions[i]
}

Mininet.prototype.ensureValidPlaceId = function (i) {
  const p = this.places()
  ensureRange(0, i, p, 'place identifier out of range, 0 .. ' + p - 1)
}

Mininet.prototype.ensureValidTransitionId = function (i) {
  const t = this.transitions()
  ensureRange(0, i, t, 'transition identifier out of range, 0 .. ' + t - 1)
}

Mininet.prototype.place = function (i) {
  this.ensureValidPlaceId(i)
  return this._places[i]
}

const emptyPre = R.compose(R.isEmpty, R.head)
const emptyPost = R.compose(R.isEmpty, R.last)

Mininet.prototype.creators = function () {
  return findAll(emptyPre, this._transitions)
}

Mininet.prototype.annihilators = function () {
  return findAll(emptyPost, this._transitions)
}

Mininet.prototype.receivers = function () {
  return findAll(emptyPre, this._places)
}

Mininet.prototype.emitters = function () {
  return findAll(emptyPost, this._places)
}

module.exports = Mininet
