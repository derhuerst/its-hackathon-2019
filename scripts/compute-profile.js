#!/usr/bin/env node
'use strict'

const minBy = require('lodash/minBy')
const maxBy = require('lodash/maxBy')
const assert = require('assert')
const pump = require('pump')
const {parse} = require('ndjson')
const {reduceStream, streakBy, exitWithError} = require('./lib')

const midBy = (arr, fn) => {
	const min = fn(minBy(arr, fn))
	const max = fn(maxBy(arr, fn))
	const mid = min + (max - min) / 2
	return minBy(arr, val => Math.abs(fn(val) - mid))
}

const vs = [[1],[1],[1],[1],[4],[7],[8]]
assert.equal(midBy(vs, val => val[0])[0], 4)

const collectCleanedPositions = (acc, {t, position}) => {
	if (!position) return;
	if (position.latitude === 0 || position.longitude === 0) return;
	acc.push({
		t,
		latitude: position.latitude,
		longitude: position.longitude
	})
}

const computeProfile = (cleanedPositions) => {
	const positionStreaks = streakBy(cleanedPositions, pos => [pos.latitude, pos.longitude].join(':'))
	return positionStreaks.map(streak => midBy(streak, pos => pos.t))
}

pump(
	process.stdin,
	parse(),
	reduceStream([], collectCleanedPositions, (cleanedPositions) => {
		const profile = computeProfile(cleanedPositions)

		process.stdout.write(JSON.stringify(profile) + '\n')
	}),
	(err) => {
		if (err) exitWithError(err)
	}
)
