#!/usr/bin/env node
'use strict'

const {parse} = require('ndjson')
const {Writable} = require('stream')

const isDelayed = delay => Math.abs(delay) > 90

const delay = (timeTarget, timeActual) => {
	return (new Date(timeActual) - new Date(timeTarget)) / 1000 | 0
}
const readDelaysByJourneyId = (done) => {
	const delaysByJourneyId = new Map()
	const writeSample = (rawFahrt) => {
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

	return new Writable({
		objectMode: true,
		write: (rawFahrt, _, cb) => {
			writeSample(rawFahrt)
			cb(null)
		},
		writev: (chunks, _, cb) => {
			for (const {chunk: rawFahrt} of chunks) {
				writeSample(rawFahrt)
			}
			cb(null)
		},
		final: (cb) => {
			done(delaysByJourneyId)
			cb()
		}
	})
}

process.stdin
.pipe(parse())
.pipe(readDelaysByJourneyId((groupedDelays) => {
	for (const [journeyId, delays] of groupedDelays.entries()) {
		if (!delays.some(isDelayed)) {
			process.stdout.write(journeyId + '\n')
			process.exit(0)
		}
	}
}))
