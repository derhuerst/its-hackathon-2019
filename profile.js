#!/usr/bin/env node
'use strict'

const groupBy = require('lodash/groupBy')
const minBy = require('lodash/minBy')
const maxBy = require('lodash/maxBy')
const assert = require('assert')
const positions = require('./reference-positions.json')

const streakBy = (arr, fn) => arr.reduce(({acc, last}, val) => {
	const cmp = fn(val)
	if (cmp === last) {
		const group = acc[acc.length - 1]
		group.push(val)
		return {acc, last: cmp}
	}
	return {
		acc: [...acc, [val]],
		last: cmp
	}
}, {acc: [], last: NaN}).acc

const midBy = (arr, fn) => {
	const min = fn(minBy(arr, fn))
	const max = fn(maxBy(arr, fn))
	const mid = min + (max - min) / 2
	return minBy(arr, val => Math.abs(fn(val) - mid))
}

const vs = [[1],[1],[1],[1],[4],[7],[8]]
assert.equal(midBy(vs, val => val[0])[0], 4)

const cleanedPositions = positions
.filter(pos => !!pos.position)
.filter(({position}) => position.latitude !== 0 || position.longitude !== 0)
.map(pos => ({
	t: pos.t,
	latitude: pos.position.latitude,
	longitude: pos.position.longitude
}))
console.error(cleanedPositions)

const positionStreaks = streakBy(cleanedPositions, pos => [pos.latitude, pos.longitude].join(':'))
console.error(positionStreaks)

const profile = positionStreaks.map(streak => midBy(streak, pos => pos.t))
console.error(profile)

process.stdout.write(JSON.stringify(profile) + '\n')
