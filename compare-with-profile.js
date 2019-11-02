#!/usr/bin/env node
'use strict'

const minBy = require('lodash/minBy')
const absProfile = require('./profile.json')
const absPositions = require('./ist-positions.json')

const t0 = absProfile[0].t

const profile = absProfile.map(pos => ({...pos, t: pos.t - t0}))

const positions = absPositions
.filter(({t}) => t >= t0)
.map(pos => ({...pos, t: pos.t - t0}))
console.error(positions)

const abgeschmiert = (profile) => ({t: tIst, latitude, longitude}) => {
	const lower = profile.filter(({t}) => t < tIst)
	const lowerBound = minBy(lower, ({t}) => tIst - t)
	const greater = profile.filter(({t}) => t >= tIst)
	const upperBound = minBy(greater, ({t}) => tIst - t)

	console.error(lowerBound, tIst, upperBound)
	// todo
}

abgeschmiert(profile)(positions[0])
