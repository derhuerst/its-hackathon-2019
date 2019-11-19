#!/usr/bin/env node
'use strict'

const pump = require('pump')
const {parse} = require('ndjson')
const {reduceStream, exitWithError} = require('./lib')

const isDelayed = delay => Math.abs(delay) > 90

const delay = (timeTarget, timeActual) => {
	return (new Date(timeActual) - new Date(timeTarget)) / 1000 | 0
}

const collectDelaysByJourneyId = (delaysByJourneyId, rawFahrt) => {
	for (const rawSegment of rawFahrt.segments) {
		const dep = rawSegment.departure
		const arr = rawSegment.arrival
		if (!dep || !arr) return;

		if (delaysByJourneyId.has(rawFahrt.journeyID)) {
			delaysByJourneyId.get(rawFahrt.journeyID).push(
				delay(dep.timeTarget, dep.timeActual),
				delay(arr.timeTarget, arr.timeActual)
			)
		} else {
			delaysByJourneyId.set(rawFahrt.journeyID, [
				delay(dep.timeTarget, dep.timeActual),
				delay(arr.timeTarget, arr.timeActual)
			])
		}
	}
}

pump(
	process.stdin,
	parse(),
	reduceStream(new Map(), collectDelaysByJourneyId, (groupedDelays) => {
		for (const [journeyId, delays] of groupedDelays.entries()) {
			if (!delays.some(isDelayed)) {
				process.stdout.write(journeyId + '\n')
				process.exit(0)
			}
		}
	}),
	(err) => {
		if (err) exitWithError(err)
	}
)
