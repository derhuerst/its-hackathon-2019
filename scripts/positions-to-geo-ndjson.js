#!/usr/bin/env node
'use strict'

const pump = require('pump')
const {parse, stringify} = require('ndjson')
const through = require('through2')
const {markerColor, exitWithError} = require('./lib')

pump(
	process.stdin,
	parse(),
	through.obj((res, _, cb) => {
		if (!res.position) return cb()

		cb(null, {
			type: 'Feature',
			properties: {
				...res,
				'marker-color': markerColor(res.journeyId),
				t: new Date(res.t * 1000).toISOString()
			},
			geometry: {
				type: 'Point',
				coordinates: [
					res.position.longitude,
					res.position.latitude
				]
			}
		})
	}),
	stringify(),
	process.stdout,
	(err) => {
		if (err) exitWithError(err)
	}
)
