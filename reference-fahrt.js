#!/usr/bin/env node
'use strict'

const groupBy = require('lodash/groupBy')
const raw = require('./trips.json')

const sampleDelays = samples => {
	return samples
	.flatMap(sample => sample.segments)
	.flatMap(segment => {
		return [segment.departure, segment.arrival]
	})
	.map(({timeActual, timeTarget}) => {
		return (new Date(timeActual) - new Date(timeTarget)) / 1000 | 0
	})
}

const sampleGroups = Object.values(groupBy(raw, 'journeyID'))
.map(group => {
	return {
		journeyId: group[0].journeyID,
		delays: sampleDelays(group)
	}
})

const isDelayed = delay => Math.abs(delay) > 90

const validFahrts = sampleGroups.filter(group => !group.delays.some(isDelayed))

console.log(validFahrts[1].journeyId)
