#!/usr/bin/env node
'use strict'

const groupBy = require('lodash/groupBy')
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

const cleanedPositions = positions
.filter(pos => !!pos.position)
.filter(({position}) => position.latitude !== 0 || position.longitude !== 0)
.map(pos => ({
	t: pos.t,
	latitude: pos.position.latitude,
	longitude: pos.position.longitude
}))

console.log(cleanedPositions)
console.log(streakBy(cleanedPositions, pos => [pos.latitude, pos.longitude].join(':')))
