#!/usr/bin/env node
'use strict'

const data = require('./trips.json')

const sampleHasNoDelays = sample => {
	return !sample.segments
	.flatMap(segment => {
		return [segment.departure, segment.arrival]
	})
	.map(({timeActual, timeTarget}) => {
		return (new Date(timeActual) - new Date(timeTarget)) / 1000 | 0
	})
	.some(delay => 30)
}

// todo