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

const collectPositions = (acc, {t, position, journeyId}) => {
	if (!position) return;
	if (position.latitude === 0 || position.longitude === 0) return;
	if (!journeyId) return;

	acc.fahrtId = journeyId
	acc.positions.push({
		t,
		latitude: position.latitude,
		longitude: position.longitude
	})
}

const computeProfileSamples = (positions) => {
	const positionStreaks = streakBy(positions, pos => [pos.latitude, pos.longitude].join(':'))
	const absProfile = positionStreaks.map(streak => midBy(streak, pos => pos.t))

	const t0 = absProfile[0].t
	return absProfile.map(pos => ({...pos, tAbs: pos.t, t: pos.t - t0}))
}

pump(
	process.stdin,
	parse(),
	reduceStream({fahrtId: null, positions: []}, collectPositions, ({fahrtId, positions}) => {
		const profile = {
			fahrtId,
			samples: computeProfileSamples(positions)
		}

		process.stdout.write(JSON.stringify(profile) + '\n')
	}),
	(err) => {
		if (err) exitWithError(err)
	}
)
